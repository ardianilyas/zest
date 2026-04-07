import z from "zod";
import { ticketPriorityEnum, ticketStatusEnum } from "../../db/schema";

export const createTicketSchema = z.object({
  title: z.string().min(1, { error: "Title is required" }),
  description: z.string().min(1, { error: "Description is required" }),
  status: z.enum(ticketStatusEnum.enumValues),
  priority: z.enum(ticketPriorityEnum.enumValues),
  categoryId: z.uuid().min(1, { error: "Category is required" }),
  reporterId: z.uuid().min(1, { error: "Reporter is required" }),
  assigneeId: z.uuid().optional(),
  resolvedAt: z.date().optional()
});

export const updateTicketSchema = createTicketSchema.partial();

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
