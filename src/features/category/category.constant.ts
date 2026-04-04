import { API_BASE_PATH } from "../../constants/common.constant";

// CATEGORY ERROR MESSAGES
export const CATEGORY_ERROR_MESSAGES = {
  NOT_FOUND: "Category not found",
} as const;

// API ROUTES
export const CATEGORY_BASE_PATH = `${API_BASE_PATH}/categories`;

export const CATEGORY_ROUTES = {
  LIST: "/",
  BY_ID: "/:id",
  CREATE: "/",
  UPDATE: "/:id",
  DELETE: "/:id",
} as const;

export const CATEGORY_FULL_ROUTES = {
  LIST: CATEGORY_BASE_PATH,
  byId: (id: string) => `${CATEGORY_BASE_PATH}/${id}`,
  CREATE: CATEGORY_BASE_PATH,
  update: (id: string) => `${CATEGORY_BASE_PATH}/${id}`,
  delete: (id: string) => `${CATEGORY_BASE_PATH}/${id}`,
} as const;
