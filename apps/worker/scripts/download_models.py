from huggingface_hub import hf_hub_download
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")

def download_models():
    """Downloads required models from HuggingFace Hub."""
    
    # YOLOv12 Manga (Placeholder repo for now, replaced with actual if available)
    # Since YOLOv12 is very new, we might be using a specific fork or local path.
    # For now, we'll ensure the directory structure is ready.
    yolo_dir = os.path.join(MODELS_DIR, "yolov12")
    os.makedirs(yolo_dir, exist_ok=True)
    logger.info(f"YOLO models directory: {yolo_dir}")

    # SAM 2
    sam2_dir = os.path.join(MODELS_DIR, "sam2")
    os.makedirs(sam2_dir, exist_ok=True)
    try:
        logger.info("Downloading SAM 2.1 Hiera Base Plus...")
        hf_hub_download(
            repo_id="facebook/sam2.1-hiera-base-plus",
            filename="sam2.1_hiera_base_plus.pt",
            local_dir=sam2_dir
        )
    except Exception as e:
        logger.error(f"Failed to download SAM 2: {e}")

    # MiDaS v3 (Depth)
    midas_dir = os.path.join(MODELS_DIR, "midas")
    os.makedirs(midas_dir, exist_ok=True)
    try:
        logger.info("Downloading MiDaS v3 DPT-Large...")
        hf_hub_download(
            repo_id="intel/dpt-large",
            filename="dpt_large-v3.pt",
            local_dir=midas_dir
        )
    except Exception as e:
        logger.error(f"Failed to download MiDaS: {e}")

    # SVD (Stable Video Diffusion) - Potential local path or HF
    svd_dir = os.path.join(MODELS_DIR, "svd")
    os.makedirs(svd_dir, exist_ok=True)
    logger.info(f"SVD models directory: {svd_dir}")

if __name__ == "__main__":
    download_models()
