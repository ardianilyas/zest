import z from "zod";
import { userRoleEnum } from "../../db/schema";

export const assignUserRoleDto = z.object({
  id: z.uuid().min(1, { error: "User ID is required" }),
  role: z.enum(userRoleEnum.enumValues),
});

export type AssignUserRoleDto = z.infer<typeof assignUserRoleDto>;