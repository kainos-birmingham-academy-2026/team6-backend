import argon2 from "argon2";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  jobRole: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock("../src/prismaClient", () => ({
  default: prismaMock,
}));

import { createApp } from "../src/app";

const app = createApp();
const testUser = {
  userId: 1,
  email: "applicant@example.com",
  userRole: "user",
};

const openJobRole = {
  jobRoleId: 10,
  roleName: "Software Engineer",
  location: "Birmingham",
  capabilityId: 1,
  bandId: 2,
  closingDate: new Date("2026-12-31"),
  statusId: 1,
  capability: {
    capabilityName: "Engineering",
  },
  band: {
    bandName: "Associate",
  },
  status: {
    statusName: "open",
  },
};

describe("integration endpoints", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "integration-test-secret";
    vi.clearAllMocks();
  });

  it("logs in and returns a bearer token", async () => {
    const passwordHash = await argon2.hash("Password!123");
    prismaMock.user.findUnique.mockResolvedValue({
      ...testUser,
      password: passwordHash,
    });

    const response = await request(app).post("/auth/login").send({
      email: "Applicant@Example.com",
      password: "Password!123",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toEqual({
      id: testUser.userId,
      email: testUser.email,
      role: testUser.userRole,
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: "applicant@example.com",
      },
    });
  });

  it("rejects login with the wrong password", async () => {
    const passwordHash = await argon2.hash("Password!123");
    prismaMock.user.findUnique.mockResolvedValue({
      ...testUser,
      password: passwordHash,
    });

    const response = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: "WrongPassword!123",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid email or password" });
  });

  it("views job roles after logging in", async () => {
    const passwordHash = await argon2.hash("Password!123");
    prismaMock.user.findUnique.mockResolvedValue({
      ...testUser,
      password: passwordHash,
    });
    prismaMock.jobRole.findMany.mockResolvedValue([openJobRole]);
    prismaMock.jobRole.count.mockResolvedValue(1);

    const loginResponse = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: "Password!123",
    });

    const response = await request(app)
      .get("/job-roles")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [
        {
          jobRoleId: openJobRole.jobRoleId,
          roleName: openJobRole.roleName,
          location: openJobRole.location,
          capabilityName: "Engineering",
          bandName: "Associate",
          statusName: "open",
          closingDate: openJobRole.closingDate.toISOString(),
        },
      ],
      total: 1,
      limit: 10,
      offset: 0,
    });
    expect(prismaMock.jobRole.findMany).toHaveBeenCalledWith({
      where: {
        status: {
          is: {
            statusName: "open",
          },
        },
      },
      orderBy: undefined,
      skip: 0,
      take: 10,
      include: {
        capability: {
          select: {
            capabilityName: true,
          },
        },
        band: {
          select: {
            bandName: true,
          },
        },
        status: {
          select: {
            statusName: true,
          },
        },
      },
    });
  });

  it("rejects viewing job roles without a token", async () => {
    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Authentication token is required",
    });
  });
});
