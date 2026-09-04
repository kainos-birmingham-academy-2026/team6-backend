import { type ApplicationDao, ApplicationDaoImpl } from "../dao/applicationDao";
import { JobRoleDaoImpl } from "../dao/jobRoleDao";
import type { MyApplicationResponse } from "../models/ApplicationResponse";
import { type AnalyticsService, analyticsService } from "./analyticsService";

export type ApplyResponse = {
  applicationId: number;
  status: string;
};

// Maps DB application statuses to the GA4 event fired when an admin sets that status.
const STATUS_EVENT_NAMES: Record<string, string> = {
  rejected: "job_application_rejected",
  accepted: "job_application_hired",
};

export class ApplicationService {
  constructor(
    private readonly applicationDao: ApplicationDao = new ApplicationDaoImpl(),
    private readonly jobRoleDao: JobRoleDaoImpl = new JobRoleDaoImpl(),
    private readonly analytics: AnalyticsService = analyticsService,
  ) {}

  async applyForJobRole(
    userId: number,
    jobRoleId: number,
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
    const statusId =
      await this.applicationDao.findApplicationStatusIdByName("in progress");

    if (!statusId) {
      throw new Error("Application status 'in progress' is not configured");
    }

    // Create the application
    const application = await this.applicationDao.createApplication({
      userId,
      jobRoleId,
      applicationStatusId: statusId,
      cv: "CV submitted",
    });

    await this.analytics.trackEvent(`user-${userId}`, {
      name: "job_application_created",
      params: { applicationId: application.applicationId, jobRoleId },
    });

    return {
      applicationId: application.applicationId,
      status: "in progress",
    };
  }

  async updateApplicationStatus(
    applicationId: number,
    statusName: "rejected" | "accepted",
  ): Promise<ApplyResponse> {
    const existingApplication =
      await this.applicationDao.findApplicationById(applicationId);

    if (!existingApplication) {
      throw new Error("Application not found");
    }

    const statusId =
      await this.applicationDao.findApplicationStatusIdByName(statusName);

    if (!statusId) {
      throw new Error(`Application status '${statusName}' is not configured`);
    }

    const application = await this.applicationDao.updateApplicationStatus(
      applicationId,
      statusId,
    );

    if (!application) {
      throw new Error("Application not found");
    }

    const eventName = STATUS_EVENT_NAMES[statusName];
    if (eventName) {
      await this.analytics.trackEvent(`user-${existingApplication.userId}`, {
        name: eventName,
        params: { applicationId },
      });
    }

    return {
      applicationId: application.applicationId,
      status: statusName,
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
}
