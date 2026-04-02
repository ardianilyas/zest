import type { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../common/http-exception";
import type { userRoleEnum } from "../db/schema";

type Role = (typeof userRoleEnum.enumValues)[number];

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      // Assuming authGuard has already checked and verified the token
      return next(new ForbiddenException("User context is missing"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenException("You do not have permission to perform this action"));
    }

    next();
  };
}
