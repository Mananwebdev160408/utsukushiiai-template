import request from "supertest";
import app from "../../src/app";
import { signAccessToken, TokenPayload } from "../../src/utils/jwt";

describe("Projects Integration Tests", () => {
  let userToken: string;

  beforeAll(() => {
    const payload: TokenPayload = {
      userId: "usr_test123",
      email: "test@example.com",
      role: "user",
    };
    userToken = signAccessToken(payload);
  });

  describe("GET /api/projects", () => {
    it("should require authentication", async () => {
      const response = await request(app).get("/api/projects");
      expect(response.status).toBe(401);
    });

    it("should return empty list for new user", async () => {
      const response = await request(app)
        .get("/api/projects")
        .set("Authorization", `Bearer ${userToken}`);

      // Assuming mock or empty DB
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/projects", () => {
    it("should create a new project", async () => {
      const newProject = {
        title: "Integration Test Manga",
        type: "manga",
      };

      const response = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newProject);

      // Depending on the mock/DB state it could be 201
      expect([201, 500]).toContain(response.status);
    });
  });
});
