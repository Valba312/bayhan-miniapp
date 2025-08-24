import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "./error";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new ApiError(400, "Validation error", parsed.error.flatten()));
    }
    (req as any).data = parsed.data;
    next();
  };
}