import type { JobRole } from "../models/jobRole";
import { Status } from "../models/status";
import prisma from "../prismaClient";

export type Capability = {
  capabilityName: string;
};

export type Band = {
  bandName: string;
};

export type JobStatus = {
  statusName: string;
};

export interface JobRoleWithNames extends JobRole {
  capability: Capability;
  band: Band;
  status: JobStatus | null;
}

export type JobRoleWriteInput = {
  roleName: string;
  location: string;
  capabilityId: number;
  bandId: number;
  closingDate: Date;
  description?: string;
  responsibilities?: string;
  sharepointUrl?: string;
  numberOfOpenPositions?: number;
};

export interface JobRoleDao {
  findAllJobRoles(): Promise<JobRoleWithNames[]>;
  findJobRoleById(jobRoleId: number): Promise<JobRoleWithNames | null>;
  findStatusIdByName(statusName: string): Promise<number | null>;
  createJobRole(
    data: JobRoleWriteInput,
    statusId: number,
  ): Promise<JobRoleWithNames>;
  updateJobRole(
    jobRoleId: number,
    data: JobRoleWriteInput,
  ): Promise<JobRoleWithNames | null>;
  deleteJobRole(jobRoleId: number): Promise<boolean>;
}

const jobRoleInclude = {
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
};

export class JobRoleDaoImpl implements JobRoleDao {
  async findAllJobRoles(): Promise<JobRoleWithNames[]> {
    const jobRoles = (await prisma.jobRole.findMany({
      where: {
        status: {
          is: {
            statusName: Status.Open,
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

  async findStatusIdByName(statusName: string): Promise<number | null> {
    const status = await prisma.status.findFirst({
      where: { statusName },
      select: { statusId: true },
    });

    return status?.statusId ?? null;
  }

  async createJobRole(
    data: JobRoleWriteInput,
    statusId: number,
  ): Promise<JobRoleWithNames> {
    const jobRole = (await prisma.jobRole.create({
      data: {
        roleName: data.roleName,
        location: data.location,
        capabilityId: data.capabilityId,
        bandId: data.bandId,
        closingDate: data.closingDate,
        description: data.description,
        resposibilities: data.responsibilities,
        sharepointUrl: data.sharepointUrl,
        numberOfOpenPositions: data.numberOfOpenPositions,
        statusId,
      },
      include: jobRoleInclude,
    })) as JobRoleWithNames & { resposibilities?: string };

    return {
      ...jobRole,
      responsibilities: jobRole.responsibilities ?? jobRole.resposibilities,
    };
  }

  async updateJobRole(
    jobRoleId: number,
    data: JobRoleWriteInput,
  ): Promise<JobRoleWithNames | null> {
    const existing = await prisma.jobRole.findUnique({ where: { jobRoleId } });

    if (!existing) {
      return null;
    }

    const jobRole = (await prisma.jobRole.update({
      where: { jobRoleId },
      data: {
        roleName: data.roleName,
        location: data.location,
        capabilityId: data.capabilityId,
        bandId: data.bandId,
        closingDate: data.closingDate,
        description: data.description,
        resposibilities: data.responsibilities,
        sharepointUrl: data.sharepointUrl,
        numberOfOpenPositions: data.numberOfOpenPositions,
      },
      include: jobRoleInclude,
    })) as JobRoleWithNames & { resposibilities?: string };

    return {
      ...jobRole,
      responsibilities: jobRole.responsibilities ?? jobRole.resposibilities,
    };
  }

  async deleteJobRole(jobRoleId: number): Promise<boolean> {
    const existing = await prisma.jobRole.findUnique({ where: { jobRoleId } });

    if (!existing) {
      return false;
    }

    await prisma.jobRole.delete({ where: { jobRoleId } });
    return true;
  }
}
