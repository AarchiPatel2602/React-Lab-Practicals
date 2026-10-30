const { describe, it } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

// Ensure NODE_ENV is test
process.env.NODE_ENV = "test";
const app = require("../app");

describe("Task Management API Test Suite", () => {
    describe("GET /tasks (Existing Task Endpoint Security)", () => {
        it("should reject requests without authorization token with 401", async () => {
            const res = await request(app).get("/tasks");

            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.message, "Authorization token is required");
        });

        it("should reject requests with invalid authorization token with 401", async () => {
            const res = await request(app)
                .get("/tasks")
                .set("Authorization", "Bearer invalid_token_123");

            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.message, "Invalid or expired token");
        });
    });

    describe("POST /tasks (Existing Task Creation Endpoint)", () => {
        it("should reject unauthenticated task creation with 401", async () => {
            const res = await request(app)
                .post("/tasks")
                .send({ title: "Unauthorized Task", description: "Testing" });

            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.message, "Authorization token is required");
        });
    });

    describe("GET /api/cache/stats (Cache Stats Endpoint Security)", () => {
        it("should reject unauthenticated requests to cache stats with 401", async () => {
            const res = await request(app).get("/api/cache/stats");

            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.message, "Authorization token is required");
        });
    });

    describe("POST /api/ai/generate-description (Practical 13 AI Integration)", () => {
        it("should return 400 if task title is missing or empty", async () => {
            const res = await request(app)
                .post("/api/ai/generate-description")
                .send({});

            assert.strictEqual(res.status, 400);
            assert.ok(res.body.error.includes("Task title is required"));
        });
    });
});
