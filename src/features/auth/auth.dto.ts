import { z } from "zod";
import { userRoleEnum } from "../../db/schema";

export const registerSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

export interface JwtPayload {
  userId: number;
  email: string;
  role: (typeof userRoleEnum.enumValues)[number];
}
