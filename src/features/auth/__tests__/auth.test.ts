import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../../app";
import "./setup";

const TEST_USER = {
  email: "test@example.com",
  password: "password123",
};

const COOKIE_NAME = "access_token";

function extractCookie(res: request.Response): string | undefined {
  const cookies = res.headers["set-cookie"];
  if (!cookies) return undefined;
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  return cookieArray.find((c: string) => c.startsWith(COOKIE_NAME));
}

describe("Auth Feature", () => {
  describe("POST /auth/register", () => {
    it("should register a new user and set cookie", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send(TEST_USER);

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.email).toBe(TEST_USER.email);
      expect(extractCookie(res)).toBeDefined();
    });

    it("should return 409 for duplicate email", async () => {
      await request(app).post("/auth/register").send(TEST_USER);

      const res = await request(app)
        .post("/auth/register")
        .send(TEST_USER);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Email already exists");
    });

    it("should return 400 for invalid email", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "not-an-email", password: "password123" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toBeDefined();
    });

    it("should return 400 for short password", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com", password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 400 for missing fields", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    it("should login and set cookie", async () => {
      await request(app).post("/auth/register").send(TEST_USER);

      const res = await request(app)
        .post("/auth/login")
        .send(TEST_USER);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(TEST_USER.email);
      expect(extractCookie(res)).toBeDefined();
    });

    it("should return 401 for wrong password", async () => {
      await request(app).post("/auth/register").send(TEST_USER);

      const res = await request(app)
        .post("/auth/login")
        .send({ email: TEST_USER.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 401 for non-existent email", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "nobody@example.com", password: "password123" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("POST /auth/logout", () => {
    it("should clear the cookie", async () => {
      const res = await request(app).post("/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");

      const cookie = extractCookie(res);
      if (cookie) {
        expect(cookie).toContain("Expires=");
      }
    });
  });

  describe("GET /auth/me", () => {
    it("should return user when authenticated", async () => {
      const registerRes = await request(app)
        .post("/auth/register")
        .send(TEST_USER);

      const cookie = extractCookie(registerRes);
      expect(cookie).toBeDefined();

      const res = await request(app)
        .get("/auth/me")
        .set("Cookie", cookie!);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(TEST_USER.email);
      expect(res.body.user).toHaveProperty("createdAt");
      expect(res.body.user).toHaveProperty("updatedAt");
    });

    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Authorization token is required");
    });

    it("should return 401 for invalid token", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Cookie", `${COOKIE_NAME}=invalid-token`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid or expired token");
    });
  });
});
