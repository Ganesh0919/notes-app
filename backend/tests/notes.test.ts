import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { migrate } from "../src/db/migrate.js";
import { closePool } from "../src/db/pool.js";

const app = createApp();

describe("Notes API", () => {
  let noteId: string;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      console.warn("Skipping integration tests: DATABASE_URL not set");
      return;
    }
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /api/notes creates a note", async () => {
    if (!process.env.DATABASE_URL) return;

    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Test Note", content: "# Hello", tags: ["work"] });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test Note");
    expect(res.body.tags).toEqual(["work"]);
    noteId = res.body.id;
  });

  it("GET /api/notes lists notes with search", async () => {
    if (!process.env.DATABASE_URL) return;

    const res = await request(app).get("/api/notes?search=Test");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  it("PATCH /api/notes/:id updates a note", async () => {
    if (!process.env.DATABASE_URL || !noteId) return;

    const res = await request(app)
      .patch(`/api/notes/${noteId}`)
      .send({ title: "Updated Note" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Note");
  });

  it("GET /api/tags returns tags with counts", async () => {
    if (!process.env.DATABASE_URL) return;

    const res = await request(app).get("/api/tags");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("DELETE /api/notes/:id deletes a note", async () => {
    if (!process.env.DATABASE_URL || !noteId) return;

    const res = await request(app).delete(`/api/notes/${noteId}`);
    expect(res.status).toBe(204);
  });

  it("returns 400 for invalid create payload", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ tags: ["", "valid"] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
