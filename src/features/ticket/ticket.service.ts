import { eq } from "drizzle-orm";
import { db } from "../../config/database";
import { tickets } from "../../db/schema";
import type { CreateTicketDto, UpdateTicketDto } from "./ticket.dto";
import { NotFoundException } from "../../common/http-exception";
import { TICKET_ERROR_MESSAGES } from "./ticket.constant";

export class TicketService {
  async getTickets(userId: string) {
    return await db.select().from(tickets).where(eq(tickets.reporterId, userId));
  }

  async getTicketById(id: string) {
    return await db.select().from(tickets).where(eq(tickets.id, id));
  }

  async createTicket(data: CreateTicketDto) {
    return await db.insert(tickets).values(data);
  }

  async updateTicket(id: string, data: UpdateTicketDto) {
    const ticket = await db.update(tickets).set(data).where(eq(tickets.id, id)).returning();

    if (ticket.length === 0) {
      throw new NotFoundException(TICKET_ERROR_MESSAGES.NOT_FOUND);
    }

    return ticket;
  }

  async deleteTicket(id: string) {
    const ticket = await db.delete(tickets).where(eq(tickets.id, id)).returning();

    if (ticket.length === 0) {
      throw new NotFoundException(TICKET_ERROR_MESSAGES.NOT_FOUND);
    }

    return true;
  }
}