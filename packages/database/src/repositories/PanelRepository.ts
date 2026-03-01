import { Panel, IPanel } from "../models/Panel";
import { BaseRepository } from "./BaseRepository";

export class PanelRepository extends BaseRepository<IPanel> {
  constructor() {
    super(Panel);
  }

  async findByProjectId(projectId: string): Promise<IPanel[]> {
    return this.model.find({ projectId }).sort({ order: 1 });
  }

  async bulkUpdateOrder(orders: { id: string; order: number }[]) {
    const bulkOps = orders.map((o) => ({
      updateOne: {
        filter: { _id: o.id },
        update: { order: o.order },
      },
    }));
    return this.model.bulkWrite(bulkOps);
  }

  async deleteByProjectId(projectId: string) {
    return this.model.deleteMany({ projectId });
  }
}

export const panelRepository = new PanelRepository();
