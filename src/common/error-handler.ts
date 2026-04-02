import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpException } from "./http-exception";

const DEFAULT_ERROR_STATUS = 500;
const DEFAULT_ERROR_MESSAGE = "Internal server error";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    res.status(400).json({ message: "Validation failed", errors });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(DEFAULT_ERROR_STATUS).json({ message: DEFAULT_ERROR_MESSAGE });
}
