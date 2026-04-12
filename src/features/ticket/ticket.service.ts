import { eq } from "drizzle-orm";
import { db } from "../../config/database";
import { ticketComments, tickets } from "../../db/schema";
import type { CreateCommentDto, CreateTicketDto, UpdateTicketDto, UpdateTicketStatusDto } from "./ticket.dto";
import { NotFoundException } from "../../common/http-exception";
import { TICKET_ERROR_MESSAGES } from "./ticket.constant";

export class TicketService {
  async getTickets(userId: string) {
    return await db.select().from(tickets).where(eq(tickets.reporterId, userId));
  }

  async createComment(ticketId: string, authorId: string, data: CreateCommentDto) {
    return await db.insert(ticketComments).values({ ...data, ticketId, authorId }).returning();
  }

  async updateTicketStatus(ticketId: string, data: UpdateTicketStatusDto) {
    return await db.update(tickets).set(data).where(eq(tickets.id, ticketId)).returning();
  }

  async getTicketWithComments(ticketId: string) {
    return await db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
      with: {
        comments: true
      }
    });
  }

  async getTicketById(id: string) {
    return await db.select().from(tickets).where(eq(tickets.id, id));
  }

  async createTicket(data: CreateTicketDto, reporterId: string) {
    return await db.insert(tickets).values({ ...data, reporterId }).returning();
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