import prisma from "../prismaClient";
import type { JobRoleResponse } from "../models/JobRoleResponse";
import { type JobRoleDao, JobRoleDaoImpl } from "../dao/jobRoleDao";
import type { JobRole } from "../models/jobRole";

export class JobRoleService {
  async findAllJobRoles(): Promise<JobRoleResponse[]> {
    const jobRoles = await prisma.jobRole.findMany({
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
    });

    return jobRoles.map((jobRole) => ({
      roleName: jobRole.roleName,
      location: jobRole.location,
      capabilityName: jobRole.capability.capabilityName,
      bandName: jobRole.band.bandName,
      closingDate: jobRole.closingDate,
    }));
  }
}
