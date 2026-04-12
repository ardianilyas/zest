import { Router } from "express";
import { authGuard } from "../../middlewares/auth.middleware";
import { TicketService } from "./ticket.service";
import { TicketController } from "./ticket.controller";
import { TICKET_ROUTES } from "./ticket.constant";

const router = Router();
const ticketSetvice = new TicketService();
const ticketController = new TicketController(ticketSetvice);

router.use(authGuard);

router.get(TICKET_ROUTES.LIST, ticketController.getTickets);
router.get(TICKET_ROUTES.BY_ID, ticketController.getTicketById);
router.post(TICKET_ROUTES.CREATE, ticketController.createTicket);
router.put(TICKET_ROUTES.UPDATE, ticketController.updateTicket);
router.delete(TICKET_ROUTES.DELETE, ticketController.deleteTicket);

router.get(TICKET_ROUTES.COMMENTS.LIST, ticketController.getTicketComments);
router.post(TICKET_ROUTES.COMMENTS.CREATE, ticketController.createComment);

export default router;
