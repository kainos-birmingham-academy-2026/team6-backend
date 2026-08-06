import type { JobRole } from "../models/jobRole";
import prisma from "../prismaClient";

export interface JobRoleDao {
  findAllJobRoles(): Promise<JobRole[]>;
}

export class JobRoleDaoImpl implements JobRoleDao {
  async findAllJobRoles(): Promise<JobRole[]> {
    return prisma.jobRole.findMany({ where: { status: "open" } });
  }
}
