import { faker } from "@faker-js/faker";
import { ticketPriorityEnum, tickets, ticketStatusEnum, type Category, type NewTicket, type User } from "../db/schema";
import { db } from "../config/database";

export async function ticketSeed(users: User[], categories: Category[]) {
  const data: NewTicket[] = [];

  for (const user of users) {
    const numTicketsPerUser = faker.number.int({ min: 4, max: 12 });

    for (let i = 0; i < numTicketsPerUser; i++) {
      const randomCategory = faker.helpers.arrayElement(categories);

      data.push({
        title: faker.lorem.word(),
        description: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(ticketStatusEnum.enumValues),
        priority: faker.helpers.arrayElement(ticketPriorityEnum.enumValues),
        reporterId: user.id,
        categoryId: randomCategory.id,
      });
    }
  }

  const created = await db.insert(tickets).values(data).returning();

  console.log(`Seeded ${data.length} tickets`);

  return created;
}