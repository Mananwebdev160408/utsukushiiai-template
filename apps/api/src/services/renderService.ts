import { renderJobRepository } from "../repositories/renderJobRepository";
import { projectService } from "./projectService";
import { NotFoundError } from "../errors";
import { logger } from "../utils/logger";
import { AppError } from "../errors";
import { config } from "../config";
import path from "path";
import { generateId } from "../utils";

export class RenderService {
  async startRender(userId: string, projectId: string, settings: any) {
    const project = await projectService.getProject(userId, projectId);

    // Create job record
    const job = await renderJobRepository.create({
      _id: generateId("rnd"),
      userId,
      projectId,
      settings: settings || project.settings,
      status: "pending",
      progress: 0,
    });

    try {
      // Dispatch to worker and immediately move job into processing pipeline.
      await this.dispatchJob(job, project);
    } catch (error: any) {
      await renderJobRepository.update(job._id.toString(), {
        status: "failed",
        error: {
          code: "WORKER_DISPATCH_FAILED",
          message: error?.message || "Worker dispatch failed",
        },
      });
      throw error;
    }

    return job;
  }

  private resolveWorkerInputPath(fileUrl: string): string {
    if (!fileUrl) {
      throw new AppError(
        "Missing file path for worker dispatch",
        422,
        "MISSING_RENDER_INPUT",
      );
    }

    if (fileUrl.startsWith("/uploads/")) {
      const relativePath = fileUrl.replace(/^\/uploads\//, "");
      return path.join(config.storage.path, relativePath);
    }

    return fileUrl;
  }

  private async dispatchJob(job: any, project: any) {
    const chapters = Array.isArray(project.mangaChapters)
      ? project.mangaChapters
      : [];
    const latestChapter = chapters[chapters.length - 1];
    const audioInfo = project.audioInfo;

    if (!latestChapter?.fileUrl || !audioInfo?.fileUrl) {
      throw new AppError(
        "Project must include at least one manga chapter and one audio file before rendering",
        422,
        "MISSING_RENDER_ASSETS",
      );
    }

    const workerPayload = {
      project_id: job._id.toString(),
      manga_path: this.resolveWorkerInputPath(latestChapter.fileUrl),
      audio_path: this.resolveWorkerInputPath(audioInfo.fileUrl),
      settings: job.settings || project.settings,
    };

    logger.info(
      `Dispatching job ${job._id} to worker at ${config.mlWorker.url}...`,
    );

    const response = await fetch(`${config.mlWorker.url}/render/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workerPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(
        `Worker rejected render job: ${errorText || response.statusText}`,
        502,
        "WORKER_DISPATCH_FAILED",
      );
    }

    await renderJobRepository.updateStatus(job._id.toString(), "processing", 1);
  }

  async getRenderStatus(userId: string, jobId: string) {
    const job = await renderJobRepository.findById(jobId);
    if (!job) throw new NotFoundError("RenderJob", jobId);
    if (job.userId !== userId) throw new Error("Forbidden"); // simplified for now
    return job;
  }

  async listRenderJobs(
    userId: string,
    query: { limit?: number; offset?: number },
  ) {
    return renderJobRepository.findByUserId(userId, query.limit, query.offset);
  }

  async cancelRender(userId: string, jobId: string) {
    const job = await this.getRenderStatus(userId, jobId);
    if (job.status === "completed" || job.status === "failed") {
      throw new Error("Cannot cancel a finished job");
    }

    try {
      await fetch(`${config.mlWorker.url}/render/cancel/${jobId}`, {
        method: "POST",
      });
    } catch (error) {
      logger.warn(`Worker cancel failed for ${jobId}, applying local cancel only`);
    }

    return renderJobRepository.updateStatus(jobId, "cancelled");
  }
}

export const renderService = new RenderService();
