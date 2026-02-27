# UtsukushiiAI ML Pipeline Documentation

This document describes the Machine Learning pipelines used in UtsukushiiAI for manga-to-video generation.

---

## Table of Contents

1. [Pipeline Overview](#pipeline-overview)
2. [Stage 1: Panel Detection](#stage-1-panel-detection)
3. [Stage 2: Instance Segmentation](#stage-2-instance-segmentation)
4. [Stage 3: Depth Estimation](#stage-3-depth-estimation)
5. [Stage 4: Audio Analysis](#stage-4-audio-analysis)
6. [Stage 5: Character Animation](#stage-5-character-animation)
7. [Stage 6: Video Composition](#stage-6-video-composition)
8. [Pipeline Orchestration](#pipeline-orchestration)

---

## Pipeline Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Input    │────▶│  Detection   │────▶│Segmentation │
│  (Manga +   │     │   (YOLOv12)  │     │   (SAM 2)   │
│   Audio)    │     └─────────────┘     └─────────────┘
└─────────────┘            │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │    Depth    │     │  Animation  │
                    │  (MiDaS)    │     │    (SVD)    │
                    └─────────────┘     └─────────────┘
                           │                   │
                           └─────────┬─────────┘
                                     ▼
                            ┌─────────────┐
                            │ Composition │
                            │  (FFmpeg)   │
                            └─────────────┘
                                     │
                                     ▼
                            ┌─────────────┐
                            │    Output   │
                            │   (Video)   │
                            └─────────────┘
```

---

## Stage 1: Panel Detection

### Model: YOLOv12

**Purpose**: Identify and localize manga panels on each page.

### Model Details

| Property | Value |
|----------|-------|
| Architecture | YOLOv12 |
| Training Data | Manga109 + Custom |
| Input Size | 640x640 |
| Output | Bounding boxes (x, y, width, height) |

### Implementation

```python
# src/models/yolo_detector.py
import torch
from ultralytics import YOLO
from PIL import Image
from typing import List, Dict, Any

class YOLODetector:
    def __init__(self, model_path: str = "models/yolov12-manga.pt", device: str = "cuda"):
        self.model = YOLO(model_path)
        self.device = device
        self.model.to(device)
    
    def detect(self, image: Image.Image) -> List[Dict[str, Any]]:
        # Run inference
        results = self.model.predict(
            image,
            conf=0.5,
            iou=0.45,
            device=self.device,
            verbose=False
        )
        
        # Extract detections
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                detections.append({
                    "bbox": {
                        "x": float(box.xyxyn[0][0]),  # Normalized
                        "y": float(box.xyxyn[0][1]),
                        "width": float(box.xyxyn[0][2] - box.xyxyn[0][0]),
                        "height": float(box.xyxyn[0][3] - box.xyxyn[0][1])
                    },
                    "confidence": float(box.conf[0]),
                    "class": int(box.cls[0])
                })
        
        return detections
```

### Coordinate Normalization

> **IMPORTANT**: All coordinates are normalized to [0.0, 1.0] range.

```python
def normalize_bbox(xyxy: tuple, img_width: int, img_height: int) -> Dict[str, float]:
    x1, y1, x2, y2 = xyxy
    return {
        "x": x1 / img_width,
        "y": y1 / img_height,
        "width": (x2 - x1) / img_width,
        "height": (y2 - y1) / img_height
    }
```

---

## Stage 2: Instance Segmentation

### Model: SAM 2 (Segment Anything 2)

**Purpose**: Generate precise masks for characters and foreground elements within each panel.

### Model Details

| Property | Value |
|----------|-------|
| Architecture | SAM 2 (Segment Anything 2) |
| Input | Image + Bounding boxes |
| Output | Binary masks |

### Implementation

```python
# src/models/sam_segmenter.py
import torch
from sam2.build_sam import build_sam2
from sam2.automatic_mask_generator import SAM2AutomaticMaskGenerator
from PIL import Image
import numpy as np

class SAMSegmenter:
    def __init__(self, model_path: str = "models/sam2.pt", device: str = "cuda"):
        self.model = build_sam2(
            config_file="sam2_configs/sam2.1_hiera_base_plus.yaml",
            ckpt=model_path,
            device=device
        )
        self.mask_generator = SAM2AutomaticMaskGenerator(
            model=self.model,
            points_per_side=32,
            pred_iou_thresh=0.88,
            stability_score_thresh=0.95
        )
        self.device = device
    
    def segment_panel(self, image: Image.Image, bbox: Dict[str, float]) -> np.ndarray:
        # Convert normalized bbox to pixel coordinates
        w, h = image.size
        x = int(bbox['x'] * w)
        y = int(bbox['y'] * h)
        bw = int(bbox['width'] * w)
        bh = int(bbox['height'] * h)
        
        # Crop panel region
        panel_img = image.crop((x, y, x + bw, y + bh))
        
        # Generate masks
        masks = self.mask_generator.generate(panel_img)
        
        # Return combined mask (largest mask = main character)
        if masks:
            combined_mask = np.zeros((bh, bw), dtype=np.uint8)
            for mask_data in sorted(masks, key=lambda m: m['area'], reverse=True):
                mask = mask_data['segmentation']
                combined_mask = np.logical_or(combined_mask, mask).astype(np.uint8)
            return combined_mask
        
        return np.zeros((bh, bw), dtype=np.uint8)
```

---

## Stage 3: Depth Estimation

### Model: MiDaS v3

**Purpose**: Generate depth maps for creating 3D parallax "wiggle" effects.

### Model Details

| Property | Value |
|----------|-------|
| Architecture | MiDaS v3 (DPT-Large) |
| Input | RGB Image (384x384) |
| Output | Depth map (H x W) |

### Implementation

```python
# src/models/midas_estimator.py
import torch
import numpy as np
from PIL import Image
from torchvision.transforms import Compose, Resize, ToTensor, Normalize

class MiDaSEstimator:
    def __init__(self, model_path: str = "models/midas-v3.pt", device: str = "cuda"):
        self.model = torch.jit.load(model_path)
        self.model.eval()
        self.model.to(device)
        self.device = device
        
        self.transform = Compose([
            Resize((384, 384)),
            ToTensor(),
            Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def estimate_depth(self, image: Image.Image) -> np.ndarray:
        # Preprocess
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Inference
        with torch.no_grad():
            depth = self.model(input_tensor)
        
        # Postprocess
        depth = depth.squeeze().cpu().numpy()
        depth = (depth - depth.min()) / (depth.max() - depth.min())
        
        return (depth * 255).astype(np.uint8)
    
    def create_parallax_offset(self, depth_map: np.ndarray, strength: float) -> np.ndarray:
        """Create pixel offset map for parallax effect."""
        h, w = depth_map.shape
        
        # Create coordinate grids
        y_coords, x_coords = np.meshgrid(
            np.linspace(-1, 1, h),
            np.linspace(-1, 1, w)
        )
        
        # Calculate offsets based on depth
        # Closer objects move more than distant ones
        offset_x = (1 - depth_map) * strength * x_coords * w
        offset_y = (1 - depth_map) * strength * y_coords * h
        
        return np.stack([offset_x, offset_y], axis=-1)
```

---

## Stage 4: Audio Analysis

### Library: Librosa

**Purpose**: Analyze audio to detect beats, BPM, and segments for rhythm-synced transitions.

### Implementation

```python
# src/services/audio_analyzer.py
import librosa
import numpy as np
from typing import List, Dict

class AudioAnalyzer:
    def __init__(self):
        self.sample_rate = 22050
    
    def analyze(self, audio_path: str) -> Dict[str, any]:
        # Load audio
        y, sr = librosa.load(audio_path, sr=self.sample_rate)
        
        # Get BPM
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        
        # Get beat timestamps
        beat_times = librosa.frames_to_time(beats, sr=sr)
        
        # Get onsets
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        onset_frames = librosa.onset.onset_detect(onset_env=onset_env, sr=sr)
        onset_times = librosa.frames_to_time(onset_frames, sr=sr)
        
        # Get segments
        segments = self._get_segments(y, sr)
        
        return {
            "duration": librosa.get_duration(y=y, sr=sr),
            "bpm": float(tempo),
            "beats": self._format_beats(beat_times),
            "onsets": self._format_onsets(onset_times, onset_env),
            "segments": segments
        }
    
    def _format_beats(self, beat_times: np.ndarray) -> List[Dict]:
        beats = []
        for i, time in enumerate(beat_times):
            beats.append({
                "id": f"beat_{i:04d}",
                "timestamp": float(time),
                "strength": 1.0,
                "type": "downbeat" if i % 4 == 0 else "beat"
            })
        return beats
    
    def _format_onsets(self, onset_times: np.ndarray, onset_env: np.ndarray) -> List[Dict]:
        onsets = []
        for time in onset_times:
            strength_idx = int(time * 10)  # Approximate
            strength = min(1.0, float(onset_env[strength_idx]) / 10.0) if strength_idx < len(onset_env) else 0.5
            onsets.append({
                "timestamp": float(time),
                "strength": strength
            })
        return onsets
    
    def _get_segments(self, y: np.ndarray, sr: int) -> List[Dict]:
        # Simple segment detection based on energy
        S = np.abs(librosa.stft(y))
        segment_boundaries = librosa.segment.agglomerate(S, k=8)
        segment_times = librosa.frames_to_time(segment_boundaries, sr=sr)
        
        labels = ['intro', 'verse', 'chorus', 'bridge', 'verse', 'chorus', 'outro', 'break']
        
        segments = []
        for i, (start, end) in enumerate(zip(segment_times[:-1], segment_times[1:])):
            segments.append({
                "start": float(start),
                "end": float(end),
                "label": labels[i % len(labels)]
            })
        
        return segments
```

---

## Stage 5: Character Animation

### Model: Stable Video Diffusion (SVD)

**Purpose**: Generate subtle animations for characters (hair movement, eye blinks).

### Implementation

```python
# src/models/svd_animate.py
import torch
from diffusers import StableVideoDiffusionPipeline
from PIL import Image
import numpy as np

class SVDAnimator:
    def __init__(self, model_path: str = "models/svd", device: str = "cuda"):
        self.pipe = StableVideoDiffusionPipeline.from_pretrained(
            model_path,
            torch_dtype=torch.float16,
            variant="fp16"
        )
        self.pipe.enable_model_cpu_offload()
        self.pipe.enable_vae_slicing()
        self.device = device
    
    def animate_character(
        self, 
        character_image: Image.Image, 
        motion_prompt: str = "subtle movement",
        num_frames: int = 24
    ) -> List[Image.Image]:
        # Resize to model's expected input
        character_image = character_image.resize((576, 576))
        
        # Generate video frames
        frames = self.pipe(
            character_image,
            prompt=motion_prompt,
            num_frames=num_frames,
            num_inference_steps=25,
            guidance_scale=1.0,
        ).frames[0]
        
        return frames
    
    def apply_subtle_effect(
        self, 
        image: Image.Image, 
        effect_type: str = "pulse"
    ) -> List[Image.Image]:
        """Apply subtle animation effects."""
        frames = []
        
        if effect_type == "pulse":
            for i in range(10):
                scale = 1.0 + 0.02 * np.sin(i * np.pi / 5)
                w, h = image.size
                new_size = (int(w * scale), int(h * scale))
                scaled = image.resize(new_size)
                
                # Center crop to original size
                left = (new_size[0] - w) // 2
                top = (new_size[1] - h) // 2
                frames.append(scaled.crop((left, top, left + w, top + h)))
        
        elif effect_type == "breath":
            for i in range(20):
                scale = 1.0 + 0.01 * np.sin(i * np.pi / 10)
                w, h = image.size
                new_h = int(h * scale)
                offset = (h - new_h) // 2
                scaled = image.resize((w, new_h))
                frames.append(scaled.crop((0, offset, w, offset + h)))
        
        return frames
```

---

## Stage 6: Video Composition

### Library: FFmpeg (via Python)

**Purpose**: Compose all layers, effects, and audio into final video.

### Implementation

```python
# src/services/video_composer.py
import subprocess
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import tempfile
import os

class VideoComposer:
    def __init__(self, output_dir: str = "output"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def compose(
        self,
        panels: List[Dict],
        beats: List[Dict],
        audio_path: str,
        settings: RenderSettings,
        progress_callback: callable = None
    ) -> str:
        output_path = os.path.join(self.output_dir, "output.mp4")
        
        # Create filter complex for FFmpeg
        filter_complex = self._build_filter_complex(panels, beats, settings)
        
        # FFmpeg command
        cmd = [
            "ffmpeg",
            "-y",
            "-i", audio_path,
            "-filter_complex", filter_complex,
            "-c:v", "libx264",
            "-preset", self._get_preset(settings.quality),
            "-crf", self._get_crf(settings.quality),
            "-r", str(settings.fps),
            "-c:a", "aac",
            "-b:a", "192k",
            output_path
        ]
        
        subprocess.run(cmd, check=True)
        
        return output_path
    
    def _build_filter_complex(
        self, 
        panels: List[Dict], 
        beats: List[Dict],
        settings: RenderSettings
    ) -> str:
        filters = []
        
        for i, panel in enumerate(panels):
            # Add parallax effect
            if settings.effects.get('parallax'):
                filters.append(
                    f"[{i}:v]crop=iw*0.8:ih*0.8,zoompan=z='min(zoom+0.001,1.5)':d=25:s=1080x1920[par{i}]"
                )
            
            # Add glow effect
            if settings.effects.get('glow'):
                filters.append(
                    f"[par{i}]gblur=sigma=5:enable='between(t,{beats[i]['timestamp']},{beats[i]['timestamp']+0.5})'[glow{i}]"
                )
        
        # Chain filters
        if len(filters) > 1:
            return ";".join(filters[:-1]) + f";{filters[-1]}[out]"
        
        return filters[0] if filters else ""
    
    def _get_preset(self, quality: str) -> str:
        presets = {
            "draft": "ultrafast",
            "standard": "medium",
            "high": "slow",
            "ultra": "veryslow"
        }
        return presets.get(quality, "medium")
    
    def _get_crf(self, quality: str) -> int:
        crf_values = {
            "draft": 35,
            "standard": 23,
            "high": 18,
            "ultra": 15
        }
        return crf_values.get(quality, 23)
```

---

## Pipeline Orchestration

### Render Pipeline

```python
# src/pipelines/render_pipeline.py
class RenderPipeline:
    def __init__(
        self,
        detector: YOLODetector,
        segmenter: SAMSegmenter,
        depth_estimator: MiDaSEstimator,
        animator: SVDAnimator,
        audio_analyzer: AudioAnalyzer,
        composer: VideoComposer
    ):
        self.detector = detector
        self.segmenter = segmenter
        self.depth_estimator = depth_estimator
        self.animator = animator
        self.audio_analyzer = audio_analyzer
        self.composer = composer
    
    async def execute(
        self,
        project_id: str,
        manga_path: str,
        audio_path: str,
        settings: RenderSettings,
        progress_callback: callable = None
    ) -> str:
        # Stage 1: Detect panels
        progress_callback(0, "detecting", "Detecting manga panels...")
        panels = await self._detect_panels(manga_path)
        
        # Stage 2: Generate masks
        progress_callback(20, "segmenting", "Generating character masks...")
        masks = await self._generate_masks(manga_path, panels)
        
        # Stage 3: Estimate depth
        progress_callback(40, "depth", "Creating depth maps...")
        depth_maps = await self._estimate_depth(manga_path, panels)
        
        # Stage 4: Analyze audio
        progress_callback(50, "analyzing", "Analyzing audio beats...")
        audio_analysis = await self._analyze_audio(audio_path)
        
        # Stage 5: Animate characters
        progress_callback(60, "animating", "Animating characters...")
        animated_frames = await self._animate_characters(masks)
        
        # Stage 6: Compose video
        progress_callback(80, "composing", "Composing video...")
        output_path = await self._compose_video(
            panels, animated_frames, depth_maps, audio_analysis, audio_path, settings
        )
        
        # Stage 7: Upload
        progress_callback(95, "uploading", "Uploading to storage...")
        output_url = await self._upload_to_s3(output_path, project_id)
        
        progress_callback(100, "complete", "Render complete!")
        
        return output_url
    
    async def _detect_panels(self, manga_path: str) -> List[Dict]:
        image = Image.open(manga_path)
        detections = self.detector.detect(image)
        return detections
```

---

## Model Storage

### Directory Structure

```
models/
├── yolov12/
│   ├── manga/
│   │   └── yolov12-manga.pt
│   └── config.yaml
│
├── sam2/
│   ├── sam2.1_hiera_base_plus.pt
│   ├── sam2.1_hiera_large.pt
│   └── sam2_configs/
│       └── sam2.1_hiera_base_plus.yaml
│
├── midas/
│   ├── dpt_large-v3.pt
│   └── dpt_beit-v3.pt
│
└── svd/
    ├── svd.pt
    └── svd_xt.pt
```

### Model Download Script

```python
# scripts/download_models.py
from huggingface_hub import hf_hub_download
import os

def download_models():
    # YOLOv12
    hf_hub_download(
        repo_id="utsukushii/yolov12-manga",
        filename="yolov12-manga.pt",
        local_dir="models/yolov12/manga"
    )
    
    # SAM 2
    hf_hub_download(
        repo_id="facebook/sam2.1-hiera-base-plus",
        filename="sam2.1_hiera_base_plus.pt",
        local_dir="models/sam2"
    )
    
    # MiDaS
    hf_hub_download(
        repo_id="intel/dpt-large",
        filename="dpt_large-v3.pt",
        local_dir="models/midas"
    )

if __name__ == "__main__":
    download_models()
```

---

## Performance Optimization

### GPU Memory Management

```python
# Enable gradient checkpointing
model.enable_gradient_checkpointing()

# Use mixed precision
with torch.autocast(device_type='cuda', dtype=torch.float16):
    outputs = model(inputs)

# Clear cache periodically
torch.cuda.empty_cache()
```

### Batch Processing

```python
def batch_process(images: List[Image.Image], batch_size: int = 4):
    results = []
    for i in range(0, len(images), batch_size):
        batch = images[i:i + batch_size]
        batch_results = model(batch)
        results.extend(batch_results)
        torch.cuda.empty_cache()
    return results
```
