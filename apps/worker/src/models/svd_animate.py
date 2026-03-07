import torch
from diffusers import StableVideoDiffusionPipeline
from PIL import Image
import logging
import os
import numpy as np
from typing import List, Dict, Any
from src.config.config import settings

logger = logging.getLogger(__name__)

class SVDAnimator:
    def __init__(self, model_path: str = None, device: str = None):
        if model_path is None:
            model_path = os.path.join(settings.MODEL_CACHE_DIR, "svd")
        
        self.device = device or settings.DEVICE
        self.model_path = model_path
        
        # SVD usually requires significant VRAM, so we check for CUDA
        if "cuda" not in self.device:
            logger.warning("SVDAnimator requires CUDA for reasonable performance. CPU will be extremely slow.")

        if not os.path.exists(model_path):
            logger.warning(f"SVD model not found at {model_path}. Please run download_models.py.")
            self.pipe = None
            return

        try:
            # Load SVD pipeline
            self.pipe = StableVideoDiffusionPipeline.from_pretrained(
                model_path,
                torch_dtype=torch.float16 if "cuda" in self.device else torch.float32,
                variant="fp16" if "cuda" in self.device else None
            )
            
            if "cuda" in self.device:
                self.pipe.enable_model_cpu_offload()
                self.pipe.enable_vae_slicing()
            else:
                self.pipe.to(self.device)
                
            logger.info(f"SVD Animator initialized on {self.device}")
        except Exception as e:
            logger.error(f"Failed to load SVD pipeline: {e}")
            self.pipe = None

    def animate_character(
        self, 
        character_image: Image.Image, 
        motion_bucket_id: int = 127,
        num_frames: int = 25,
        decode_chunk_size: int = 8
    ) -> List[Image.Image]:
        """
        Generates a sequence of frames for character animation.
        """
        if self.pipe is None:
            logger.error("SVD pipeline not initialized.")
            return [character_image] * num_frames

        try:
            # SVD works best on specific resolutions (usually 1024x576 or 576x1024)
            # We'll resize the character image maintaining aspect ratio and padding if needed
            w, h = character_image.size
            # For character focus, 576x576 or 576x1024 is often used
            target_size = (576, 576) 
            character_image = character_image.resize(target_size, Image.Resampling.LANCZOS)
            
            generator = torch.manual_seed(42)
            frames = self.pipe(
                character_image, 
                decode_chunk_size=decode_chunk_size, 
                generator=generator,
                motion_bucket_id=motion_bucket_id,
                noise_aug_strength=0.1,
                num_frames=num_frames
            ).frames[0]
            
            return frames
            
        except Exception as e:
            logger.error(f"SVD animation failed: {e}")
            return [character_image] * num_frames

    def apply_procedural_animation(
        self, 
        image: Image.Image, 
        effect: str = "pulse", 
        num_frames: int = 25
    ) -> List[Image.Image]:
        """
        Applies simple procedural animation effects as a lightweight alternative to SVD.
        """
        frames = []
        w, h = image.size
        
        for i in range(num_frames):
            phase = (i / num_frames) * 2 * np.pi
            
            if effect == "pulse":
                # Subtle scale oscillation
                scale = 1.0 + 0.02 * np.sin(phase)
                new_size = (int(w * scale), int(h * scale))
                scaled = image.resize(new_size, Image.Resampling.LANCZOS)
                
                # Center crop to original size
                left = (new_size[0] - w) // 2
                top = (new_size[1] - h) // 2
                frame = scaled.crop((left, top, left + w, top + h))
                
            elif effect == "breath":
                # Subtle vertical stretch oscillation
                scale_y = 1.0 + 0.015 * np.sin(phase)
                new_h = int(h * scale_y)
                scaled = image.resize((w, new_h), Image.Resampling.LANCZOS)
                
                # Align bottom or center
                top = (new_h - h) // 2
                frame = scaled.crop((0, top, w, top + h))
            else:
                frame = image.copy()
                
            frames.append(frame)
            
        return frames
