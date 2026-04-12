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
  COMMENTS: {
    LIST: "/:ticketId/comments",
    CREATE: "/:ticketId/comments",
  }
} as const;

export const TICKET_FULL_ROUTES = {
  LIST: TICKET_BASE_PATH,
  byId: (id: string) => `${TICKET_BASE_PATH}/${id}`,
  create: TICKET_BASE_PATH,
  update: (id: string) => `${TICKET_BASE_PATH}/${id}`,
  delete: (id: string) => `${TICKET_BASE_PATH}/${id}`,
} as const;