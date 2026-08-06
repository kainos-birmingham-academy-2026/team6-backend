
import type { JobRoleResponse } from "../models/JobRoleResponse";
import { JobRoleDaoImpl, type JobRoleDao } from "../dao/jobRoleDao";

export class JobRoleService {
  constructor(private readonly jobRoleDao: JobRoleDao = new JobRoleDaoImpl()) {}

  async findAllJobRoles(): Promise<JobRoleResponse[]> {
    const jobRoles = await this.jobRoleDao.findAllJobRoles();

    return jobRoles.map((jobRole) => ({
      roleName: jobRole.roleName,
      location: jobRole.location,
      capabilityName: jobRole.capability.capabilityName,
      bandName: jobRole.band.bandName,
      closingDate: jobRole.closingDate,
    }));
  }
}
