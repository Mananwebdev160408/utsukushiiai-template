import torch
from ultralytics import YOLO
from PIL import Image
from typing import List, Dict, Any
import logging
import os
from src.config.config import settings
from src.schemas.pipeline import DetectionResult, BBox

logger = logging.getLogger(__name__)

class YOLODetector:
    def __init__(self, model_path: str = None, device: str = None):
        if model_path is None:
            model_path = os.path.join(settings.MODEL_CACHE_DIR, "yolov12-manga.pt")
        
        self.device = device or settings.DEVICE
        
        # Check if model exists, if not, we'll need a way to download it or use a default
        if not os.path.exists(model_path):
            logger.warning(f"Model file not found at {model_path}. Please ensure weights are provisioned.")
            # For now, we'll try to load it anyway, which might fallback to HF download depending on ultralytics version
            # But in production we should have it local.
        
        try:
            self.model = YOLO(model_path)
            self.model.to(self.device)
            logger.info(f"YOLOv12 Detector initialized on {self.device} using model: {model_path}")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            raise

    def detect(self, image: Image.Image, conf_threshold: float = 0.5) -> List[DetectionResult]:
        """Detect panels in a manga page."""
        try:
            results = self.model.predict(
                image,
                conf=conf_threshold,
                device=self.device,
                verbose=False
            )

            detections = []
            img_width, img_height = image.size

            for result in results:
                boxes = result.boxes
                for box in boxes:
                    # Normalized coordinates
                    xyxyn = box.xyxyn[0]
                    x1, y1, x2, y2 = xyxyn.tolist()
                    
                    # Ensure coordinates are within [0, 1]
                    x1, y1 = max(0.0, x1), max(0.0, y1)
                    x2, y2 = min(1.0, x2), min(1.0, y2)
                    
                    bbox = BBox(
                        x=x1,
                        y=y1,
                        width=x2 - x1,
                        height=y2 - y1
                    )

                    detections.append(DetectionResult(
                        bbox=bbox,
                        confidence=float(box.conf[0]),
                        class_id=int(box.cls[0]),
                        label=result.names[int(box.cls[0])]
                    ))

            # Sort panels by reading order (top-to-bottom, then right-to-left)
            # We use a vertical tolerance to group panels in the same 'row'
            y_tolerance = 0.05 
            detections.sort(key=lambda d: (round(d.bbox.y / y_tolerance), -d.bbox.x))

            logger.info(f"Detected {len(detections)} panels")
            return detections
            
        except Exception as e:
            logger.error(f"Detection failed: {e}")
            return []

    def get_pixel_bbox(self, bbox: BBox, img_width: int, img_height: int) -> Dict[str, int]:
        """Converts normalized bbox to pixel coordinates."""
        return {
            "left": int(bbox.x * img_width),
            "top": int(bbox.y * img_height),
            "right": int((bbox.x + bbox.width) * img_width),
            "bottom": int((bbox.y + bbox.height) * img_height)
        }

    def crop_panels(self, image: Image.Image, detections: List[DetectionResult], output_dir: str) -> List[str]:
        """Crops detected panels and saves them as individual images."""
        os.makedirs(output_dir, exist_ok=True)
        img_width, img_height = image.size
        panel_paths = []

        for i, detection in enumerate(detections):
            p = self.get_pixel_bbox(detection.bbox, img_width, img_height)
            
            panel_img = image.crop((p["left"], p["top"], p["right"], p["bottom"]))
            panel_path = os.path.join(output_dir, f"panel_{i:03d}.png")
            panel_img.save(panel_path)
            panel_paths.append(panel_path)

        logger.info(f"Saved {len(panel_paths)} panel crops to {output_dir}")
        return panel_paths
