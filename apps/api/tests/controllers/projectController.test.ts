import { Request, Response, NextFunction } from "express";
import { projectService } from "../../src/services";
import * as projectController from "../../src/controllers/projectController";
import { HTTP_STATUS } from "../../src/constants";
import { TokenPayload } from "../../src/utils/jwt";

jest.mock("../../src/services");

describe("Project Controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  const mockUser: TokenPayload = {
    userId: "usr_123",
    email: "test@example.com",
    role: "user",
  };

  beforeEach(() => {
    mockReq = {
      user: mockUser,
      params: {},
      body: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("list projects", () => {
    it("should return projects for the user", async () => {
      const mockProjects = {
        data: [{ id: "prj_1", title: "Test Project" }],
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      };

      (projectService.listProjects as jest.Mock).mockResolvedValueOnce(
        mockProjects,
      );

      await projectController.list(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(projectService.listProjects).toHaveBeenCalledWith(
        mockUser.userId,
        {
          limit: undefined,
          offset: undefined,
          search: undefined,
        },
      );
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        data: mockProjects,
      });
    });

    it("should pass errors to next middleware", async () => {
      const error = new Error("Database error");
      (projectService.listProjects as jest.Mock).mockRejectedValueOnce(error);

      await projectController.list(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("createProject", () => {
    it("should create a new project", async () => {
      mockReq.body = { title: "New Manga", type: "manga" };
      const newProject = {
        id: "prj_2",
        title: "New Manga",
        userId: mockUser.userId,
      };

      (projectService.createProject as jest.Mock).mockResolvedValueOnce(
        newProject,
      );

      await projectController.create(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(projectService.createProject).toHaveBeenCalledWith(
        mockUser.userId,
        {
          title: "New Manga",
          type: "manga",
        },
      );
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        data: { project: newProject },
      });
    });
  });
});
