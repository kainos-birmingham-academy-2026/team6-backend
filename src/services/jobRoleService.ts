import { type JobRoleDao, JobRoleDaoImpl } from "../dao/jobRoleDao";
import type { JobRoleDetailedResponse } from "../models/JobRoleDetailedResponse";
import type { JobRoleResponse } from "../models/JobRoleResponse";

export class JobRoleService {
  constructor(private readonly jobRoleDao: JobRoleDao = new JobRoleDaoImpl()) {}

  async findAllJobRoles(): Promise<JobRoleResponse[]> {
    const jobRoles = await this.jobRoleDao.findAllJobRoles();

    return jobRoles.map((jobRole) => ({
      roleName: jobRole.roleName,
      location: jobRole.location,
      capabilityName: jobRole.capability.capabilityName,
      bandName: jobRole.band.bandName,
      statusName: jobRole.status?.statusName ?? "unknown",
      closingDate: jobRole.closingDate,
    }));
  }

  async getJobRoleDetailById(id: number): Promise<JobRoleDetailedResponse> {
    const jobRole = await this.jobRoleDao.findJobRoleById(id);

    if (!jobRole) {
      throw new Error("Job role not found");
    }

    return {
      jobRoleId: jobRole.jobRoleId,
      roleName: jobRole.roleName,
      description: jobRole.description,
      responsibilities: jobRole.responsibilities,
      sharepointUrl: jobRole.sharepointUrl,
      location: jobRole.location,
      capabilityName: jobRole.capability.capabilityName,
      bandName: jobRole.band.bandName,
      closingDate: jobRole.closingDate,
      statusName: jobRole.status?.statusName ?? "unknown",
      numberOfOpenPositions: jobRole.numberOfOpenPositions,
    };
  }
}
