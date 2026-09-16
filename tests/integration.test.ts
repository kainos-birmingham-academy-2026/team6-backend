import argon2 from "argon2";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  jobRole: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  applications: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  applicationStatus: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
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

  it("allows admin to view applications for a role and forbids regular users", async () => {
    const adminUser = {
      userId: 2,
      email: "admin@example.com",
      userRole: "admin",
    };
    const passwordHash = await argon2.hash("AdminPassword!123");
    prismaMock.user.findUnique.mockResolvedValue({
      ...adminUser,
      password: passwordHash,
    });
    prismaMock.jobRole.findUnique.mockResolvedValue(openJobRole);
    prismaMock.applications.findMany.mockResolvedValue([
      {
        applicationId: 101,
        userId: 1,
        jobRoleId: 10,
        applicationStatusId: 1,
        cv: "my_cv.pdf",
        user: { userId: 1, email: "applicant@example.com", userRole: "user" },
        applicationStatus: {
          applicationStatusId: 1,
          applicationStatusName: "in progress",
        },
      },
    ]);

    const adminLogin = await request(app).post("/auth/login").send({
      email: adminUser.email,
      password: "AdminPassword!123",
    });

    const adminResponse = await request(app)
      .get("/job-roles/10/applications")
      .set("Authorization", `Bearer ${adminLogin.body.token}`);

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body).toEqual([
      {
        applicationId: 101,
        userId: 1,
        email: "applicant@example.com",
        applicationStatusName: "in progress",
        cv: "my_cv.pdf",
      },
    ]);

    // Regular user attempt
    const userPassHash = await argon2.hash("Password!123");
    prismaMock.user.findUnique.mockResolvedValue({
      ...testUser,
      password: userPassHash,
    });
    const userLogin = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: "Password!123",
    });

    const userResponse = await request(app)
      .get("/job-roles/10/applications")
      .set("Authorization", `Bearer ${userLogin.body.token}`);

    expect(userResponse.status).toBe(403);
  });

  it("allows admin to hire an applicant", async () => {
    const adminUser = {
      userId: 2,
      email: "admin@example.com",
      userRole: "admin",
    };
    const passwordHash = await argon2.hash("AdminPassword!123");
    prismaMock.user.findUnique.mockResolvedValue({
      ...adminUser,
      password: passwordHash,
    });

    prismaMock.applications.findUnique.mockResolvedValue({
      applicationId: 101,
      userId: 1,
      jobRoleId: 10,
      applicationStatusId: 1,
      cv: "my_cv.pdf",
      applicationStatus: {
        applicationStatusId: 1,
        applicationStatusName: "in progress",
      },
      jobRole: { jobRoleId: 10, numberOfOpenPositions: 2, statusId: 1 },
    });
    prismaMock.applicationStatus.findFirst.mockResolvedValue({
      applicationStatusId: 2,
      applicationStatusName: "hired",
    });
    prismaMock.$transaction.mockResolvedValue([
      {
        applicationId: 101,
        userId: 1,
        jobRoleId: 10,
        applicationStatusId: 2,
        cv: "my_cv.pdf",
      },
      {
        jobRoleId: 10,
        numberOfOpenPositions: 1,
      },
    ]);

    const adminLogin = await request(app).post("/auth/login").send({
      email: adminUser.email,
      password: "AdminPassword!123",
    });

    const hireResponse = await request(app)
      .post("/applications/101/hire")
      .set("Authorization", `Bearer ${adminLogin.body.token}`);

    expect(hireResponse.status).toBe(200);
    expect(hireResponse.body).toEqual({
      applicationId: 101,
      status: "hired",
    });
  });

  it("allows admin to reject an applicant", async () => {
    const adminUser = {
      userId: 2,
      email: "admin@example.com",
      userRole: "admin",
    };
    const passwordHash = await argon2.hash("AdminPassword!123");
    prismaMock.user.findUnique.mockResolvedValue({
      ...adminUser,
      password: passwordHash,
    });

    prismaMock.applications.findUnique.mockResolvedValue({
      applicationId: 101,
      userId: 1,
      jobRoleId: 10,
      applicationStatusId: 1,
      cv: "my_cv.pdf",
      applicationStatus: {
        applicationStatusId: 1,
        applicationStatusName: "in progress",
      },
      jobRole: { jobRoleId: 10, numberOfOpenPositions: 2, statusId: 1 },
    });
    prismaMock.applicationStatus.findFirst.mockResolvedValue({
      applicationStatusId: 3,
      applicationStatusName: "rejected",
    });
    prismaMock.applications.update.mockResolvedValue({
      applicationId: 101,
      userId: 1,
      jobRoleId: 10,
      applicationStatusId: 3,
      cv: "my_cv.pdf",
    });

    const adminLogin = await request(app).post("/auth/login").send({
      email: adminUser.email,
      password: "AdminPassword!123",
    });

    const rejectResponse = await request(app)
      .post("/applications/101/reject")
      .set("Authorization", `Bearer ${adminLogin.body.token}`);

    expect(rejectResponse.status).toBe(200);
    expect(rejectResponse.body).toEqual({
      applicationId: 101,
      status: "rejected",
    });
  });
});
