import { type ApplicationDao, ApplicationDaoImpl } from "../dao/applicationDao";
import { type JobRoleDao, JobRoleDaoImpl } from "../dao/jobRoleDao";
import type {
  AdminApplicationResponse,
  JobRoleApplicationResponse,
  MyApplicationResponse,
} from "../models/ApplicationResponse";
import { ApplicationStatus } from "../models/applicationStatus";
import { BlobStorageService, type CvUploadInput } from "./blobStorageService";

export type ApplyResponse = {
  applicationId: number;
  status: string;
};

export class ApplicationService {
  constructor(
    private readonly applicationDao: ApplicationDao = new ApplicationDaoImpl(),
    private readonly jobRoleDao: JobRoleDao = new JobRoleDaoImpl(),
    private readonly blobStorageService: BlobStorageService = new BlobStorageService(),
  ) {}

  async applyForJobRole(
    userId: number,
    jobRoleId: number,
    cvFile: CvUploadInput,
  ): Promise<ApplyResponse> {
    // Verify job role exists
    const jobRole = await this.jobRoleDao.findJobRoleById(jobRoleId);

    if (!jobRole) {
      throw new Error("Job role not found");
    }

    const existingApplication =
      await this.applicationDao.findApplicationByUserAndJobRole(
        userId,
        jobRoleId,
      );

    if (existingApplication) {
      throw new Error("You have already applied for this job role");
    }

    // Get the "in progress" status ID
    const statusId = await this.applicationDao.findApplicationStatusIdByName(
      ApplicationStatus.InProgress,
    );

    if (!statusId) {
      throw new Error("Application status 'in progress' is not configured");
    }

    const cvBlobPath = await this.blobStorageService.uploadCv(
      userId,
      jobRoleId,
      cvFile,
    );

    // Create the application; the CV is scanned for malware asynchronously by
    // Defender for Storage once uploaded, so it starts out in "pending" status.
    const application = await this.applicationDao.createApplication({
      userId,
      jobRoleId,
      applicationStatusId: statusId,
      cv: cvBlobPath,
    });

    return {
      applicationId: application.applicationId,
      status: ApplicationStatus.InProgress,
    };
  }

  async getMyApplications(userId: number): Promise<MyApplicationResponse[]> {
    const applications =
      await this.applicationDao.findApplicationsByUserId(userId);

    return applications.map((application) => ({
      applicationId: application.applicationId,
      applicationStatusName:
        application.applicationStatus.applicationStatusName,
      jobRoleId: application.jobRole.jobRoleId,
      roleName: application.jobRole.roleName,
      location: application.jobRole.location,
      capabilityName: application.jobRole.capability.capabilityName,
      bandName: application.jobRole.band.bandName,
      closingDate: application.jobRole.closingDate,
    }));
  }

  async getApplicationsByJobRoleId(
    jobRoleId: number,
  ): Promise<JobRoleApplicationResponse[]> {
    const jobRole = await this.jobRoleDao.findJobRoleById(jobRoleId);

    if (!jobRole) {
      throw new Error("Job role not found");
    }

    const applications =
      await this.applicationDao.findApplicationsByJobRoleId(jobRoleId);

    return applications.map((application) => ({
      applicationId: application.applicationId,
      userId: application.userId,
      email: application.user?.email ?? "",
      applicationStatusName:
        application.applicationStatus.applicationStatusName,
      cv: application.cv,
    }));
  }

  async getAllApplications(): Promise<AdminApplicationResponse[]> {
    const applications = await this.applicationDao.findAllApplications();

    return applications.map((application) => ({
      applicationId: application.applicationId,
      userId: application.userId,
      email: application.user?.email ?? "",
      applicationStatusName:
        application.applicationStatus.applicationStatusName,
      jobRoleId: application.jobRole.jobRoleId,
      roleName: application.jobRole.roleName,
    }));
  }

  async hireApplicant(
    applicationId: number,
  ): Promise<{ applicationId: number; status: string }> {
    const application =
      await this.applicationDao.findApplicationWithJobRoleById(applicationId);

    if (!application) {
      throw new Error("Application not found");
    }

    const currentStatus =
      application.applicationStatus.applicationStatusName.toLowerCase();
    if (currentStatus !== ApplicationStatus.InProgress) {
      throw new Error("Application is not in progress");
    }

    const openPositions = application.jobRole?.numberOfOpenPositions;
    if (
      openPositions === null ||
      openPositions === undefined ||
      openPositions <= 0
    ) {
      throw new Error("No open positions available for this role");
    }

    const hiredStatusId =
      await this.applicationDao.findApplicationStatusIdByName(
        ApplicationStatus.Hired,
      );

    if (!hiredStatusId) {
      throw new Error("Application status 'hired' is not configured");
    }

    await this.applicationDao.hireApplication(
      applicationId,
      application.jobRoleId,
      hiredStatusId,
    );

    return {
      applicationId,
      status: ApplicationStatus.Hired,
    };
  }

  async rejectApplicant(
    applicationId: number,
  ): Promise<{ applicationId: number; status: string }> {
    const application =
      await this.applicationDao.findApplicationWithJobRoleById(applicationId);

    if (!application) {
      throw new Error("Application not found");
    }

    const currentStatus =
      application.applicationStatus.applicationStatusName.toLowerCase();
    if (currentStatus !== ApplicationStatus.InProgress) {
      throw new Error("Application is not in progress");
    }

    const rejectedStatusId =
      await this.applicationDao.findApplicationStatusIdByName(
        ApplicationStatus.Rejected,
      );

    if (!rejectedStatusId) {
      throw new Error("Application status 'rejected' is not configured");
    }

    await this.applicationDao.rejectApplication(
      applicationId,
      rejectedStatusId,
    );

    return {
      applicationId,
      status: ApplicationStatus.Rejected,
    };
  }
}
