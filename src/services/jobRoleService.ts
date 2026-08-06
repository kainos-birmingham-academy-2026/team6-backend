import { type JobRoleDao, JobRoleDaoImpl } from "../dao/jobRoleDao";
import type { JobRole } from "../models/jobRole";

export class JobRoleService {
  constructor(private readonly jobRoleDao: JobRoleDao = new JobRoleDaoImpl()) {}

  async findAllJobRoles(): Promise<JobRole[]> {
    return this.jobRoleDao.findAllJobRoles();
  }
}
