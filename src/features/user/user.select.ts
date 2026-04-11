import { users } from "../../db/schema";

export const userSelect = {
  id: users.id,
  email: users.email
};