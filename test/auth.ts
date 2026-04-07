import request from "supertest";
import app from "../src/app";
import { AUTH_FULL_ROUTES, COOKIE_NAME } from "../src/features/auth/auth.constant";

const ADMIN_USER = {
  email: "admin@example.com",
  password: "password123",
};

export async function registerAndLogin(
  user: { email: string; password: string }
): Promise<string> {
  const registerRes = await request(app)
    .post(AUTH_FULL_ROUTES.REGISTER)
    .send(user);

  const cookies = registerRes.headers["set-cookie"];
  if (!cookies) throw new Error("No cookie returned from register");
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  const cookie = cookieArray.find((c: string) => c.startsWith(COOKIE_NAME));
  if (!cookie) throw new Error("Auth cookie not found");
  return cookie;
}

export async function getAdminCookie(): Promise<string> {
  // Register admin user
  await request(app)
    .post(AUTH_FULL_ROUTES.REGISTER)
    .send(ADMIN_USER);

  // Promote to ADMIN via direct SQL (the test setup pool handles this)
  const { db } = await import("../src/config/database");
  const { users } = await import("../src/db/schema");
  const { eq } = await import("drizzle-orm");

  await db
    .update(users)
    .set({ role: "ADMIN" })
    .where(eq(users.email, ADMIN_USER.email));

  // Login to get a fresh token with ADMIN role
  const loginRes = await request(app)
    .post(AUTH_FULL_ROUTES.LOGIN)
    .send(ADMIN_USER);

  const cookies = loginRes.headers["set-cookie"];
  if (!cookies) throw new Error("No cookie returned from login");
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  const cookie = cookieArray.find((c: string) => c.startsWith(COOKIE_NAME));
  if (!cookie) throw new Error("Auth cookie not found");
  return cookie;
}