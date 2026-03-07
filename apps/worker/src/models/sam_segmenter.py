import torch
import numpy as np
from PIL import Image
import logging
import os
from typing import List, Dict, Any, Optional
from src.config.config import settings
from src.schemas.pipeline import BBox

# Note: This assumes 'sam2' package is installed. 
# We'll use a wrapper that falls back to a simpler method if not available.
try:
    from sam2.build_sam import build_sam2
    from sam2.sam2_image_predictor import SAM2ImagePredictor
    HAS_SAM2 = True
except ImportError:
    HAS_SAM2 = False

logger = logging.getLogger(__name__)

class SAMSegmenter:
    def __init__(self, model_path: str = None, device: str = None):
        if model_path is None:
            model_path = os.path.join(settings.MODEL_CACHE_DIR, "sam2", "sam2.1_hiera_base_plus.pt")
        
        self.device = device or settings.DEVICE
        self.model_path = model_path
        self.predictor = None
        
        if not HAS_SAM2:
            logger.warning("SAM 2 package not found. Using fallback segmentation.")
            return

        if not os.path.exists(model_path):
            logger.warning(f"SAM 2 model not found at {model_path}. Please run download_models.py.")
            return

        try:
            # Config name depends on the specific SAM 2 release
            # For 2.1 base plus, it's usually sam2.1_hiera_b+.yaml
            # In a real setup, these configs should be in a known location
            model_cfg = "sam2.1_hiera_b+.yaml" 
            sam2_model = build_sam2(model_cfg, model_path, device=self.device)
            self.predictor = SAM2ImagePredictor(sam2_model)
            logger.info(f"SAM 2 Segmenter initialized on {self.device}")
        except Exception as e:
            logger.error(f"Failed to initialize SAM 2: {e}")

    def segment_panel(self, panel_image: Image.Image, bbox: Optional[BBox] = None) -> np.ndarray:
        """
        Generates an alpha mask for the main character/foreground in a panel.
        If a bbox is provided, it uses it as a prompt.
        Returns a numpy array (H, W) where 1 is foreground, 0 is background.
        """
        try:
            img_np = np.array(panel_image.convert("RGB"))
            h, w = img_np.shape[:2]

            if self.predictor is not None:
                self.predictor.set_image(img_np)
                
                # If no bbox prompt, we might try automatic or a center point
                if bbox:
                    # Convert normalized bbox to pixel coordinates for SAM 2
                    # Note: SAM 2 predictor.predict takes [x1, y1, x2, y2]
                    input_box = np.array([
                        bbox.x * w, 
                        bbox.y * h, 
                        (bbox.x + bbox.width) * w, 
                        (bbox.y + bbox.height) * h
                    ])
                    
                    masks, scores, logits = self.predictor.predict(
                        box=input_box[None, :],
                        multimask_output=False
                    )
                    return (masks[0] > 0).astype(np.uint8)
                else:
                    # Fallback to center point prompt if no bbox
                    input_point = np.array([[w // 2, h // 2]])
                    input_label = np.array([1])
                    
                    masks, scores, logits = self.predictor.predict(
                        point_coords=input_point,
                        point_labels=input_label,
                        multimask_output=False
                    )
                    return (masks[0] > 0).astype(np.uint8)
            else:
                # Fallback implementation (e.g., simple thresholding or centered box)
                logger.debug("Using fallback dummy mask")
                mask = np.zeros((h, w), dtype=np.uint8)
                # Assume character is roughly in the middle 60% of the image
                mask[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)] = 1
                return mask
                
        except Exception as e:
            logger.error(f"Segmentation failed: {e}")
            return np.zeros((h, w), dtype=np.uint8)

    def extract_character(self, panel_image: Image.Image, mask: np.ndarray) -> Image.Image:
        """Applies mask to extract character with transparency."""
        panel_np = np.array(panel_image.convert("RGBA"))
        
        # Ensure mask matches image size
        if mask.shape[:2] != panel_np.shape[:2]:
            # Resize mask if needed
            mask_img = Image.fromarray(mask * 255).resize(panel_image.size, Image.Resampling.NEAREST)
            mask = np.array(mask_img) // 255
            
        panel_np[:, :, 3] = mask * 255
        return Image.fromarray(panel_np)
