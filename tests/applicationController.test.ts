import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../src/controllers/applicationController";
import type { ApplicationService } from "../src/services/applicationService";

const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe("ApplicationController", () => {
  let applicationService: ApplicationService;
  let controller: ApplicationController;

  beforeEach(() => {
    applicationService = {
      applyForJobRole: vi.fn(),
      getMyApplications: vi.fn(),
      getApplicationsByJobRoleId: vi.fn(),
      hireApplicant: vi.fn(),
      rejectApplicant: vi.fn(),
    } as unknown as ApplicationService;

    controller = new ApplicationController(applicationService);
  });

  describe("getApplicationsByJobRoleId", () => {
    it("returns 200 with applications when job role exists", async () => {
      const mockApps = [
        {
          applicationId: 1,
          userId: 2,
          email: "user@example.com",
          applicationStatusName: "in progress",
          cv: "CV",
        },
      ];
      vi.mocked(
        applicationService.getApplicationsByJobRoleId,
      ).mockResolvedValue(mockApps);

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.getApplicationsByJobRoleId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockApps);
    });

    it("returns 400 for invalid job role id", async () => {
      const req = { params: { id: "invalid" } } as unknown as Request;
      const res = mockResponse();

      await controller.getApplicationsByJobRoleId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid job role id" });
    });

    it("returns 404 when job role is not found", async () => {
      vi.mocked(
        applicationService.getApplicationsByJobRoleId,
      ).mockRejectedValue(new Error("Job role not found"));

      const req = { params: { id: "99" } } as unknown as Request;
      const res = mockResponse();

      await controller.getApplicationsByJobRoleId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Job role not found" });
    });
  });

  describe("hireApplicant", () => {
    it("returns 200 when applicant is hired successfully", async () => {
      vi.mocked(applicationService.hireApplicant).mockResolvedValue({
        applicationId: 1,
        status: "hired",
      });

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.hireApplicant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        applicationId: 1,
        status: "hired",
      });
    });

    it("returns 400 when invalid application id", async () => {
      const req = { params: { id: "invalid" } } as unknown as Request;
      const res = mockResponse();

      await controller.hireApplicant(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid application id",
      });
    });

    it("returns 400 when application is not in progress", async () => {
      vi.mocked(applicationService.hireApplicant).mockRejectedValue(
        new Error("Application is not in progress"),
      );

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.hireApplicant(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Application is not in progress",
      });
    });

    it("returns 400 when no open positions available", async () => {
      vi.mocked(applicationService.hireApplicant).mockRejectedValue(
        new Error("No open positions available for this role"),
      );

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.hireApplicant(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No open positions available for this role",
      });
    });

    it("returns 404 when application is not found", async () => {
      vi.mocked(applicationService.hireApplicant).mockRejectedValue(
        new Error("Application not found"),
      );

      const req = { params: { id: "99" } } as unknown as Request;
      const res = mockResponse();

      await controller.hireApplicant(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Application not found" });
    });
  });

  describe("rejectApplicant", () => {
    it("returns 200 when applicant is rejected successfully", async () => {
      vi.mocked(applicationService.rejectApplicant).mockResolvedValue({
        applicationId: 1,
        status: "rejected",
      });

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.rejectApplicant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        applicationId: 1,
        status: "rejected",
      });
    });

    it("returns 400 when application is not in progress", async () => {
      vi.mocked(applicationService.rejectApplicant).mockRejectedValue(
        new Error("Application is not in progress"),
      );

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.rejectApplicant(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Application is not in progress",
      });
    });

    it("returns 404 when application is not found", async () => {
      vi.mocked(applicationService.rejectApplicant).mockRejectedValue(
        new Error("Application not found"),
      );

      const req = { params: { id: "99" } } as unknown as Request;
      const res = mockResponse();

      await controller.rejectApplicant(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Application not found" });
    });
  });
});
