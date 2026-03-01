import { RenderJob, IRenderJob } from "../models/RenderJob";
import { BaseRepository } from "./BaseRepository";

export class RenderJobRepository extends BaseRepository<IRenderJob> {
  constructor() {
    super(RenderJob);
  }

  async findByProjectId(projectId: string): Promise<IRenderJob[]> {
    return this.model.find({ projectId }).sort({ createdAt: -1 });
  }

  async findByUserId(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<IRenderJob[]> {
    const query = this.model.find({ userId }).sort({ createdAt: -1 });
    if (offset) query.skip(offset);
    if (limit) query.limit(limit);
    return query;
  }

  async findActiveJobs(): Promise<IRenderJob[]> {
    return this.model.find({ status: { $in: ["pending", "processing"] } });
  }

  async updateStatus(
    id: string,
    status: string,
    progress?: number,
  ): Promise<IRenderJob | null> {
    const update: any = { status };
    if (progress !== undefined) {
      update.progress = progress;
    }
    return this.model.findByIdAndUpdate(id, { $set: update }, { new: true });
  }
}

export const renderJobRepository = new RenderJobRepository();
