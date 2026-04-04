import { afterAll, afterEach, beforeAll } from "vitest";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import { env } from "../src/config/env";

let pool: pg.Pool;

export function getTestDb() {
  return drizzle(pool);
}

beforeAll(async () => {
  pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  const db = drizzle(pool);
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
  } catch (error: any) {
    const isAlreadyExistsError = 
      error.code === "42P07" || 
      error.cause?.code === "42P07" || 
      String(error.cause).includes("already exists");
    
    if (!isAlreadyExistsError) {
      console.warn("Migration failed during test setup:", error);
      throw error;
    }
  }
});

afterEach(async () => {
  const db = drizzle(pool);
  await db.execute(sql`TRUNCATE TABLE ticket_comments, tickets, categories, users RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  await pool.end();
});
