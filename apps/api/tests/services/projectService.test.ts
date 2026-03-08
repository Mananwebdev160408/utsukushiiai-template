import { projectService } from "../../src/services";
import { projectRepository } from "../../src/repositories";
import { NotFoundError, ForbiddenError } from "../../src/errors";

jest.mock("../../src/repositories");

describe("Project Service", () => {
  const mockUserId = "usr_123";
  const mockProject = {
    _id: "prj_1",
    id: "prj_1",
    title: "Test Manga",
    type: "manga",
    userId: mockUserId,
    status: "draft",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProject", () => {
    it("should return a project if it belongs to the user", async () => {
      (projectRepository.findById as jest.Mock).mockResolvedValueOnce(
        mockProject,
      );

      const result = await projectService.getProject(mockUserId, "prj_1");

      expect(projectRepository.findById).toHaveBeenCalledWith("prj_1");
      expect(result).toEqual(mockProject);
    });

    it("should throw NotFoundError if project does not exist", async () => {
      (projectRepository.findById as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        projectService.getProject(mockUserId, "prj_nonexistent"),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError if project belongs to another user", async () => {
      const otherUserProject = { ...mockProject, userId: "usr_999" };
      (projectRepository.findById as jest.Mock).mockResolvedValueOnce(
        otherUserProject,
      );

      await expect(
        projectService.getProject(mockUserId, "prj_1"),
      ).rejects.toThrow();
    });
  });

  describe("createProject", () => {
    it("should create and return a new project", async () => {
      (projectRepository.create as jest.Mock).mockResolvedValueOnce(
        mockProject,
      );

      const result = await projectService.createProject(mockUserId, {
        title: "Test Manga",
        type: "manga",
      });

      expect(projectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Manga",
          type: "manga",
          userId: mockUserId,
          status: "draft",
        }),
      );
      expect(result).toEqual(mockProject);
    });
  });
});
