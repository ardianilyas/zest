import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UnauthorizedException } from "../../common/http-exception";
import { AUTH_ERROR_MESSAGES, COOKIE_NAME } from "./auth.constant";
import type { JwtPayload } from "./auth.dto";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;

  if (!token) {
    throw new UnauthorizedException(AUTH_ERROR_MESSAGES.TOKEN_MISSING);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedException(AUTH_ERROR_MESSAGES.TOKEN_INVALID));
  }
}
