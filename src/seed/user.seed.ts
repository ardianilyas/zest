import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { db } from '../config/database';
import { userRoleEnum, users, type NewUser } from '../db/schema';

export async function userSeed(total: number = 10) {
  const data: NewUser[] = await Promise.all(Array.from({ length: total }).map(async () => ({
    email: faker.internet.email(),
    password: await bcrypt.hash('password', 10),
    role: faker.helpers.arrayElement(userRoleEnum.enumValues),
  })));

  const created = await db.insert(users).values(data).returning();
  
  console.log(`Seeded ${created.length} users`);

  return created;
}