import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../../app";

import {
  TICKET_FULL_ROUTES,
  TICKET_ERROR_MESSAGES,
} from "../ticket.constant";
import {
  CATEGORY_FULL_ROUTES,
} from "../../category/category.constant";
import { getAdminCookie, registerAndLogin } from "../../../../test/auth";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const REGULAR_USER = {
  email: "ticketuser@example.com",
  password: "password123",
};

const TEST_CATEGORY = {
  name: "Bug Report",
  description: "Issues related to bugs",
};

/**
 * Creates a category (requires ADMIN) and returns its id.
 */
async function createTestCategory(adminCookie: string): Promise<string> {
  await request(app)
    .post(CATEGORY_FULL_ROUTES.CREATE)
    .set("Cookie", adminCookie)
    .send(TEST_CATEGORY);

  const listRes = await request(app)
    .get(CATEGORY_FULL_ROUTES.LIST)
    .set("Cookie", adminCookie);

  return listRes.body[0].id;
}

/**
 * Builds a valid ticket payload using real foreign-key ids.
 */
function buildTicketPayload(overrides: {
  categoryId: string;
  reporterId: string;
}) {
  return {
    title: "Login page is broken",
    description: "Users cannot log in with valid credentials",
    status: "OPEN",
    priority: "HIGH",
    categoryId: overrides.categoryId,
    reporterId: overrides.reporterId,
  };
}

/**
 * Creates a ticket and returns the supertest response.
 */
async function createTicket(
  cookie: string,
  data: Record<string, unknown>,
) {
  return request(app)
    .post(TICKET_FULL_ROUTES.create)
    .set("Cookie", cookie)
    .send(data);
}

/**
 * Extracts the user id from the JWT cookie by decoding its payload.
 */
function extractUserIdFromCookie(cookie: string): string {
  const tokenPart = cookie.split("=")[1];
  if (!tokenPart) {
    throw new Error(`Invalid cookie format: "${cookie}"`);
  }
  const token = tokenPart.split(";")[0];
  const payloadSegment = token?.split(".")[1];
  if (!payloadSegment) {
    throw new Error(`Invalid JWT format in cookie: "${cookie}"`);
  }
  const payload = JSON.parse(
    Buffer.from(payloadSegment, "base64").toString(),
  );
  return payload.userId;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Ticket Feature", () => {
  // ─── Authorization ─────────────────────────────────────────────────────────

  describe("Authorization", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get(TICKET_FULL_ROUTES.LIST);

      expect(res.status).toBe(401);
    });

    it("should return 401 for POST without authentication", async () => {
      const res = await request(app)
        .post(TICKET_FULL_ROUTES.create)
        .send({ title: "Test" });

      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/tickets ──────────────────────────────────────────────────────

  describe(`GET ${TICKET_FULL_ROUTES.LIST}`, () => {
    it("should return empty array when no tickets exist", async () => {
      const cookie = await registerAndLogin(REGULAR_USER);

      const res = await request(app)
        .get(TICKET_FULL_ROUTES.LIST)
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return only tickets reported by the authenticated user", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);

      // Create tickets as admin (reporter = admin)
      const adminUserId = extractUserIdFromCookie(adminCookie);
      const adminTicket = buildTicketPayload({
        categoryId,
        reporterId: adminUserId,
      });

      await createTicket(adminCookie, adminTicket);

      // Register regular user and create ticket as them
      const userCookie = await registerAndLogin(REGULAR_USER);
      const userId = extractUserIdFromCookie(userCookie);
      const userTicket = buildTicketPayload({
        categoryId,
        reporterId: userId,
      });
      userTicket.title = "My own ticket";

      await createTicket(userCookie, userTicket);

      // List should only return the user's own ticket
      const res = await request(app)
        .get(TICKET_FULL_ROUTES.LIST)
        .set("Cookie", userCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("title", "My own ticket");
    });
  });

  // ─── GET /api/tickets/:id ─────────────────────────────────────────────────

  describe(`GET ${TICKET_FULL_ROUTES.LIST}/:id`, () => {
    it("should return a ticket by id", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);
      const payload = buildTicketPayload({ categoryId, reporterId });

      await createTicket(adminCookie, payload);

      // Get ticket id from list
      const listRes = await request(app)
        .get(TICKET_FULL_ROUTES.LIST)
        .set("Cookie", adminCookie);

      const ticketId = listRes.body[0].id;

      const res = await request(app)
        .get(TICKET_FULL_ROUTES.byId(ticketId))
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty("id", ticketId);
      expect(res.body[0]).toHaveProperty("title", payload.title);
      expect(res.body[0]).toHaveProperty("status", "OPEN");
      expect(res.body[0]).toHaveProperty("priority", "HIGH");
    });

    it("should return empty array for non-existent id", async () => {
      const cookie = await registerAndLogin(REGULAR_USER);
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const res = await request(app)
        .get(TICKET_FULL_ROUTES.byId(fakeId))
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ─── POST /api/tickets ────────────────────────────────────────────────────

  describe(`POST ${TICKET_FULL_ROUTES.create}`, () => {
    it("should create a ticket with valid data", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);
      const payload = buildTicketPayload({ categoryId, reporterId });

      const res = await createTicket(adminCookie, payload);

      expect(res.status).toBe(201);
    });

    it("should return 400 when title is missing", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);

      const res = await request(app)
        .post(TICKET_FULL_ROUTES.create)
        .set("Cookie", adminCookie)
        .send({
          description: "Missing title",
          status: "OPEN",
          priority: "LOW",
          categoryId,
          reporterId,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toBeDefined();
    });

    it("should return 400 when description is missing", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);

      const res = await request(app)
        .post(TICKET_FULL_ROUTES.create)
        .set("Cookie", adminCookie)
        .send({
          title: "Some title",
          status: "OPEN",
          priority: "LOW",
          categoryId,
          reporterId,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 400 when status is invalid", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);

      const res = await request(app)
        .post(TICKET_FULL_ROUTES.create)
        .set("Cookie", adminCookie)
        .send({
          title: "Bad status",
          description: "Testing invalid status",
          status: "INVALID_STATUS",
          priority: "LOW",
          categoryId,
          reporterId,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 400 when priority is invalid", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);

      const res = await request(app)
        .post(TICKET_FULL_ROUTES.create)
        .set("Cookie", adminCookie)
        .send({
          title: "Bad priority",
          description: "Testing invalid priority",
          status: "OPEN",
          priority: "SUPER_URGENT",
          categoryId,
          reporterId,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 400 when categoryId is missing", async () => {
      const adminCookie = await getAdminCookie();
      const reporterId = extractUserIdFromCookie(adminCookie);

      const res = await request(app)
        .post(TICKET_FULL_ROUTES.create)
        .set("Cookie", adminCookie)
        .send({
          title: "No category",
          description: "Missing categoryId",
          status: "OPEN",
          priority: "LOW",
          reporterId,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 400 when reporterId is missing", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);

      const res = await request(app)
        .post(TICKET_FULL_ROUTES.create)
        .set("Cookie", adminCookie)
        .send({
          title: "No reporter",
          description: "Missing reporterId",
          status: "OPEN",
          priority: "LOW",
          categoryId,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should create a ticket without optional assigneeId", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);
      const payload = buildTicketPayload({ categoryId, reporterId });

      const res = await createTicket(adminCookie, payload);

      expect(res.status).toBe(201);
    });
  });

  // ─── PUT /api/tickets/:id ─────────────────────────────────────────────────

  describe(`PUT ${TICKET_FULL_ROUTES.LIST}/:id`, () => {
    it("should update a ticket", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);
      const payload = buildTicketPayload({ categoryId, reporterId });

      await createTicket(adminCookie, payload);

      const listRes = await request(app)
        .get(TICKET_FULL_ROUTES.LIST)
        .set("Cookie", adminCookie);

      const ticketId = listRes.body[0].id;

      const res = await request(app)
        .put(TICKET_FULL_ROUTES.update(ticketId))
        .set("Cookie", adminCookie)
        .send({
          title: "Updated title",
          status: "IN_PROGRESS",
          priority: "URGENT",
        });

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty("title", "Updated title");
      expect(res.body[0]).toHaveProperty("status", "IN_PROGRESS");
      expect(res.body[0]).toHaveProperty("priority", "URGENT");
    });

    it("should partially update a ticket (only status)", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);
      const payload = buildTicketPayload({ categoryId, reporterId });

      await createTicket(adminCookie, payload);

      const listRes = await request(app)
        .get(TICKET_FULL_ROUTES.LIST)
        .set("Cookie", adminCookie);

      const ticketId = listRes.body[0].id;

      const res = await request(app)
        .put(TICKET_FULL_ROUTES.update(ticketId))
        .set("Cookie", adminCookie)
        .send({ status: "RESOLVED" });

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty("status", "RESOLVED");
      // Original title should remain unchanged
      expect(res.body[0]).toHaveProperty("title", payload.title);
    });

    it("should return 404 when updating non-existent ticket", async () => {
      const cookie = await registerAndLogin(REGULAR_USER);
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const res = await request(app)
        .put(TICKET_FULL_ROUTES.update(fakeId))
        .set("Cookie", cookie)
        .send({ title: "Ghost Ticket" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(TICKET_ERROR_MESSAGES.NOT_FOUND);
    });

    it("should return 400 when update data is invalid", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);
      const payload = buildTicketPayload({ categoryId, reporterId });

      await createTicket(adminCookie, payload);

      const listRes = await request(app)
        .get(TICKET_FULL_ROUTES.LIST)
        .set("Cookie", adminCookie);

      const ticketId = listRes.body[0].id;

      const res = await request(app)
        .put(TICKET_FULL_ROUTES.update(ticketId))
        .set("Cookie", adminCookie)
        .send({ status: "NOT_A_REAL_STATUS" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });
  });

  // ─── DELETE /api/tickets/:id ──────────────────────────────────────────────

  describe(`DELETE ${TICKET_FULL_ROUTES.LIST}/:id`, () => {
    it("should delete a ticket", async () => {
      const adminCookie = await getAdminCookie();
      const categoryId = await createTestCategory(adminCookie);
      const reporterId = extractUserIdFromCookie(adminCookie);
      const payload = buildTicketPayload({ categoryId, reporterId });

      await createTicket(adminCookie, payload);

      const listRes = await request(app)
        .get(TICKET_FULL_ROUTES.LIST)
        .set("Cookie", adminCookie);

      const ticketId = listRes.body[0].id;

      const res = await request(app)
        .delete(TICKET_FULL_ROUTES.delete(ticketId))
        .set("Cookie", adminCookie);

      expect(res.status).toBe(204);

      // Verify it's gone
      const verifyRes = await request(app)
        .get(TICKET_FULL_ROUTES.byId(ticketId))
        .set("Cookie", adminCookie);

      expect(verifyRes.body).toEqual([]);
    });

    it("should return 404 when deleting non-existent ticket", async () => {
      const cookie = await registerAndLogin(REGULAR_USER);
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const res = await request(app)
        .delete(TICKET_FULL_ROUTES.delete(fakeId))
        .set("Cookie", cookie);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(TICKET_ERROR_MESSAGES.NOT_FOUND);
    });
  });
});
