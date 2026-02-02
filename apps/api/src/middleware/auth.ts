import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export function signToken(user: AuthUser) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name ?? undefined }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    (req as Request & { user?: AuthUser }).user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function getAuthUser(req: Request): AuthUser {
  return (req as Request & { user?: AuthUser }).user as AuthUser;
}
