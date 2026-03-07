import torch
import numpy as np
from PIL import Image
import logging
import os
from typing import Dict, Any
from torchvision.transforms import Compose, Resize, ToTensor, Normalize
from src.config.config import settings

logger = logging.getLogger(__name__)

class MiDaSEstimator:
    def __init__(self, model_path: str = None, device: str = None):
        if model_path is None:
            model_path = os.path.join(settings.MODEL_CACHE_DIR, "midas", "dpt_large-v3.pt")
        
        self.device = device or settings.DEVICE
        self.model_path = model_path
        
        if not os.path.exists(model_path):
            logger.warning(f"MiDaS model not found at {model_path}. Please run download_models.py.")
            self.model = None
            return

        try:
            # MiDaS v3 usually uses torch.jit.load for the weights if they are serialized that way
            # Or a specific build function. For simplicity in this implementation, 
            # we'll assume a JIT-loaded model or a compatible checkpoint.
            self.model = torch.jit.load(model_path, map_location=self.device)
            self.model.eval()
            self.model.to(self.device)
            logger.info(f"MiDaS v3 Estimator initialized on {self.device} using model: {model_path}")
            
            self.transform = Compose([
                Resize((384, 384)),
                ToTensor(),
                Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
        except Exception as e:
            logger.error(f"Failed to load MiDaS model: {e}")
            self.model = None

    def estimate_depth(self, image: Image.Image) -> np.ndarray:
        """
        Generates a depth map for the given image.
        Returns a normalized numpy array (H, W) where 0 is far and 255 is near.
        """
        if self.model is None:
            logger.error("MiDaS model not initialized.")
            return np.zeros((image.height, image.width), dtype=np.uint8)

        try:
            # Preprocess
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)

            # Inference
            with torch.no_grad():
                prediction = self.model(input_tensor)
                
                # Resize back to original size if needed
                # MiDaS output might need interpolation
                prediction = torch.nn.functional.interpolate(
                    prediction.unsqueeze(1),
                    size=image.size[::-1], # (H, W)
                    mode="bicubic",
                    align_corners=False,
                ).squeeze()

            # Normalize to 0-255
            depth = prediction.cpu().numpy()
            depth_min = depth.min()
            depth_max = depth.max()
            
            if depth_max > depth_min:
                depth = 255 * (depth - depth_min) / (depth_max - depth_min)
            else:
                depth = np.zeros_like(depth)
                
            return depth.astype(np.uint8)
            
        except Exception as e:
            logger.error(f"Depth estimation failed: {e}")
            return np.zeros((image.height, image.width), dtype=np.uint8)

    def create_parallax_offset(self, depth_map: np.ndarray, strength: float = 0.05) -> np.ndarray:
        """
        Calculates horizontal/vertical offsets based on depth for parallax effects.
        Higher depth values (foreground) get larger shifts.
        """
        h, w = depth_map.shape
        # Normalize depth map to 0-1 for offset calculation
        norm_depth = depth_map.astype(float) / 255.0
        
        # Simple linear offset
        offset_x = norm_depth * strength * w
        offset_y = norm_depth * strength * h
        
        return np.stack([offset_x, offset_y], axis=-1)
