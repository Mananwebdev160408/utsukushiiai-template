import asyncio
import logging
from typing import Dict, Any
from src.pipelines.render_pipeline import RenderPipeline
from src.schemas.pipeline import RenderSettings
import os

logger = logging.getLogger(__name__)

class RenderJob:
    def __init__(self, project_id: str, manga_path: str, audio_path: str, settings: Dict[str, Any]):
        self.project_id = project_id
        self.manga_path = manga_path
        self.audio_path = audio_path
        self.settings = RenderSettings(**settings)
        self.pipeline = RenderPipeline()
        self.status = "queued"
        self.progress = 0.0
        self.result_url = None
        self.error = None

    async def run(self):
        """Runs the render job asynchronously."""
        try:
            self.status = "processing"
            logger.info(f"Starting job for project {self.project_id}")
            
            def progress_update(prog: float, msg: str):
                self.progress = prog
                logger.info(f"Job {self.project_id} progress: {prog}% - {msg}")
                # In a real setup, we would update Redis/DB here
            
            result_path = await self.pipeline.execute(
                project_id=self.project_id,
                manga_path=self.manga_path,
                audio_path=self.audio_path,
                settings=self.settings,
                progress_callback=progress_update
            )
            
            self.status = "completed"
            self.progress = 100.0
            self.result_url = result_path
            logger.info(f"Job {self.project_id} completed successfully: {result_path}")
            
        except Exception as e:
            self.status = "failed"
            self.error = str(e)
            logger.error(f"Job {self.project_id} failed: {e}")
            # Raise or handle depending on retry logic
            raise

# Simple job manager for in-memory tracking (for local dev)
class JobManager:
    _jobs: Dict[str, RenderJob] = {}

    @classmethod
    def create_job(cls, project_id: str, manga_path: str, audio_path: str, settings: Dict[str, Any]) -> str:
        job = RenderJob(project_id, manga_path, audio_path, settings)
        cls._jobs[project_id] = job
        # Start the job in the background
        asyncio.create_task(job.run())
        return project_id

    @classmethod
    def get_job_status(cls, project_id: str) -> Dict[str, Any]:
        job = cls._jobs.get(project_id)
        if not job:
            return {"status": "not_found"}
        
        return {
            "project_id": job.project_id,
            "status": job.status,
            "progress": job.progress,
            "result_url": job.result_url,
            "error": job.error
        }
