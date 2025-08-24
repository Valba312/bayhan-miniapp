import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "Not Found"));
}

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || (err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500);
  const payload = { error: true, message: err.message || "Internal Server Error", details: err.details };
  if (status >= 500) console.error("[error]", err);
  res.status(status).json(payload);
}