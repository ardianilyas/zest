import z from "zod";
import { userRoleEnum, users } from "../../db/schema";
import type { InferSelectModel } from "drizzle-orm";
import type { userSelect } from "./user.select";

export type User = InferSelectModel<typeof users>;
export type UserResponseDto = Pick<User, keyof typeof userSelect>;

export const assignUserRoleDto = z.object({
  id: z.uuid().min(1, { error: "User ID is required" }),
  role: z.enum(userRoleEnum.enumValues),
});

export type AssignUserRoleDto = z.infer<typeof assignUserRoleDto>;
