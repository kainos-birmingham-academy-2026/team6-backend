import type { JobRole } from "../models/jobRole";
import prisma from "../prismaClient";

export interface JobRoleWithNames extends JobRole {
  capability: {
    capabilityName: string;
  };
  band: {
    bandName: string;
  };
  status: {
    statusName: string;
  } | null;
}

export interface JobRoleDao {
  findAllJobRoles(): Promise<JobRoleWithNames[]>;
  findJobRoleById(jobRoleId: number): Promise<JobRoleWithNames | null>;
}

export class JobRoleDaoImpl implements JobRoleDao {
  async findAllJobRoles(): Promise<JobRoleWithNames[]> {
    const jobRoles = (await prisma.jobRole.findMany({
      where: {
        status: {
          is: {
            statusName: "open",
          },
        },
      },
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
        status: {
          select: {
            statusName: true,
          },
        },
      },
    })) as Array<JobRoleWithNames & { resposibilities?: string }>;

    return jobRoles.map((jobRole) => ({
      ...jobRole,
      responsibilities: jobRole.responsibilities ?? jobRole.resposibilities,
    }));
  }

  async findJobRoleById(jobRoleId: number): Promise<JobRoleWithNames | null> {
    const jobRole = (await prisma.jobRole.findUnique({
      where: {
        jobRoleId,
      },
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
        status: {
          select: {
            statusName: true,
          },
        },
      },
    })) as (JobRoleWithNames & { resposibilities?: string }) | null;

    if (!jobRole) {
      return null;
    }

    return {
      ...jobRole,
      responsibilities: jobRole.responsibilities ?? jobRole.resposibilities,
    };
  }
}
