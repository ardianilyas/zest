import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../../app";

import {
  CATEGORY_FULL_ROUTES,
  CATEGORY_ERROR_MESSAGES,
} from "../category.constant";
import { getAdminCookie, registerAndLogin } from "../../../../test/auth";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const REGULAR_USER = {
  email: "user@example.com",
  password: "password123",
};

const TEST_CATEGORY = {
  name: "Bug Report",
  description: "Issues related to bugs",
};

async function createCategory(
  cookie: string,
  data: { name: string; description?: string } = TEST_CATEGORY
) {
  return request(app)
    .post(CATEGORY_FULL_ROUTES.CREATE)
    .set("Cookie", cookie)
    .send(data);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Category Feature", () => {
  // ─── Authorization ───────────────────────────────────────────────────────

  describe("Authorization", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get(CATEGORY_FULL_ROUTES.LIST);

      expect(res.status).toBe(401);
    });

    it("should return 403 when user is not ADMIN", async () => {
      const cookie = await registerAndLogin(REGULAR_USER);

      const res = await request(app)
        .get(CATEGORY_FULL_ROUTES.LIST)
        .set("Cookie", cookie);

      expect(res.status).toBe(403);
    });
  });

  // ─── GET /api/categories ─────────────────────────────────────────────────

  describe(`GET ${CATEGORY_FULL_ROUTES.LIST}`, () => {
    it("should return empty array when no categories exist", async () => {
      const cookie = await getAdminCookie();

      const res = await request(app)
        .get(CATEGORY_FULL_ROUTES.LIST)
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return all categories", async () => {
      const cookie = await getAdminCookie();

      await createCategory(cookie, { name: "Bug Report" });
      await createCategory(cookie, { name: "Feature Request" });

      const res = await request(app)
        .get(CATEGORY_FULL_ROUTES.LIST)
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  // ─── GET /api/categories/:id ──────────────────────────────────────────────

  describe(`GET ${CATEGORY_FULL_ROUTES.LIST}:id`, () => {
    it("should return a category by id", async () => {
      const cookie = await getAdminCookie();

      // Create a category first
      const createRes = await createCategory(cookie);

      // The service returns the raw insert result — extract the ID
      // Drizzle insert().values() without .returning() returns different shapes
      // Let's get it from the list
      const listRes = await request(app)
        .get(CATEGORY_FULL_ROUTES.LIST)
        .set("Cookie", cookie);

      const categoryId = listRes.body[0].id;

      const res = await request(app)
        .get(CATEGORY_FULL_ROUTES.byId(categoryId))
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty("id", categoryId);
      expect(res.body[0]).toHaveProperty("name", TEST_CATEGORY.name);
    });

    it("should return empty array for non-existent id", async () => {
      const cookie = await getAdminCookie();
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const res = await request(app)
        .get(CATEGORY_FULL_ROUTES.byId(fakeId))
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ─── POST /api/categories ─────────────────────────────────────────────────

  describe(`POST ${CATEGORY_FULL_ROUTES.CREATE}`, () => {
    it("should create a category", async () => {
      const cookie = await getAdminCookie();

      const res = await createCategory(cookie);

      expect(res.status).toBe(201);
    });

    it("should return 400 when name is missing", async () => {
      const cookie = await getAdminCookie();

      const res = await request(app)
        .post(CATEGORY_FULL_ROUTES.CREATE)
        .set("Cookie", cookie)
        .send({ description: "No name provided" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toBeDefined();
    });

    it("should return 400 when name is empty string", async () => {
      const cookie = await getAdminCookie();

      const res = await request(app)
        .post(CATEGORY_FULL_ROUTES.CREATE)
        .set("Cookie", cookie)
        .send({ name: "" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should create category without description", async () => {
      const cookie = await getAdminCookie();

      const res = await request(app)
        .post(CATEGORY_FULL_ROUTES.CREATE)
        .set("Cookie", cookie)
        .send({ name: "Minimal Category" });

      expect(res.status).toBe(201);
    });
  });

  // ─── PUT /api/categories/:id ──────────────────────────────────────────────

  describe(`PUT ${CATEGORY_FULL_ROUTES.LIST}:id`, () => {
    it("should update a category", async () => {
      const cookie = await getAdminCookie();

      await createCategory(cookie);

      const listRes = await request(app)
        .get(CATEGORY_FULL_ROUTES.LIST)
        .set("Cookie", cookie);

      const categoryId = listRes.body[0].id;

      const res = await request(app)
        .put(CATEGORY_FULL_ROUTES.update(categoryId))
        .set("Cookie", cookie)
        .send({ name: "Updated Name", description: "Updated description" });

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty("name", "Updated Name");
      expect(res.body[0]).toHaveProperty("description", "Updated description");
    });

    it("should return 404 when updating non-existent category", async () => {
      const cookie = await getAdminCookie();
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const res = await request(app)
        .put(CATEGORY_FULL_ROUTES.update(fakeId))
        .set("Cookie", cookie)
        .send({ name: "Ghost Category" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(CATEGORY_ERROR_MESSAGES.NOT_FOUND);
    });

    it("should return 400 when update data is invalid", async () => {
      const cookie = await getAdminCookie();

      await createCategory(cookie);

      const listRes = await request(app)
        .get(CATEGORY_FULL_ROUTES.LIST)
        .set("Cookie", cookie);

      const categoryId = listRes.body[0].id;

      const res = await request(app)
        .put(CATEGORY_FULL_ROUTES.update(categoryId))
        .set("Cookie", cookie)
        .send({ name: "" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });
  });

  // ─── DELETE /api/categories/:id ───────────────────────────────────────────

  describe(`DELETE ${CATEGORY_FULL_ROUTES.LIST}:id`, () => {
    it("should delete a category", async () => {
      const cookie = await getAdminCookie();

      await createCategory(cookie);

      const listRes = await request(app)
        .get(CATEGORY_FULL_ROUTES.LIST)
        .set("Cookie", cookie);

      const categoryId = listRes.body[0].id;

      const res = await request(app)
        .delete(CATEGORY_FULL_ROUTES.delete(categoryId))
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body).toBe(true);

      // Verify it's gone
      const verifyRes = await request(app)
        .get(CATEGORY_FULL_ROUTES.byId(categoryId))
        .set("Cookie", cookie);

      expect(verifyRes.body).toEqual([]);
    });

    it("should return 404 when deleting non-existent category", async () => {
      const cookie = await getAdminCookie();
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const res = await request(app)
        .delete(CATEGORY_FULL_ROUTES.delete(fakeId))
        .set("Cookie", cookie);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(CATEGORY_ERROR_MESSAGES.NOT_FOUND);
    });
  });
});
