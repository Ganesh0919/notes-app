import type { Request, Response, NextFunction } from "express";
import type { ApiError } from "../types/note.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err);

  const apiError: ApiError = {
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  };

  res.status(500).json(apiError);
}

export function notFoundHandler(_req: Request, res: Response): void {
  const apiError: ApiError = {
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  };
  res.status(404).json(apiError);
}
