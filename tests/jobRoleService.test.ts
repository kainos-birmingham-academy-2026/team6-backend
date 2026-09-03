import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRoleResponse } from "../src/models/JobRoleResponse";
import { BandName, CapabilityName } from "../src/models/jobRoleEnums";
import { Status } from "../src/models/status";
import { JobRoleService } from "../src/services/jobRoleService";

vi.mock("../src/prismaClient", () => ({
  default: {
    jobRole: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    status: {
      findFirst: vi.fn(),
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
    jobRoleId: 1,
    roleName: "Software Engineer",
    location: "Belfast",
    capabilityName: CapabilityName.Engineering,
    bandName: BandName.Associate,
    statusName: Status.Open,
    closingDate: new Date("2026-12-31"),
  },
  {
    jobRoleId: 2,
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
      vi.mocked(prisma.jobRole.count).mockResolvedValue(2);

      const result = await service.findAllJobRoles(10, 0);

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
        orderBy: undefined,
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        items: expectedResponse,
        total: 2,
        limit: 10,
        offset: 0,
      });
    });

    it("should return an empty array when there are no job roles", async () => {
      vi.mocked(prisma.jobRole.findMany).mockResolvedValue([]);
      vi.mocked(prisma.jobRole.count).mockResolvedValue(0);

      const result = await service.findAllJobRoles(10, 0);

      expect(result).toEqual({
        items: [],
        total: 0,
        limit: 10,
        offset: 0,
      });
    });

    it("should throw an error when the database call fails", async () => {
      vi.mocked(prisma.jobRole.findMany).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(service.findAllJobRoles(10, 0)).rejects.toThrow(
        "Database error",
      );
    });

    it("should request the requested page and preserve sorting", async () => {
      vi.mocked(prisma.jobRole.findMany).mockResolvedValue(
        mockJobRolesFromDb as unknown as Awaited<
          ReturnType<typeof prisma.jobRole.findMany>
        >,
      );
      vi.mocked(prisma.jobRole.count).mockResolvedValue(25);

      const result = await service.findAllJobRoles(10, 10, "roleName", "asc");

      expect(prisma.jobRole.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { roleName: "asc" },
          skip: 10,
          take: 10,
        }),
      );
      expect(result.total).toBe(25);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(10);
    });
  });

  describe("createJobRole", () => {
    const newJobRoleInput = {
      roleName: "Software Engineer",
      location: "Belfast",
      capabilityId: 1,
      bandId: 2,
      closingDate: new Date("2026-12-31"),
    };

    it("should create a job role with the open status", async () => {
      vi.mocked(prisma.status.findFirst).mockResolvedValue({
        statusId: 1,
        statusName: Status.Open,
      });
      vi.mocked(prisma.jobRole.create).mockResolvedValue({
        ...mockJobRolesFromDb[0],
        ...newJobRoleInput,
      } as unknown as Awaited<ReturnType<typeof prisma.jobRole.create>>);

      const result = await service.createJobRole(newJobRoleInput);

      expect(prisma.jobRole.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            statusId: 1,
            roleName: "Software Engineer",
          }),
        }),
      );
      expect(result.roleName).toBe("Software Engineer");
    });

    it("should throw an error when the open status is not configured", async () => {
      vi.mocked(prisma.status.findFirst).mockResolvedValue(null);

      await expect(service.createJobRole(newJobRoleInput)).rejects.toThrow(
        "Open status is not configured",
      );
      expect(prisma.jobRole.create).not.toHaveBeenCalled();
    });
  });

  describe("updateJobRole", () => {
    const updateInput = {
      roleName: "Updated Role",
      location: "London",
      capabilityId: 1,
      bandId: 2,
      closingDate: new Date("2026-12-31"),
    };

    it("should update an existing job role", async () => {
      vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(
        mockJobRolesFromDb[0] as unknown as Awaited<
          ReturnType<typeof prisma.jobRole.findUnique>
        >,
      );
      vi.mocked(prisma.jobRole.update).mockResolvedValue({
        ...mockJobRolesFromDb[0],
        ...updateInput,
      } as unknown as Awaited<ReturnType<typeof prisma.jobRole.update>>);

      const result = await service.updateJobRole(1, updateInput);

      expect(result.roleName).toBe("Updated Role");
    });

    it("should throw an error when the job role does not exist", async () => {
      vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(null);

      await expect(service.updateJobRole(999, updateInput)).rejects.toThrow(
        "Job role not found",
      );
      expect(prisma.jobRole.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteJobRole", () => {
    it("should delete an existing job role", async () => {
      vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(
        mockJobRolesFromDb[0] as unknown as Awaited<
          ReturnType<typeof prisma.jobRole.findUnique>
        >,
      );
      vi.mocked(prisma.jobRole.delete).mockResolvedValue(
        mockJobRolesFromDb[0] as unknown as Awaited<
          ReturnType<typeof prisma.jobRole.delete>
        >,
      );

      await expect(service.deleteJobRole(1)).resolves.toBeUndefined();
      expect(prisma.jobRole.delete).toHaveBeenCalledWith({
        where: { jobRoleId: 1 },
      });
    });

    it("should throw an error when the job role does not exist", async () => {
      vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(null);

      await expect(service.deleteJobRole(999)).rejects.toThrow(
        "Job role not found",
      );
      expect(prisma.jobRole.delete).not.toHaveBeenCalled();
    });
  });
});
