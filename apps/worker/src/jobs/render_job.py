"""
Render Job Manager — Background task wrapper with Redis progress reporting,
cancellation support, and webhook notifications.
"""

import asyncio
import logging
import time
import os
from typing import Dict, Any, Optional, List
from pipelines.render_pipeline import RenderPipeline, PipelineCancelled
from schemas.pipeline import RenderSettings, JobStatus, PipelineStage
from config.config import settings

logger = logging.getLogger(__name__)


# ── Redis Helper ───────────────────────────────────────────────────────

class RedisProgressReporter:
    """Publishes job progress to Redis Pub/Sub and stores status in Redis hash."""

    def __init__(self):
        self._redis = None

    async def _get_redis(self):
        if self._redis is None:
            try:
                import redis.asyncio as aioredis
                self._redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
                await self._redis.ping()
                logger.info("Redis progress reporter connected")
            except Exception as e:
                logger.warning(f"Redis not available for progress reporting: {e}")
                self._redis = None
        return self._redis

    async def publish_progress(self, project_id: str, progress: float, message: str, stage: str = ""):
        """Publishes progress to Redis Pub/Sub channel."""
        r = await self._get_redis()
        if r is None:
            return

        try:
            import json
            payload = json.dumps({
                "project_id": project_id,
                "progress": progress,
                "message": message,
                "stage": stage,
                "timestamp": time.time(),
            })
            await r.publish(f"render:progress:{project_id}", payload)
            await r.hset(f"render:status:{project_id}", mapping={
                "progress": str(progress),
                "message": message,
                "stage": stage,
            })
        except Exception as e:
            logger.debug(f"Redis publish failed: {e}")

    async def publish_complete(self, project_id: str, output_url: str, duration: float, file_size: int):
        r = await self._get_redis()
        if r is None:
            return

        try:
            import json
            payload = json.dumps({
                "project_id": project_id,
                "status": "completed",
                "output_url": output_url,
                "duration": duration,
                "file_size": file_size,
            })
            await r.publish(f"render:complete:{project_id}", payload)
            await r.hset(f"render:status:{project_id}", mapping={
                "progress": "100",
                "message": "Render complete",
                "stage": "complete",
                "status": "completed",
                "output_url": output_url,
            })
        except Exception as e:
            logger.debug(f"Redis publish failed: {e}")

    async def publish_error(self, project_id: str, error: str):
        r = await self._get_redis()
        if r is None:
            return

        try:
            import json
            payload = json.dumps({
                "project_id": project_id,
                "status": "failed",
                "error": error,
            })
            await r.publish(f"render:error:{project_id}", payload)
            await r.hset(f"render:status:{project_id}", mapping={
                "status": "failed",
                "error": error,
            })
        except Exception as e:
            logger.debug(f"Redis publish failed: {e}")

    async def close(self):
        if self._redis:
            await self._redis.close()


# ── Webhook Notifier ───────────────────────────────────────────────────

class WebhookNotifier:
    """Sends HTTP webhooks to the API server on job status changes."""

    def __init__(self, api_url: str = None):
        self.api_url = api_url or os.getenv("API_WEBHOOK_URL", "http://localhost:4000/v1/webhooks/render")

    async def notify(self, project_id: str, status: str, data: Dict[str, Any] = None):
        try:
            import aiohttp
            payload = {
                "project_id": project_id,
                "status": status,
                **(data or {}),
            }
            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, json=payload, timeout=aiohttp.ClientTimeout(total=10)):
                    pass
            logger.debug(f"Webhook sent: {status} for {project_id}")
        except ImportError:
            logger.debug("aiohttp not available for webhooks, skipping")
        except Exception as e:
            logger.debug(f"Webhook failed (non-critical): {e}")


# ── Render Job ─────────────────────────────────────────────────────────

class RenderJob:
    def __init__(self, project_id: str, manga_path: str, audio_path: str, job_settings: Dict[str, Any]):
        self.project_id = project_id
        self.manga_path = manga_path
        self.audio_path = audio_path

        # Parse settings robustly
        try:
            self.settings = RenderSettings(**job_settings) if job_settings else RenderSettings()
        except Exception:
            self.settings = RenderSettings()

        self.pipeline = RenderPipeline()
        self.status: JobStatus = JobStatus.QUEUED
        self.progress: float = 0.0
        self.result_url: Optional[str] = None
        self.error: Optional[str] = None
        self.started_at: Optional[float] = None
        self.completed_at: Optional[float] = None

        self._redis_reporter = RedisProgressReporter()
        self._webhook = WebhookNotifier()

    async def run(self):
        """Runs the render job asynchronously."""
        self.started_at = time.time()

        try:
            self.status = JobStatus.PROCESSING
            logger.info(f"Starting job for project {self.project_id}")

            # Notify start
            await self._webhook.notify(self.project_id, "processing")

            # Progress callback that reports to Redis + local state
            async def _progress_update(prog: float, msg: str):
                self.progress = prog
                logger.info(f"Job {self.project_id} progress: {prog:.1f}% - {msg}")
                await self._redis_reporter.publish_progress(self.project_id, prog, msg)

            def progress_sync(prog: float, msg: str):
                self.progress = prog
                logger.info(f"Job {self.project_id} progress: {prog:.1f}% - {msg}")
                # Fire-and-forget async publish
                try:
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        asyncio.create_task(
                            self._redis_reporter.publish_progress(self.project_id, prog, msg)
                        )
                except Exception:
                    pass

            result = await self.pipeline.execute(
                project_id=self.project_id,
                manga_path=self.manga_path,
                audio_path=self.audio_path,
                settings=self.settings,
                progress_callback=progress_sync,
            )

            self.completed_at = time.time()

            if result.status == JobStatus.CANCELLED:
                self.status = JobStatus.CANCELLED
                self.error = "Cancelled"
                await self._webhook.notify(self.project_id, "cancelled")
                return

            self.status = JobStatus.COMPLETED
            self.progress = 100.0
            self.result_url = result.output_path

            elapsed = self.completed_at - self.started_at
            logger.info(f"Job {self.project_id} completed in {elapsed:.1f}s: {self.result_url}")

            # Notify completion
            await self._redis_reporter.publish_complete(
                self.project_id,
                self.result_url or "",
                result.duration_seconds or elapsed,
                result.file_size_bytes or 0,
            )
            await self._webhook.notify(self.project_id, "completed", {
                "output_url": self.result_url,
                "duration": result.duration_seconds,
            })

        except PipelineCancelled:
            self.status = JobStatus.CANCELLED
            self.error = "Cancelled by user"
            logger.info(f"Job {self.project_id} cancelled")
            await self._webhook.notify(self.project_id, "cancelled")

        except Exception as e:
            self.status = JobStatus.FAILED
            self.error = str(e)
            self.completed_at = time.time()
            logger.error(f"Job {self.project_id} failed: {e}")

            await self._redis_reporter.publish_error(self.project_id, str(e))
            await self._webhook.notify(self.project_id, "failed", {"error": str(e)})
            raise

        finally:
            await self._redis_reporter.close()

    def cancel(self):
        """Cancels the running pipeline."""
        self.pipeline.cancel()
        self.status = JobStatus.CANCELLED
        logger.info(f"Job {self.project_id} cancel requested")


# ── Job Manager ────────────────────────────────────────────────────────

class JobManager:
    """In-memory job manager for local development. Replace with Celery/BullMQ for production."""

    _jobs: Dict[str, RenderJob] = {}

    @classmethod
    def create_job(cls, project_id: str, manga_path: str, audio_path: str, job_settings: Dict[str, Any]) -> str:
        # Cancel existing job for same project if still running
        if project_id in cls._jobs:
            existing = cls._jobs[project_id]
            if existing.status == JobStatus.PROCESSING:
                existing.cancel()

        job = RenderJob(project_id, manga_path, audio_path, job_settings)
        cls._jobs[project_id] = job

        # Start the job in the background
        asyncio.create_task(job.run())
        logger.info(f"Job created and queued: {project_id}")
        return project_id

    @classmethod
    def get_job_status(cls, project_id: str) -> Dict[str, Any]:
        job = cls._jobs.get(project_id)
        if not job:
            return {"status": "not_found"}

        return {
            "project_id": job.project_id,
            "status": job.status.value,
            "progress": job.progress,
            "result_url": job.result_url,
            "error": job.error,
            "started_at": job.started_at,
            "completed_at": job.completed_at,
        }

    @classmethod
    def cancel_job(cls, project_id: str) -> Dict[str, Any]:
        job = cls._jobs.get(project_id)
        if not job:
            return {"status": "not_found"}

        if job.status not in (JobStatus.PROCESSING, JobStatus.QUEUED):
            return {
                "status": job.status.value,
                "error": "Cannot cancel a finished job",
            }

        job.cancel()
        return {"status": "cancelled", "project_id": project_id}

    @classmethod
    def list_jobs(cls) -> List[Dict[str, Any]]:
        return [cls.get_job_status(pid) for pid in cls._jobs]
