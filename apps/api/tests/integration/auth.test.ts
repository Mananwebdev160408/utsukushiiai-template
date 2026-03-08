import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers";

describe("Auth Integration Tests", () => {
  beforeAll(async () => {
    // In a real test suite, you'd use an in-memory db or a specific test db
    // await connectTestDB();
  });

  afterAll(async () => {
    // await clearTestDB();
    // await closeTestDB();
  });

  describe("POST /api/auth/register", () => {
    it("should return validation error for missing fields", async () => {
      // Mock the app if the db isn't actually connected, or use real db
      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return unauthorized for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(response.status).toBe(401);
    });
  });
});
