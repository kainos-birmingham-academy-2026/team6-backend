import type { JobRole } from "../models/jobRole";
import prisma from "../prismaClient";

export interface JobRoleWithRelations extends JobRole {
  capability: {
    capabilityName: string;
  };
  band: {
    bandName: string;
  };
}

export interface JobRoleDao {
  findAllJobRoles(): Promise<JobRoleWithRelations[]>;
}

export class JobRoleDaoImpl implements JobRoleDao {
  async findAllJobRoles(): Promise<JobRoleWithRelations[]> {
    return prisma.jobRole.findMany({
      where: { status: "open" },
      include: {
        capability: {
          select: {
            capabilityName: true,
          },
        },
        band: {
          select: {
            bandName: true,
          },
        },
      },
    }) as Promise<JobRoleWithRelations[]>;
  }
}
