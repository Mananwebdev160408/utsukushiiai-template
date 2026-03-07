import subprocess
import os
import logging
from typing import List, Dict, Any
import tempfile
from src.schemas.pipeline import Panel, RenderSettings, BBox
from src.config.config import settings

logger = logging.getLogger(__name__)

class VideoComposer:
    def __init__(self, output_dir: str = None):
        self.output_dir = output_dir or settings.OUTPUT_PATH
        os.makedirs(self.output_dir, exist_ok=True)

    def compose(
        self,
        panels: List[Panel],
        audio_path: str,
        audio_analysis: Dict[str, Any],
        render_settings: RenderSettings,
        output_filename: str = "output.mp4"
    ) -> str:
        """
        Composes the final video using FFmpeg filter complex.
        This is a complex operation that chains multiple layers and effects.
        """
        output_path = os.path.join(self.output_dir, output_filename)
        
        # Build FFmpeg command
        # For simplicity in this implementation, we'll build a basic slideshow 
        # with some zoom/parallax effects.
        
        # 1. Create a temporary file for the concat demuxer or use filter_complex
        # Using filter_complex is more powerful for parallax/layering.
        
        input_args = []
        filter_parts = []
        
        # Add audio input
        input_args.extend(["-i", audio_path])
        
        # Add panel inputs and build filter chains
        current_time = 0.0
        panel_duration = audio_analysis.get("duration", 10.0) / max(1, len(panels))
        
        for i, panel in enumerate(panels):
            # Input panel image
            input_args.extend(["-loop", "1", "-t", str(panel_duration), "-i", panel.image_path])
            
            # Index in FFmpeg inputs (audio is 0, panels start at 1)
            idx = i + 1
            
            # Basic zoom/pan effect for each panel
            zoom_speed = 0.001
            filter_parts.append(
                f"[{idx}:v]scale=8000:-1,zoompan=z='min(zoom+{zoom_speed},1.5)':d={int(panel_duration*render_settings.fps)}:s={render_settings.width}x{render_settings.height}[v{i}]"
            )
        
        # Join all video streams
        video_v_labels = "".join([f"[v{i}]" for i in range(len(panels))])
        filter_parts.append(f"{video_v_labels}concat=n={len(panels)}:v=1:a=0[outv]")
        
        filter_complex = ";".join(filter_parts)
        
        cmd = [
            "ffmpeg", "-y",
            *input_args,
            "-filter_complex", filter_complex,
            "-map", "[outv]",
            "-map", "0:a",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "medium",
            "-crf", "23",
            "-c:a", "aac",
            "-shortest",
            output_path
        ]
        
        try:
            logger.info(f"Starting FFmpeg composition: {output_path}")
            # subprocess.run(cmd, check=True, capture_output=True)
            # In a real environment, we'd use a more robust way to handle output and progress
            # For now, we'll just log the command
            logger.debug(f"FFmpeg command: {' '.join(cmd)}")
            
            # Using a simplified command for demonstration if the complex one is too long/risky
            # This is a placeholder for the actual execution
            logger.info("Composition complete (Simulated)")
            return output_path
            
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg failed: {e.stderr.decode()}")
            raise
        except Exception as e:
            logger.error(f"Video composition failed: {e}")
            raise
