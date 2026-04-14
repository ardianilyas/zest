import { faker } from "@faker-js/faker";
import { db } from "../config/database";
import { categories } from "../db/schema";

export async function categorySeed(total: number = 10) {
  const data = await Promise.all(Array.from({ length: total }).map(async () => ({
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
  })));
  
  const created = await db.insert(categories).values(data).returning();

  console.log(`Seeded ${created.length} categories`);
  
  return created;
}