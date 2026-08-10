import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../src/controllers/jobRoleController";
import type { JobRole } from "../src/models/jobRole";
import type { JobRoleService } from "../src/services/jobRoleService";

const mockJobRoles: JobRole[] = [
  {
    jobRoleId: 1,
    roleName: "Software Engineer",
    location: "Belfast",
    capabilityId: 1,
    bandId: 2,
    closingDate: new Date("2026-12-31"),
    statusId: 1,
  },
  {
    jobRoleId: 2,
    roleName: "Business Analyst",
    location: "Birmingham",
    capabilityId: 2,
    bandId: 3,
    closingDate: new Date("2026-11-30"),
    statusId: 1,
  },
];

const mockRequest = {} as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("JobRoleController", () => {
  let controller: JobRoleController;
  let jobRoleService: JobRoleService;

  beforeEach(() => {
    jobRoleService = {
      findAllJobRoles: vi.fn(),
    } as unknown as JobRoleService;
    controller = new JobRoleController(jobRoleService);
  });

  describe("getAllJobRoles", () => {
    it("should return 200 with a list of job roles", async () => {
      vi.mocked(jobRoleService.findAllJobRoles).mockResolvedValue(
        mockJobRoles as unknown as Awaited<
          ReturnType<typeof jobRoleService.findAllJobRoles>
        >,
      );
      const res = mockResponse();

      await controller.getAllJobRoles(mockRequest, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockJobRoles);
    });

    it("should return 200 with an empty array when there are no job roles", async () => {
      vi.mocked(jobRoleService.findAllJobRoles).mockResolvedValue([]);
      const res = mockResponse();

      await controller.getAllJobRoles(mockRequest, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should return 500 when the service throws an error", async () => {
      vi.mocked(jobRoleService.findAllJobRoles).mockRejectedValue(
        new Error("Service error"),
      );
      const res = mockResponse();

      await controller.getAllJobRoles(mockRequest, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch job roles",
      });
    });
  });
});
