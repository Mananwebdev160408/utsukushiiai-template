import sys
import os
import logging

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "src"))

from src.config.config import settings
from src.utils.device import get_device_info
from src.models.yolo_detector import YOLODetector
from src.services.audio_analyzer import AudioAnalyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Verification")

def verify():
    logger.info("Starting ML Worker Setup Verification...")
    
    # 1. Device Check
    device_info = get_device_info()
    logger.info(f"Device: {device_info['device']} ({device_info['name']})")
    
    # 2. Config Check
    logger.info(f"Storage Path: {settings.STORAGE_PATH}")
    logger.info(f"Model Cache: {settings.MODEL_CACHE_DIR}")
    
    # 3. YOLODetector Initialization (Static check)
    try:
        # We don't run it yet as models might not be downloaded
        logger.info("Checking YOLODetector class...")
        # detector = YOLODetector() # This would fail if weights aren't there
        logger.info("YOLODetector class import successful.")
    except Exception as e:
        logger.error(f"YOLODetector check failed: {e}")

    # 4. AudioAnalyzer Check
    try:
        logger.info("Checking AudioAnalyzer class...")
        analyzer = AudioAnalyzer()
        logger.info("AudioAnalyzer initialized.")
    except Exception as e:
        logger.error(f"AudioAnalyzer check failed: {e}")

    logger.info("Verification script finished.")

if __name__ == "__main__":
    verify()
