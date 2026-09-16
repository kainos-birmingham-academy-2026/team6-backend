import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApplicationDao } from "../src/dao/applicationDao";
import type { JobRoleDaoImpl } from "../src/dao/jobRoleDao";
import { ApplicationService } from "../src/services/applicationService";

const mockJobRole = {
  jobRoleId: 1,
  roleName: "Software Engineer",
  location: "Belfast",
  capabilityId: 1,
  bandId: 2,
  closingDate: new Date("2026-12-31"),
  statusId: 1,
};

describe("ApplicationService", () => {
  let applicationDao: ApplicationDao;
  let jobRoleDao: JobRoleDaoImpl;
  let service: ApplicationService;

  beforeEach(() => {
    applicationDao = {
      createApplication: vi.fn(),
      findApplicationById: vi.fn(),
      findApplicationStatusIdByName: vi.fn(),
      findApplicationsByUserId: vi.fn(),
      findApplicationsByJobRoleId: vi.fn(),
      findApplicationWithJobRoleById: vi.fn(),
      hireApplication: vi.fn(),
      rejectApplication: vi.fn(),
      findApplicationByUserAndJobRole: vi.fn(),
    } as unknown as ApplicationDao;

    jobRoleDao = {
      findJobRoleById: vi.fn(),
    } as unknown as JobRoleDaoImpl;

    service = new ApplicationService(applicationDao, jobRoleDao);
  });

  describe("applyForJobRole", () => {
    it("creates an application when the job role exists and the user hasn't applied before", async () => {
      vi.mocked(jobRoleDao.findJobRoleById).mockResolvedValue(
        mockJobRole as unknown as Awaited<
          ReturnType<typeof jobRoleDao.findJobRoleById>
        >,
      );
      vi.mocked(
        applicationDao.findApplicationByUserAndJobRole,
      ).mockResolvedValue(null);
      vi.mocked(applicationDao.findApplicationStatusIdByName).mockResolvedValue(
        1,
      );
      vi.mocked(applicationDao.createApplication).mockResolvedValue({
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 1,
        cv: "CV submitted",
      });

      const result = await service.applyForJobRole(5, 1);

      expect(result).toEqual({ applicationId: 10, status: "in progress" });
      expect(applicationDao.createApplication).toHaveBeenCalledWith({
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 1,
        cv: "CV submitted",
      });
    });

    it("throws when the job role does not exist", async () => {
      vi.mocked(jobRoleDao.findJobRoleById).mockResolvedValue(null);

      await expect(service.applyForJobRole(5, 1)).rejects.toThrow(
        "Job role not found",
      );
      expect(applicationDao.createApplication).not.toHaveBeenCalled();
    });

    it("throws when the user has already applied for the job role", async () => {
      vi.mocked(jobRoleDao.findJobRoleById).mockResolvedValue(
        mockJobRole as unknown as Awaited<
          ReturnType<typeof jobRoleDao.findJobRoleById>
        >,
      );
      vi.mocked(
        applicationDao.findApplicationByUserAndJobRole,
      ).mockResolvedValue({
        applicationId: 9,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 1,
        cv: "CV submitted",
      });

      await expect(service.applyForJobRole(5, 1)).rejects.toThrow(
        "You have already applied for this job role",
      );
      expect(applicationDao.createApplication).not.toHaveBeenCalled();
    });
  });

  describe("getMyApplications", () => {
    it("returns formatted applications for a user", async () => {
      const mockApplications = [
        {
          applicationId: 1,
          userId: 5,
          jobRoleId: 1,
          applicationStatusId: 1,
          cv: "CV",
          applicationStatus: { applicationStatusName: "in progress" },
          jobRole: {
            jobRoleId: 1,
            roleName: "Software Engineer",
            location: "Belfast",
            closingDate: new Date("2026-12-31"),
            capability: { capabilityName: "Backend" },
            band: { bandName: "Mid" },
          },
        },
      ];

      vi.mocked(applicationDao.findApplicationsByUserId).mockResolvedValue(
        mockApplications as any,
      );

      const result = await service.getMyApplications(5);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        applicationId: 1,
        applicationStatusName: "in progress",
        jobRoleId: 1,
        roleName: "Software Engineer",
        location: "Belfast",
        capabilityName: "Backend",
        bandName: "Mid",
        closingDate: new Date("2026-12-31"),
      });
    });
  });

  describe("getApplicationsByJobRoleId", () => {
    it("returns formatted applications for a job role", async () => {
      vi.mocked(jobRoleDao.findJobRoleById).mockResolvedValue(
        mockJobRole as unknown as Awaited<
          ReturnType<typeof jobRoleDao.findJobRoleById>
        >,
      );

      const mockApplications = [
        {
          applicationId: 1,
          userId: 10,
          jobRoleId: 1,
          applicationStatusId: 1,
          cv: "CV data",
          user: {
            userId: 10,
            email: "applicant@example.com",
            userRole: "user",
          },
          applicationStatus: {
            applicationStatusId: 1,
            applicationStatusName: "in progress",
          },
        },
      ];

      vi.mocked(applicationDao.findApplicationsByJobRoleId).mockResolvedValue(
        mockApplications,
      );

      const result = await service.getApplicationsByJobRoleId(1);

      expect(result).toEqual([
        {
          applicationId: 1,
          userId: 10,
          email: "applicant@example.com",
          applicationStatusName: "in progress",
          cv: "CV data",
        },
      ]);
      expect(jobRoleDao.findJobRoleById).toHaveBeenCalledWith(1);
      expect(applicationDao.findApplicationsByJobRoleId).toHaveBeenCalledWith(
        1,
      );
    });

    it("throws when the job role does not exist", async () => {
      vi.mocked(jobRoleDao.findJobRoleById).mockResolvedValue(null);

      await expect(service.getApplicationsByJobRoleId(99)).rejects.toThrow(
        "Job role not found",
      );
      expect(applicationDao.findApplicationsByJobRoleId).not.toHaveBeenCalled();
    });
  });

  describe("hireApplicant", () => {
    it("successfully hires an applicant and updates status and open positions", async () => {
      const mockApplication = {
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 1,
        cv: "CV",
        applicationStatus: {
          applicationStatusId: 1,
          applicationStatusName: "in progress",
        },
        jobRole: { jobRoleId: 1, numberOfOpenPositions: 2, statusId: 1 },
      };

      vi.mocked(
        applicationDao.findApplicationWithJobRoleById,
      ).mockResolvedValue(mockApplication);
      vi.mocked(applicationDao.findApplicationStatusIdByName).mockResolvedValue(
        2,
      );
      vi.mocked(applicationDao.hireApplication).mockResolvedValue({
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 2,
        cv: "CV",
      });

      const result = await service.hireApplicant(10);

      expect(result).toEqual({ applicationId: 10, status: "hired" });
      expect(applicationDao.hireApplication).toHaveBeenCalledWith(10, 1, 2);
    });

    it("throws when application is not found", async () => {
      vi.mocked(
        applicationDao.findApplicationWithJobRoleById,
      ).mockResolvedValue(null);

      await expect(service.hireApplicant(99)).rejects.toThrow(
        "Application not found",
      );
    });

    it("throws when application is not in progress", async () => {
      const mockApplication = {
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 2,
        cv: "CV",
        applicationStatus: {
          applicationStatusId: 2,
          applicationStatusName: "hired",
        },
        jobRole: { jobRoleId: 1, numberOfOpenPositions: 2, statusId: 1 },
      };

      vi.mocked(
        applicationDao.findApplicationWithJobRoleById,
      ).mockResolvedValue(mockApplication);

      await expect(service.hireApplicant(10)).rejects.toThrow(
        "Application is not in progress",
      );
    });

    it("throws when no open positions available", async () => {
      const mockApplication = {
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 1,
        cv: "CV",
        applicationStatus: {
          applicationStatusId: 1,
          applicationStatusName: "in progress",
        },
        jobRole: { jobRoleId: 1, numberOfOpenPositions: 0, statusId: 1 },
      };

      vi.mocked(
        applicationDao.findApplicationWithJobRoleById,
      ).mockResolvedValue(mockApplication);

      await expect(service.hireApplicant(10)).rejects.toThrow(
        "No open positions available for this role",
      );
    });
  });

  describe("rejectApplicant", () => {
    it("successfully rejects an applicant", async () => {
      const mockApplication = {
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 1,
        cv: "CV",
        applicationStatus: {
          applicationStatusId: 1,
          applicationStatusName: "in progress",
        },
        jobRole: { jobRoleId: 1, numberOfOpenPositions: 2, statusId: 1 },
      };

      vi.mocked(
        applicationDao.findApplicationWithJobRoleById,
      ).mockResolvedValue(mockApplication);
      vi.mocked(applicationDao.findApplicationStatusIdByName).mockResolvedValue(
        3,
      );
      vi.mocked(applicationDao.rejectApplication).mockResolvedValue({
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 3,
        cv: "CV",
      });

      const result = await service.rejectApplicant(10);

      expect(result).toEqual({ applicationId: 10, status: "rejected" });
      expect(applicationDao.rejectApplication).toHaveBeenCalledWith(10, 3);
    });

    it("throws when application is not found", async () => {
      vi.mocked(
        applicationDao.findApplicationWithJobRoleById,
      ).mockResolvedValue(null);

      await expect(service.rejectApplicant(99)).rejects.toThrow(
        "Application not found",
      );
    });

    it("throws when application is not in progress", async () => {
      const mockApplication = {
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 3,
        cv: "CV",
        applicationStatus: {
          applicationStatusId: 3,
          applicationStatusName: "rejected",
        },
        jobRole: { jobRoleId: 1, numberOfOpenPositions: 2, statusId: 1 },
      };

      vi.mocked(
        applicationDao.findApplicationWithJobRoleById,
      ).mockResolvedValue(mockApplication);

      await expect(service.rejectApplicant(10)).rejects.toThrow(
        "Application is not in progress",
      );
    });
  });
});
