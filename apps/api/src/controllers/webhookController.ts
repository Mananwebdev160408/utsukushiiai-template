import { NextFunction, Request, Response } from "express";
import { projectRepository, renderJobRepository } from "../repositories";
import { logger } from "../utils/logger";

type WorkerRenderWebhookPayload = {
  project_id: string;
  status: "processing" | "completed" | "failed" | "cancelled";
  progress?: number;
  output_url?: string;
  duration?: number;
  file_size?: number;
  error?: string;
};

export const handleRenderWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.body as WorkerRenderWebhookPayload;
    const jobId = payload?.project_id;

    if (!jobId) {
      return res
        .status(400)
        .json({ status: "error", message: "project_id is required" });
    }

    const job = await renderJobRepository.findById(jobId);
    if (!job) {
      logger.warn(`Webhook received for unknown job id: ${jobId}`);
      return res.status(202).json({ status: "accepted", message: "Unknown job" });
    }

    const updateData: any = {
      status: payload.status,
    };

    if (typeof payload.progress === "number") {
      updateData.progress = payload.progress;
    }
    if (payload.output_url) {
      updateData.outputUrl = payload.output_url;
    }
    if (typeof payload.duration === "number") {
      updateData.duration = payload.duration;
    }
    if (typeof payload.file_size === "number") {
      updateData.fileSize = payload.file_size;
    }
    if (payload.error) {
      updateData.error = {
        code: "WORKER_ERROR",
        message: payload.error,
      };
    }

    await renderJobRepository.update(jobId, updateData);

    if (payload.status === "completed") {
      await projectRepository.update(job.projectId, { status: "ready" });
    } else if (payload.status === "failed") {
      await projectRepository.update(job.projectId, { status: "error" });
    } else if (payload.status === "processing") {
      await projectRepository.update(job.projectId, { status: "processing" });
    }

    return res.status(200).json({ status: "success" });
  } catch (error) {
    next(error);
  }
};
