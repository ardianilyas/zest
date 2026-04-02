import { z } from "zod";
import { userRoleEnum } from "../../db/schema";
import { ZOD_ERROR_MESSAGE } from "./auth.constant";

export const registerSchema = z.object({
  email: z.email(ZOD_ERROR_MESSAGE.EMAIL_INVALID),
  password: z.string().min(8, ZOD_ERROR_MESSAGE.PASSWORD_INVALID),
});

export const loginSchema = z.object({
  email: z.email(ZOD_ERROR_MESSAGE.EMAIL_INVALID),
  password: z.string().min(1, ZOD_ERROR_MESSAGE.PASSWORD_REQUIRED),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

export interface JwtPayload {
  userId: number;
  email: string;
  role: (typeof userRoleEnum.enumValues)[number];
}
