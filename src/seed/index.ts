import { db } from "../config/database";
import { categories, ticketComments, tickets, users } from "../db/schema";
import { categorySeed } from "./categories.seed";
import { ticketSeed } from "./tickets.seed";
import { userSeed } from "./user.seed";
import "dotenv/config";

async function clearDb() {
  await db.delete(ticketComments);
  await db.delete(tickets);
  await db.delete(categories);
  await db.delete(users);
}

async function main() {
  await clearDb();
  
  const users = await userSeed();
  const categories = await categorySeed(20);
  await ticketSeed(users, categories);
}

main().catch((err) => {
  console.log(err);
}).finally(() => process.exit());