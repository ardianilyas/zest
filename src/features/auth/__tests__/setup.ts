import { afterAll, afterEach, beforeAll } from "vitest";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import { env } from "../../../config/env";

let pool: pg.Pool;

export function getTestDb() {
  return drizzle(pool);
}

beforeAll(async () => {
  pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./drizzle" });
});

afterEach(async () => {
  const db = drizzle(pool);
  await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  await pool.end();
});
