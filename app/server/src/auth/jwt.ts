import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../middlewares/error";

const SECRET = process.env.SESSION_SECRET || "dev_secret";

export interface JwtPayload {
  uid: number;
  role: string;
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyJwt(token: string): JwtPayload {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    throw new ApiError(401, "Invalid token");
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return next(new Error("Unauthorized"));
  try {
    const payload = verifyJwt(token);
    (req as any).user = payload;
    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
}

const allowedRoles = ["ADMIN", "OWNER"];

export function requireRole(role: "ADMIN" | "OWNER") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayload | undefined;
    if (!user) return next(new Error("Unauthorized"));
    if (!allowedRoles.includes(user.role)) return next(new Error("Forbidden"));
    if (role === "ADMIN" && user.role !== "ADMIN") return next(new Error("Forbidden"));
    next();
  };
}