import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApplicationDao } from "../src/dao/applicationDao";
import type { JobRoleDaoImpl } from "../src/dao/jobRoleDao";
import { ApplicationService } from "../src/services/applicationService";
import type { BlobStorageService } from "../src/services/blobStorageService";

const mockCvFile = {
  buffer: Buffer.from("cv-content"),
  originalName: "cv.pdf",
  mimeType: "application/pdf",
};

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
  let blobStorageService: BlobStorageService;
  let service: ApplicationService;

  beforeEach(() => {
    applicationDao = {
      createApplication: vi.fn(),
      findApplicationById: vi.fn(),
      findApplicationStatusIdByName: vi.fn(),
      findApplicationsByUserId: vi.fn(),
      findApplicationByUserAndJobRole: vi.fn(),
    } as unknown as ApplicationDao;

    jobRoleDao = {
      findJobRoleById: vi.fn(),
    } as unknown as JobRoleDaoImpl;

    blobStorageService = {
      uploadCv: vi.fn().mockResolvedValue("5/1/generated-cv.pdf"),
    } as unknown as BlobStorageService;

    service = new ApplicationService(
      applicationDao,
      jobRoleDao,
      blobStorageService,
    );
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
        cvBlobPath: "5/1/generated-cv.pdf",
        cvScanStatus: "pending",
      });

      const result = await service.applyForJobRole(5, 1, mockCvFile);

      expect(result).toEqual({ applicationId: 10, status: "in progress" });
      expect(blobStorageService.uploadCv).toHaveBeenCalledWith(5, 1, mockCvFile);
      expect(applicationDao.createApplication).toHaveBeenCalledWith({
        userId: 5,
        jobRoleId: 1,
        applicationStatusId: 1,
        cvBlobPath: "5/1/generated-cv.pdf",
        cvScanStatus: "pending",
      });
    });

    it("throws when the job role does not exist", async () => {
      vi.mocked(jobRoleDao.findJobRoleById).mockResolvedValue(null);

      await expect(
        service.applyForJobRole(5, 1, mockCvFile),
      ).rejects.toThrow("Job role not found");
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
        cvBlobPath: "5/1/generated-cv.pdf",
        cvScanStatus: "pending",
      });

      await expect(
        service.applyForJobRole(5, 1, mockCvFile),
      ).rejects.toThrow("You have already applied for this job role");
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
          cvBlobPath: "5/1/generated-cv.pdf",
          cvScanStatus: "pending",
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
});
