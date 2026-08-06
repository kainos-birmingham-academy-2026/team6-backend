import type { JobRole } from "../models/jobRole";
import { JobRoleDaoImpl, type JobRoleDao } from "../dao/jobRoleDao";

export class JobRoleService {
  constructor(private readonly jobRoleDao: JobRoleDao = new JobRoleDaoImpl()) {}

  async findAllJobRoles(): Promise<JobRole[]> {
    return this.jobRoleDao.findAllJobRoles();
  }
}

