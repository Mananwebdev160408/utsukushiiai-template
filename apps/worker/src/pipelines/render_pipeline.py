import os
import logging
from typing import List, Dict, Any, Callable
from PIL import Image
import datetime

from src.models.yolo_detector import YOLODetector
from src.models.sam_segmenter import SAMSegmenter
from src.models.midas_estimator.midas_estimator import MiDaSEstimator # Corrected path
from src.models.svd_animate import SVDAnimator
from src.services.audio_analyzer import AudioAnalyzer
from src.services.video_composer import VideoComposer
from src.schemas.pipeline import PipelineMetadata, Panel, RenderSettings, BBox
from src.utils.storage import StorageHelper

logger = logging.getLogger(__name__)

# Note: Fixing the import path for MiDaSEstimator if needed, 
# based on my previous write_to_file call it was src/models/midas_estimator.py
from src.models.midas_estimator import MiDaSEstimator

class RenderPipeline:
    def __init__(self):
        self.detector = YOLODetector()
        self.segmenter = SAMSegmenter()
        self.depth_estimator = MiDaSEstimator()
        self.animator = SVDAnimator()
        self.audio_analyzer = AudioAnalyzer()
        self.composer = VideoComposer()

    async def execute(
        self,
        project_id: str,
        manga_path: str,
        audio_path: str,
        settings: RenderSettings,
        progress_callback: Callable[[float, str], None] = None
    ) -> str:
        """
        Runs the full manga-to-video pipeline.
        """
        try:
            # Initialize metadata
            metadata = PipelineMetadata(
                project_id=project_id,
                manga_path=manga_path,
                audio_path=audio_path,
                created_at=datetime.datetime.now().isoformat(),
                status="processing",
                progress=0.0,
                settings=settings
            )

            # 1. Audio Analysis
            if progress_callback: progress_callback(5.0, "Analyzing audio...")
            audio_info = self.audio_analyzer.analyze(audio_path)
            metadata.audio_analysis = audio_info

            # 2. Panel Detection
            if progress_callback: progress_callback(15.0, "Detecting panels...")
            manga_img = Image.open(manga_path).convert("RGB")
            detections = self.detector.detect(manga_img)
            
            project_dir = os.path.join(StorageHelper.get_asset_path("storage", project_id))
            os.makedirs(project_dir, exist_ok=True)
            
            # 3. Process each panel
            for i, det in enumerate(detections):
                progress = 15.0 + (i / len(detections)) * 60.0 # From 15% to 75%
                if progress_callback: progress_callback(progress, f"Processing panel {i+1}/{len(detections)}...")
                
                panel_id = f"panel_{i:03d}"
                p = self.detector.get_pixel_bbox(det.bbox, manga_img.width, manga_img.height)
                panel_img = manga_img.crop((p["left"], p["top"], p["right"], p["bottom"]))
                
                panel_path = os.path.join(project_dir, f"{panel_id}.png")
                panel_img.save(panel_path)
                
                panel = Panel(
                    id=panel_id,
                    index=i,
                    bbox=det.bbox,
                    image_path=panel_path
                )
                
                # 3.1 Depth Estimation
                if settings.effects.get("parallax"):
                    depth_map = self.depth_estimator.estimate_depth(panel_img)
                    depth_path = os.path.join(project_dir, f"{panel_id}_depth.png")
                    Image.fromarray(depth_map).save(depth_path)
                    panel.depth_map_path = depth_path
                
                # 3.2 Segmentation
                mask = self.segmenter.segment_panel(panel_img, det.bbox)
                mask_path = os.path.join(project_dir, f"{panel_id}_mask.png")
                Image.fromarray(mask * 255).save(mask_path)
                panel.mask_path = mask_path
                
                # 3.3 Character Extraction
                char_img = self.segmenter.extract_character(panel_img, mask)
                char_path = os.path.join(project_dir, f"{panel_id}_char.png")
                char_img.save(char_path)
                panel.character_path = char_path
                
                metadata.panels.append(panel)

            # 4. Video Composition
            if progress_callback: progress_callback(85.0, "Composing final video...")
            output_path = self.composer.compose(
                panels=metadata.panels,
                audio_path=audio_path,
                audio_analysis=audio_info,
                render_settings=settings,
                output_filename=f"{project_id}_final.mp4"
            )

            if progress_callback: progress_callback(100.0, "Render complete!")
            return output_path

        except Exception as e:
            logger.error(f"Pipeline execution failed: {e}")
            raise
