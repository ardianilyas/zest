import type { NextFunction, Request, Response } from "express";
import type { TicketService } from "./ticket.service";
import { HttpStatus } from "../../constants/http-status.constant";
import { validate } from "../../common/validate";
import { createTicketSchema, updateTicketSchema } from "./ticket.dto";

export class TicketController {
  constructor(private ticketService: TicketService) {}

  getTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tickets = await this.ticketService.getTickets(req.user?.userId as string);
      return res.status(HttpStatus.OK).json(tickets);
    } catch (error) {
      next(error);
    }
  }

  getTicketById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await this.ticketService.getTicketById(req.params.id as string);
      return res.status(HttpStatus.OK).json(ticket);
    } catch (error) {
      next(error);
    }
  }

  createTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(createTicketSchema, req.body);
      const ticket = await this.ticketService.createTicket(data);
      return res.status(HttpStatus.CREATED).json(ticket);
    } catch (error) {
      next(error);
    }
  }

  updateTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(updateTicketSchema, req.body);
      const ticket = await this.ticketService.updateTicket(req.params.id as string, data);
      return res.status(HttpStatus.OK).json(ticket);
    } catch (error) {
      next(error);
    }
  }

  deleteTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await this.ticketService.deleteTicket(req.params.id as string);
      return res.status(HttpStatus.NO_CONTENT).json(ticket);
    } catch (error) {
      next(error);
    }
  }
}