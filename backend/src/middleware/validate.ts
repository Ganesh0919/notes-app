import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import type { ApiError } from "../types/note.js";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const apiError: ApiError = {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        };
        res.status(400).json(apiError);
        return;
      }
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as Request["query"];
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const apiError: ApiError = {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        };
        res.status(400).json(apiError);
        return;
      }
      next(error);
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as Request["params"];
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const apiError: ApiError = {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid URL parameters",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        };
        res.status(400).json(apiError);
        return;
      }
      next(error);
    }
  };
}
