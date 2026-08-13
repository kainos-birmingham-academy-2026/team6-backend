import { type ApplicationDao, ApplicationDaoImpl } from "../dao/applicationDao";
import { JobRoleDaoImpl } from "../dao/jobRoleDao";

export type ApplyResponse = {
  applicationId: number;
  status: string;
};

export class ApplicationService {
  constructor(
    private readonly applicationDao: ApplicationDao = new ApplicationDaoImpl(),
    private readonly jobRoleDao: JobRoleDaoImpl = new JobRoleDaoImpl(),
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

    return {
      applicationId: application.applicationId,
      status: "in progress",
    };
  }
}
