import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApplicationDao } from "../src/dao/applicationDao";
import type { JobRoleDaoImpl } from "../src/dao/jobRoleDao";
import type { AnalyticsService } from "../src/services/analyticsService";
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
  let analytics: AnalyticsService;
  let service: ApplicationService;

  beforeEach(() => {
    applicationDao = {
      createApplication: vi.fn(),
      findApplicationById: vi.fn(),
      findApplicationStatusIdByName: vi.fn(),
      findApplicationsByUserId: vi.fn(),
      findApplicationByUserAndJobRole: vi.fn(),
      updateApplicationStatus: vi.fn(),
    } as unknown as ApplicationDao;

    jobRoleDao = {
      findJobRoleById: vi.fn(),
    } as unknown as JobRoleDaoImpl;

    analytics = {
      trackEvent: vi.fn(),
    } as unknown as AnalyticsService;

    service = new ApplicationService(applicationDao, jobRoleDao, analytics);
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

    it("tracks a job_application_created GA event when the application is created", async () => {
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

      await service.applyForJobRole(5, 1);

      expect(analytics.trackEvent).toHaveBeenCalledWith("user-5", {
        name: "job_application_created",
        params: { applicationId: 10, jobRoleId: 1 },
      });
    });
  });

  describe("updateApplicationStatus", () => {
    it("updates the status and tracks a job_application_rejected GA event", async () => {
      vi.mocked(applicationDao.findApplicationById).mockResolvedValue({
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 1,
        cv: "CV submitted",
      });
      vi.mocked(applicationDao.findApplicationStatusIdByName).mockResolvedValue(
        2,
      );
      vi.mocked(applicationDao.updateApplicationStatus).mockResolvedValue({
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 2,
        cv: "CV submitted",
      });

      const result = await service.updateApplicationStatus(10, "rejected");

      expect(result).toEqual({ applicationId: 10, status: "rejected" });
      expect(applicationDao.updateApplicationStatus).toHaveBeenCalledWith(
        10,
        2,
      );
      expect(analytics.trackEvent).toHaveBeenCalledWith("user-5", {
        name: "job_application_rejected",
        params: { applicationId: 10 },
      });
    });

    it("updates the status and tracks a job_application_hired GA event when accepted", async () => {
      vi.mocked(applicationDao.findApplicationById).mockResolvedValue({
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 1,
        cv: "CV submitted",
      });
      vi.mocked(applicationDao.findApplicationStatusIdByName).mockResolvedValue(
        3,
      );
      vi.mocked(applicationDao.updateApplicationStatus).mockResolvedValue({
        applicationId: 10,
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 3,
        cv: "CV submitted",
      });

      await service.updateApplicationStatus(10, "accepted");

      expect(analytics.trackEvent).toHaveBeenCalledWith("user-5", {
        name: "job_application_hired",
        params: { applicationId: 10 },
      });
    });

    it("throws when the application does not exist", async () => {
      vi.mocked(applicationDao.findApplicationById).mockResolvedValue(null);

      await expect(
        service.updateApplicationStatus(999, "rejected"),
      ).rejects.toThrow("Application not found");
      expect(applicationDao.updateApplicationStatus).not.toHaveBeenCalled();
    });
  });
});
