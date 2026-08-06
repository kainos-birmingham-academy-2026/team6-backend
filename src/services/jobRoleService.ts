// import { type JobRoleDao, JobRoleDaoImpl } from "../dao/jobRoleDao";
import type { JobRoleResponse } from "../models/JobRoleResponse";
// import type { JobRole } from "../models/jobRole";
import prisma from "../prismaClient";

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
