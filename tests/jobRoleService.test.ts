import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRole } from "../src/models/jobRole";
import { JobRoleService } from "../src/services/jobRoleService";

vi.mock("../src/prismaClient", () => ({
  default: {
    jobRole: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from "../src/prismaClient";

const mockJobRoles: JobRole[] = [
  {
    jobRoleId: 1,
    roleName: "Software Engineer",
    location: "Belfast",
    capabilityId: 1,
    bandId: 2,
    closingDate: new Date("2026-12-31"),
    status: "open",
  },
  {
    jobRoleId: 2,
    roleName: "Business Analyst",
    location: "Birmingham",
    capabilityId: 2,
    bandId: 3,
    closingDate: new Date("2026-11-30"),
    status: "open",
  },
];

describe("JobRoleService", () => {
  let service: JobRoleService;

  beforeEach(() => {
    service = new JobRoleService();
    vi.clearAllMocks();
  });

  describe("findAllJobRoles", () => {
    it("should return all job roles", async () => {
      vi.mocked(prisma.jobRole.findMany).mockResolvedValue(
        mockJobRoles as unknown as Awaited<
          ReturnType<typeof prisma.jobRole.findMany>
        >,
      );

      const result = await service.findAllJobRoles();

      expect(prisma.jobRole.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual(mockJobRoles);
    });

    it("should return an empty array when there are no job roles", async () => {
      vi.mocked(prisma.jobRole.findMany).mockResolvedValue([]);

      const result = await service.findAllJobRoles();

      expect(result).toEqual([]);
    });

    it("should throw an error when the database call fails", async () => {
      vi.mocked(prisma.jobRole.findMany).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(service.findAllJobRoles()).rejects.toThrow("Database error");
    });
  });
});
