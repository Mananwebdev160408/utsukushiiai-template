"""Worker Configuration — Centralized settings from environment variables."""

from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    # Service
    PORT: int = 8001
    WORKER_NAME: str = "utsukushiiai-ml-worker"
    WORKER_CONCURRENCY: int = 2

    # Device
    DEVICE: str = "cuda"  # cuda, cpu, mps

    # Paths
    MODEL_CACHE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
    STORAGE_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage")
    DOWNLOAD_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "downloads")
    OUTPUT_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "output")

    # Database & Cache
    MONGODB_URI: str = "mongodb://localhost:27017/utsukushiiai"
    REDIS_URL: str = "redis://localhost:6379/0"

    # External APIs
    API_WEBHOOK_URL: str = "http://localhost:4000/v1/webhooks/render"

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    def ensure_directories(self):
        """Creates all required directories."""
        for d in [self.MODEL_CACHE_DIR, self.STORAGE_PATH, self.DOWNLOAD_PATH, self.OUTPUT_PATH]:
            os.makedirs(d, exist_ok=True)


settings = Settings()
settings.ensure_directories()
