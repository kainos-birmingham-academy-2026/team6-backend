import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../src/controllers/jobRoleController";
import type { JobRoleDetailedResponse } from "../src/models/JobRoleDetailedResponse";
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

const mockDetailedJobRole: JobRoleDetailedResponse = {
  jobRoleId: 1,
  roleName: "Software Engineer",
  location: "Belfast",
  capabilityId: 1,
  capabilityName: "Engineering",
  bandId: 2,
  bandName: "Associate",
  closingDate: new Date("2026-12-31"),
  statusName: "open",
};

const validJobRoleBody = {
  roleName: "Software Engineer",
  location: "Belfast",
  capabilityId: 1,
  bandId: 2,
  closingDate: "2026-12-31",
};

const mockRequest = {} as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe("JobRoleController", () => {
  let controller: JobRoleController;
  let jobRoleService: JobRoleService;

  beforeEach(() => {
    jobRoleService = {
      findAllJobRoles: vi.fn(),
      getJobRoleDetailById: vi.fn(),
      createJobRole: vi.fn(),
      updateJobRole: vi.fn(),
      deleteJobRole: vi.fn(),
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

  describe("createJobRole", () => {
    it("should return 201 with the created job role when data is valid", async () => {
      vi.mocked(jobRoleService.createJobRole).mockResolvedValue(
        mockDetailedJobRole,
      );
      const req = { body: validJobRoleBody } as Request;
      const res = mockResponse();

      await controller.createJobRole(req, res);

      expect(jobRoleService.createJobRole).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockDetailedJobRole);
    });

    it("should return 400 when required fields are missing", async () => {
      const req = { body: { roleName: "" } } as Request;
      const res = mockResponse();

      await controller.createJobRole(req, res);

      expect(jobRoleService.createJobRole).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when the capability or band does not exist", async () => {
      vi.mocked(jobRoleService.createJobRole).mockRejectedValue(
        new Error("Invalid capability or band"),
      );
      const req = { body: validJobRoleBody } as Request;
      const res = mockResponse();

      await controller.createJobRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid capability or band",
      });
    });

    it("should return 500 when the service throws an unexpected error", async () => {
      vi.mocked(jobRoleService.createJobRole).mockRejectedValue(
        new Error("Database error"),
      );
      const req = { body: validJobRoleBody } as Request;
      const res = mockResponse();

      await controller.createJobRole(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create job role",
      });
    });
  });

  describe("updateJobRole", () => {
    it("should return 200 with the updated job role when data is valid", async () => {
      vi.mocked(jobRoleService.updateJobRole).mockResolvedValue(
        mockDetailedJobRole,
      );
      const req = {
        params: { id: "1" },
        body: validJobRoleBody,
      } as unknown as Request;
      const res = mockResponse();

      await controller.updateJobRole(req, res);

      expect(jobRoleService.updateJobRole).toHaveBeenCalledWith(
        1,
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDetailedJobRole);
    });

    it("should return 400 for an invalid id", async () => {
      const req = {
        params: { id: "abc" },
        body: validJobRoleBody,
      } as unknown as Request;
      const res = mockResponse();

      await controller.updateJobRole(req, res);

      expect(jobRoleService.updateJobRole).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when the job role does not exist", async () => {
      vi.mocked(jobRoleService.updateJobRole).mockRejectedValue(
        new Error("Job role not found"),
      );
      const req = {
        params: { id: "999" },
        body: validJobRoleBody,
      } as unknown as Request;
      const res = mockResponse();

      await controller.updateJobRole(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Job role not found" });
    });
  });

  describe("deleteJobRole", () => {
    it("should return 204 when the job role is deleted", async () => {
      vi.mocked(jobRoleService.deleteJobRole).mockResolvedValue(undefined);
      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.deleteJobRole(req, res);

      expect(jobRoleService.deleteJobRole).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it("should return 404 when the job role does not exist", async () => {
      vi.mocked(jobRoleService.deleteJobRole).mockRejectedValue(
        new Error("Job role not found"),
      );
      const req = { params: { id: "999" } } as unknown as Request;
      const res = mockResponse();

      await controller.deleteJobRole(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Job role not found" });
    });

    it("should return 400 for an invalid id", async () => {
      const req = { params: { id: "abc" } } as unknown as Request;
      const res = mockResponse();

      await controller.deleteJobRole(req, res);

      expect(jobRoleService.deleteJobRole).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
