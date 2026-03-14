import { panelRepository } from "../repositories/panelRepository";
import { projectService } from "./projectService";
import { NotFoundError } from "../errors";
import { generateId } from "../utils";

export class PanelService {
  async createPanel(userId: string, projectId: string, data: any) {
    // Verify project ownership
    await projectService.getProject(userId, projectId);

    return panelRepository.create({
      _id: generateId("pnl"),
      projectId,
      ...data,
    });
  }

  async listPanels(userId: string, projectId: string) {
    await projectService.getProject(userId, projectId);
    return panelRepository.findByProjectId(projectId);
  }

  async updatePanel(
    userId: string,
    projectId: string,
    panelId: string,
    data: any,
  ) {
    await projectService.getProject(userId, projectId);

    const panel = await panelRepository.findById(panelId);
    if (!panel || panel.projectId !== projectId) {
      throw new NotFoundError("Panel", panelId);
    }

    return panelRepository.update(panelId, data);
  }

  async deletePanel(userId: string, projectId: string, panelId: string) {
    await projectService.getProject(userId, projectId);

    const panel = await panelRepository.findById(panelId);
    if (!panel || panel.projectId !== projectId) {
      throw new NotFoundError("Panel", panelId);
    }

    return panelRepository.delete(panelId);
  }

  async reorderPanels(
    userId: string,
    projectId: string,
    orders: { id: string; order: number }[],
  ) {
    await projectService.getProject(userId, projectId);
    await panelRepository.bulkUpdateOrder(orders);
  }
}

export const panelService = new PanelService();
