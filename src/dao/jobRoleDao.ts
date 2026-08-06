import prisma from "../prismaClient";
import type { JobRole } from "../models/jobRole";

export interface JobRoleDao {
    findAllJobRoles(): Promise<JobRole[]>;
}

export class JobRoleDaoImpl implements JobRoleDao {
    async findAllJobRoles(): Promise<JobRole[]> {
        return prisma.jobRole.findMany({ where: { status: "open" } });
    }
}






