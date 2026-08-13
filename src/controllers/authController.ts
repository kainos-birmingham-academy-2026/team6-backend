import argon2 from "argon2";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/userRole";
import prisma from "../prismaClient";

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
// Must be more than 8 characters
// Must contain:
// - at least 1 lowercase
// - at least 1 uppercase
// - at least 1 special character
const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

  return passwordRegex.test(password);
};

// =============================
// REGISTER
// =============================
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check email and password were provided
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Make sure email/password are strings
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password must be valid text values",
      });
    }

    // Remove spaces and convert email to lowercase
    const normalisedEmail = email.trim().toLowerCase();

    // Validate email
    if (!isValidEmail(normalisedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Validate password
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be more than 8 characters and contain an uppercase letter, lowercase letter and special character",
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalisedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    // Argon2:
    // - generates a random salt automatically
    // - hashes the password
    // - stores the salt inside the resulting hash
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    // Create user
    // Role is ALWAYS "user"
    // The user cannot register themselves as admin
    const user = await prisma.user.create({
      data: {
        email: normalisedEmail,
        password: passwordHash,
        userRole: UserRole.User,
      },
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.userId,
        email: user.email,
        role: user.userRole,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// =============================
// LOGIN
// =============================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check fields exist
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password must be valid text values",
      });
    }

    const normalisedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!isValidEmail(normalisedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email: normalisedEmail,
      },
    });

    // Don't reveal whether email exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Argon2 reads the salt from the stored hash
    // and checks the entered password
    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Get JWT secret from .env
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Create login token
    const token = jwt.sign(
      {
        userId: user.userId,
        role: user.userRole,
      },
      jwtSecret,
      {
        expiresIn: "1h",
      },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.userId,
        email: user.email,
        role: user.userRole,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
