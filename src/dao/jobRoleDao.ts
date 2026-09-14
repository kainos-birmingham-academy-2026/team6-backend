import type { JobRole } from "../models/jobRole";
import { Status } from "../models/status";
import prisma from "../prismaClient";
import type { SortableJobRoleColumn } from "../validation/jobRoleValidation";

type SortOrder = "asc" | "desc";

// Relation columns need a nested Prisma orderBy; direct columns map straight through.
function buildOrderBy(sortBy?: SortableJobRoleColumn, sortOrder?: SortOrder) {
  if (!sortBy) {
    return undefined;
  }
  const order = sortOrder ?? "asc";

  switch (sortBy) {
    case "capabilityName":
      return { capability: { capabilityName: order } };
    case "bandName":
      return { band: { bandName: order } };
    case "statusName":
      return { status: { statusName: order } };
    default:
      return { [sortBy]: order };
  }
}

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

export type JobRolePage = {
  items: JobRoleWithNames[];
  total: number;
  limit: number;
  offset: number;
};

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

export type JobRoleFilters = {
  search?: string;
  capabilities?: number[];
  bands?: number[];
  locations?: string[];
};

export interface JobRoleDao {
  findAllJobRoles(
    limit: number,
    offset: number,
    sortBy?: SortableJobRoleColumn,
    sortOrder?: SortOrder,
  ): Promise<JobRolePage>;
  findJobRolesWithFilters(filters: JobRoleFilters): Promise<JobRoleWithNames[]>;
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
  async findAllJobRoles(
    limit: number,
    offset: number,
    sortBy?: SortableJobRoleColumn,
    sortOrder?: SortOrder,
  ): Promise<JobRolePage> {
    const where = {
      status: {
        is: {
          statusName: Status.Open,
        },
      },
    };

    const [jobRoles, total] = await Promise.all([
      prisma.jobRole.findMany({
        where,
        orderBy: buildOrderBy(sortBy, sortOrder),
        skip: offset,
        take: limit,
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
      }),
      prisma.jobRole.count({ where }),
    ]);

    const items = (
      jobRoles as Array<JobRoleWithNames & { resposibilities?: string }>
    ).map((jobRole) => ({
      ...jobRole,
      responsibilities: jobRole.responsibilities ?? jobRole.resposibilities,
    }));

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async findJobRolesWithFilters(
    filters: JobRoleFilters,
  ): Promise<JobRoleWithNames[]> {
    const whereConditions: Record<string, unknown> = {
      status: {
        is: {
          statusName: Status.Open,
        },
      },
    };

    // Text search - search in role name and location
    if (filters.search) {
      whereConditions.OR = [
        {
          roleName: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          location: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Filter by capabilities
    if (filters.capabilities && filters.capabilities.length > 0) {
      whereConditions.capabilityId = {
        in: filters.capabilities,
      };
    }

    // Filter by bands
    if (filters.bands && filters.bands.length > 0) {
      whereConditions.bandId = {
        in: filters.bands,
      };
    }

    // Filter by locations
    if (filters.locations && filters.locations.length > 0) {
      whereConditions.location = {
        in: filters.locations,
      };
    }

    const jobRoles = (await prisma.jobRole.findMany({
      where: whereConditions,
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
