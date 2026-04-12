import { API_BASE_PATH } from "../../constants/common.constant";

// TICKET ERROR MESSAGES
export const TICKET_ERROR_MESSAGES = {
  NOT_FOUND: "Ticket not found",
} as const;

export const TICKET_BASE_PATH = `${API_BASE_PATH}/tickets`;

export const TICKET_ROUTES = {
  LIST: "/",
  BY_ID: "/:id",
  CREATE: "/",
  UPDATE: "/:id",
  DELETE: "/:id",
  UPDATE_STATUS: "/:id/status",
  COMMENTS: {
    LIST: "/:ticketId/comments",
    CREATE: "/:ticketId/comments",
  }
} as const;

export const TICKET_FULL_ROUTES = {
  LIST: TICKET_BASE_PATH,
  BY_ID: TICKET_BASE_PATH + TICKET_ROUTES.BY_ID,
  CREATE: TICKET_BASE_PATH + TICKET_ROUTES.CREATE,
  UPDATE: TICKET_BASE_PATH + TICKET_ROUTES.UPDATE,
  DELETE: TICKET_BASE_PATH + TICKET_ROUTES.DELETE,
  COMMENTS: {
    LIST: TICKET_BASE_PATH + TICKET_ROUTES.COMMENTS.LIST,
    CREATE: TICKET_BASE_PATH + TICKET_ROUTES.COMMENTS.CREATE,
  }
} as const;