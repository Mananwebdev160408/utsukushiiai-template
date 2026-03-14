'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRenderStore } from '@/stores/renderStore';
import type { RenderSettings } from '@/types';

const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('utsukushii-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.tokens?.accessToken || null;
  } catch {
    return null;
  }
};

/**
 * Custom hook for render job management.
 * Handles job submission, WebSocket progress tracking, and history.
 */
export function useRender(projectId?: string) {
  const {
    currentJob,
    settings,
    jobHistory,
    isSubmitting,
    setCurrentJob,
    updateJobProgress,
    completeJob,
    failJob,
    setSettings,
    setEffects,
    setSubmitting,
    resetSettings,
  } = useRenderStore();

  const wsRef = useRef<WebSocket | null>(null);

  // Submit render job
  const submitRender = useCallback(async (mangaPath: string, audioPath: string) => {
    if (!projectId) return;
    setSubmitting(true);

    try {
      const token = getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/render/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          projectId,
          settings: {
            quality: settings.quality,
            fps: settings.fps,
            resolution: `${settings.width}x${settings.height}`,
            format: settings.codec === 'libx265' ? 'webm' : 'mp4',
            effects: settings.effects,
          },
        }),
      });

      const data = await response.json();
      const jobId = data?.data?.job?._id || data?.data?.job?.id;
      if (jobId) {
        setCurrentJob({
          id: jobId,
          projectId,
          status: 'queued',
          progress: 0,
          currentStage: 'queued',
          message: 'Job submitted',
        });
        // Start polling for progress
        startProgressPolling(jobId);
      } else {
        failJob('Render API did not return a job id');
      }
    } catch (err: any) {
      failJob(err?.message || 'Failed to submit render');
    } finally {
      setSubmitting(false);
    }
  }, [projectId, settings, setCurrentJob, failJob, setSubmitting]);

  // Cancel render
  const cancelRender = useCallback(async () => {
    if (!currentJob?.id) return;
    try {
      const token = getAccessToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/render/${currentJob.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setCurrentJob(currentJob ? { ...currentJob, status: 'cancelled' } : null);
    } catch (err) {
      console.error('Failed to cancel render:', err);
    }
  }, [currentJob, setCurrentJob]);

  // Poll for progress (fallback when WebSocket is not available)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProgressPolling = useCallback((jobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const token = getAccessToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/render/${jobId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );
        const data = await res.json();
        const job = data?.data?.job;
        const status = job?.status;

        if (status === 'completed') {
          completeJob(job?.outputUrl || '', job?.duration || 0, job?.fileSize || 0);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else if (status === 'failed') {
          failJob(job?.error?.message || 'Render failed');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else if (status === 'cancelled') {
          setCurrentJob(currentJob ? { ...currentJob, status: 'cancelled' } : null);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else {
          updateJobProgress(job?.progress || 0, status || '', 'Rendering in progress');
        }
      } catch {
        // Silent fail — will retry next interval
      }
    }, 2000);
  }, [updateJobProgress, completeJob, failJob, setCurrentJob, currentJob]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Get music suggestion
  const suggestMusic = useCallback(async (mangaPath: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ML_WORKER_URL || 'http://localhost:8001'}/suggest/music`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ manga_path: mangaPath }),
        }
      );
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  return {
    currentJob,
    settings,
    jobHistory,
    isSubmitting,
    submitRender,
    cancelRender,
    suggestMusic,
    setSettings,
    setEffects,
    resetSettings,
  };
}
