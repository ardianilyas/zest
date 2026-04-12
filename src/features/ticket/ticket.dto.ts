import z from "zod";
import { ticketPriorityEnum, ticketStatusEnum } from "../../db/schema";

export const createTicketSchema = z.object({
  title: z.string().min(1, { error: "Title is required" }),
  description: z.string().min(1, { error: "Description is required" }),
  status: z.enum(ticketStatusEnum.enumValues).optional(),
  priority: z.enum(ticketPriorityEnum.enumValues).optional(),
  categoryId: z.uuid().min(1, { error: "Category is required" }),
  assigneeId: z.uuid().optional(),
  resolvedAt: z.date().optional()
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(ticketStatusEnum.enumValues)
});

export const createCommentSchema = z.object({
  content: z.string().min(1, { error: "Comment is required" })
})

export const updateTicketSchema = createTicketSchema.partial();

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
export type UpdateTicketStatusDto = z.infer<typeof updateTicketStatusSchema>;
export type CreateCommentDto = z.infer<typeof createCommentSchema>;
