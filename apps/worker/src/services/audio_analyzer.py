import librosa
import numpy as np
import logging
from typing import List, Dict, Any
import os

logger = logging.getLogger(__name__)

class AudioAnalyzer:
    def __init__(self, sample_rate: int = 22050):
        self.sample_rate = sample_rate

    def analyze(self, audio_path: str) -> Dict[str, Any]:
        """Performs full audio analysis for beat tracking and synchronization."""
        if not os.path.exists(audio_path):
            logger.error(f"Audio file not found: {audio_path}")
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        try:
            logger.info(f"Analyzing audio: {audio_path}")
            y, sr = librosa.load(audio_path, sr=self.sample_rate)
            duration = librosa.get_duration(y=y, sr=sr)

            # 1. BPM and Beat Tracking
            tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
            beat_times = librosa.frames_to_time(beat_frames, sr=sr)

            # 2. Onset Detection (transients/hits)
            onset_env = librosa.onset.onset_strength(y=y, sr=sr)
            onset_frames = librosa.onset.onset_detect(onset_env=onset_env, sr=sr)
            onset_times = librosa.frames_to_time(onset_frames, sr=sr)
            
            # Normalize onset strength
            if len(onset_env) > 0:
                onset_env_norm = (onset_env - onset_env.min()) / (onset_env.max() - onset_env.min() + 1e-6)
            else:
                onset_env_norm = onset_env

            # 3. Harmonic/Percussive separation (for different effect triggers)
            y_harmonic, y_percussive = librosa.effects.hpss(y)
            
            # 4. Segment detection
            # We use recurrence matrix to find structural boundaries
            C = librosa.feature.chroma_cqt(y=y, sr=sr)
            # Simple segmentation
            boundaries = librosa.segment.agglomerate(C, k=5)
            boundary_times = librosa.frames_to_time(boundaries, sr=sr)

            analysis_result = {
                "duration": float(duration),
                "bpm": float(tempo[0] if isinstance(tempo, np.ndarray) else tempo),
                "beat_times": beat_times.tolist(),
                "onset_times": onset_times.tolist(),
                "segments": [
                     {"start": float(boundary_times[i]), "end": float(boundary_times[i+1])}
                     for i in range(len(boundary_times)-1)
                ],
                "energy_profile": self._get_energy_profile(y, sr)
            }

            logger.info(f"Audio analysis complete. BPM: {analysis_result['bpm']:.2f}")
            return analysis_result

        except Exception as e:
            logger.error(f"Audio analysis failed: {e}")
            raise

    def _get_energy_profile(self, y: np.ndarray, sr: int, bins_per_sec: int = 10) -> List[float]:
        """Generates a simplified energy profile for the audio."""
        hop_length = sr // bins_per_sec
        rmse = librosa.feature.rms(y=y, hop_length=hop_length)[0]
        # Normalize
        if len(rmse) > 0:
            rmse = (rmse - rmse.min()) / (rmse.max() - rmse.min() + 1e-6)
        return rmse.tolist()
