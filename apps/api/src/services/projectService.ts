import { projectRepository } from "../repositories/projectRepository";
import { panelRepository } from "../repositories/panelRepository";
import { renderJobRepository } from "../repositories/renderJobRepository";
import { NotFoundError, ForbiddenError } from "../errors";
import { generateId } from "../utils";

export class ProjectService {
  async createProject(userId: string, data: any) {
    return projectRepository.create({
      _id: generateId("prj"),
      userId,
      ...data,
      status: "draft",
    });
  }

  async getProject(userId: string, id: string) {
    const project = await projectRepository.findById(id);
    if (!project) throw new NotFoundError("Project", id);
    if (project.userId !== userId) throw new ForbiddenError();
    return project;
  }

  async listProjects(
    userId: string,
    query: { limit?: number; offset?: number; search?: string },
  ) {
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let projects;
    let total;

    if (query.search) {
      projects = await projectRepository.searchByTitle(userId, query.search);
      total = projects.length;
    } else {
      projects = await projectRepository.findByUserId(userId, limit, offset);
      total = await projectRepository.countByUserId(userId);
    }

    return { projects, total, limit, offset };
  }

  async updateProject(userId: string, id: string, data: any) {
    const project = await this.getProject(userId, id);
    return projectRepository.update(id, data);
  }

  async deleteProject(userId: string, id: string) {
    const project = await this.getProject(userId, id);

    // Cascade delete panels
    await panelRepository.deleteByProjectId(id);

    // In a real app, delete files from storage too
    // await storageService.deleteProjectFiles(id);

    return projectRepository.delete(id);
  }
}

export const projectService = new ProjectService();
