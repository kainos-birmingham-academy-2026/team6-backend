import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "../models/userRole";

export interface AuthenticatedUser {
  userId: number;
  role: UserRole;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
  }
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

// Requires a valid JWT on the Authorization header for all routes it is applied to.
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ error: "Authentication token is required" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({ error: "Server authentication is not configured" });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as {
      userId: number;
      role: UserRole;
    };
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Restricts a route to the given roles. Must run after authenticateToken.
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication token is required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res
        .status(403)
        .json({ error: "You do not have permission to perform this action" });
      return;
    }

    next();
  };
}
