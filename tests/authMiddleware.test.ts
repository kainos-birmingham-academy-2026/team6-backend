import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  authenticateToken,
  authorizeRoles,
} from "../src/middleware/authMiddleware";
import { UserRole } from "../src/models/userRole";

const JWT_SECRET = "test-secret";

const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = () => vi.fn() as unknown as NextFunction;

describe("authenticateToken", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("rejects requests with no Authorization header", () => {
    const req = { headers: {} } as Request;
    const res = mockResponse();
    const next = mockNext();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Authentication token is required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects requests with a malformed Authorization header", () => {
    const req = { headers: { authorization: "Token abc123" } } as Request;
    const res = mockResponse();
    const next = mockNext();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an invalid or expired token", () => {
    const req = {
      headers: { authorization: "Bearer not-a-real-token" },
    } as Request;
    const res = mockResponse();
    const next = mockNext();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 500 when JWT_SECRET is not configured", () => {
    process.env.JWT_SECRET = "";
    const token = jwt.sign({ userId: 1, role: UserRole.User }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockResponse();
    const next = mockNext();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the decoded user and calls next for a valid token", () => {
    const token = jwt.sign({ userId: 42, role: UserRole.Admin }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockResponse();
    const next = mockNext();

    authenticateToken(req, res, next);

    expect(req.user).toEqual({ userId: 42, role: UserRole.Admin });
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("authorizeRoles", () => {
  it("rejects when no user has been attached to the request", () => {
    const req = {} as Request;
    const res = mockResponse();
    const next = mockNext();

    authorizeRoles(UserRole.Admin)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a user whose role is not permitted", () => {
    const req = { user: { userId: 1, role: UserRole.User } } as Request;
    const res = mockResponse();
    const next = mockNext();

    authorizeRoles(UserRole.Admin)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "You do not have permission to perform this action",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("allows a user whose role is permitted", () => {
    const req = { user: { userId: 1, role: UserRole.Admin } } as Request;
    const res = mockResponse();
    const next = mockNext();

    authorizeRoles(UserRole.Admin, UserRole.User)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
