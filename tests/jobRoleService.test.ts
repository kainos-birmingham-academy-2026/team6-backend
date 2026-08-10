import { beforeEach, describe, expect, it, vi } from "vitest";
import { BandName, CapabilityName } from "../src/models/jobRoleEnums";
import type { JobRoleResponse } from "../src/models/JobRoleResponse";
import { Status } from "../src/models/status";
import { JobRoleService } from "../src/services/jobRoleService";

vi.mock("../src/prismaClient", () => ({
  default: {
    jobRole: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from "../src/prismaClient";

const mockJobRolesFromDb = [
  {
    jobRoleId: 1,
    roleName: "Software Engineer",
    location: "Belfast",
    capabilityId: 1,
    bandId: 2,
    closingDate: new Date("2026-12-31"),
    statusId: 1,
    capability: { capabilityName: CapabilityName.Engineering },
    band: { bandName: BandName.Associate },
    status: { statusName: Status.Open },
  },
  {
    jobRoleId: 2,
    roleName: "Business Analyst",
    location: "Birmingham",
    capabilityId: 2,
    bandId: 3,
    closingDate: new Date("2026-11-30"),
    statusId: 1,
    capability: { capabilityName: CapabilityName.BusinessAnalysis },
    band: { bandName: BandName.Consultant },
    status: { statusName: Status.Open },
  },
];

const expectedResponse: JobRoleResponse[] = [
  {
    roleName: "Software Engineer",
    location: "Belfast",
    capabilityName: CapabilityName.Engineering,
    bandName: BandName.Associate,
    statusName: Status.Open,
    closingDate: new Date("2026-12-31"),
  },
  {
    roleName: "Business Analyst",
    location: "Birmingham",
    capabilityName: CapabilityName.BusinessAnalysis,
    bandName: BandName.Consultant,
    statusName: Status.Open,
    closingDate: new Date("2026-11-30"),
  },
];

describe("JobRoleService", () => {
  let service: JobRoleService;

  beforeEach(() => {
    service = new JobRoleService();
    vi.clearAllMocks();
  });

  describe("findAllJobRoles", () => {
    it("should return open job roles as JobRoleResponse objects", async () => {
      vi.mocked(prisma.jobRole.findMany).mockResolvedValue(
        mockJobRolesFromDb as unknown as Awaited<
          ReturnType<typeof prisma.jobRole.findMany>
        >,
      );

      const result = await service.findAllJobRoles();

      expect(prisma.jobRole.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            is: {
              statusName: Status.Open,
            },
          },
        },
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
      expect(result).toEqual(expectedResponse);
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
