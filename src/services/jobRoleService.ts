import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  type JobRoleDao,
  JobRoleDaoImpl,
  type JobRoleWithNames,
  type JobRoleWriteInput,
} from "../dao/jobRoleDao";
import type { JobRoleDetailedResponse } from "../models/JobRoleDetailedResponse";
import type { JobRolePageResponse } from "../models/JobRolePageResponse";
import { Status } from "../models/status";
import type {
  CreateJobRoleInput,
  SortableJobRoleColumn,
  UpdateJobRoleInput,
} from "../validation/jobRoleValidation";

export class JobRoleService {
  constructor(private readonly jobRoleDao: JobRoleDao = new JobRoleDaoImpl()) {}

  async findAllJobRoles(
    sortBy?: SortableJobRoleColumn,
    sortOrder?: "asc" | "desc",
  ): Promise<JobRoleResponse[]> {
    const jobRoles = await this.jobRoleDao.findAllJobRoles(sortBy, sortOrder);

    return {
      items: page.items.map((jobRole) => ({
        jobRoleId: jobRole.jobRoleId,
        roleName: jobRole.roleName,
        location: jobRole.location,
        capabilityName: jobRole.capability.capabilityName,
        bandName: jobRole.band.bandName,
        statusName: jobRole.status?.statusName ?? "unknown",
        closingDate: jobRole.closingDate,
      })),
      total: page.total,
      limit: page.limit,
      offset: page.offset,
    };
  }

  async getJobRoleDetailById(id: number): Promise<JobRoleDetailedResponse> {
    const jobRole = await this.jobRoleDao.findJobRoleById(id);

    if (!jobRole) {
      throw new Error("Job role not found");
    }

    return this.toDetailedResponse(jobRole);
  }

  async createJobRole(
    input: CreateJobRoleInput,
  ): Promise<JobRoleDetailedResponse> {
    const statusId = await this.jobRoleDao.findStatusIdByName(Status.Open);

    if (!statusId) {
      throw new Error("Open status is not configured");
    }

    try {
      const jobRole = await this.jobRoleDao.createJobRole(
        this.toWriteInput(input),
        statusId,
      );
      return this.toDetailedResponse(jobRole);
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async updateJobRole(
    id: number,
    input: UpdateJobRoleInput,
  ): Promise<JobRoleDetailedResponse> {
    try {
      const jobRole = await this.jobRoleDao.updateJobRole(
        id,
        this.toWriteInput(input),
      );

      if (!jobRole) {
        throw new Error("Job role not found");
      }

      return this.toDetailedResponse(jobRole);
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async deleteJobRole(id: number): Promise<void> {
    const deleted = await this.jobRoleDao.deleteJobRole(id);

    if (!deleted) {
      throw new Error("Job role not found");
    }
  }

  private toWriteInput(
    input: CreateJobRoleInput | UpdateJobRoleInput,
  ): JobRoleWriteInput {
    return {
      roleName: input.roleName,
      location: input.location,
      capabilityId: input.capabilityId,
      bandId: input.bandId,
      closingDate: input.closingDate,
      description: input.description,
      responsibilities: input.responsibilities,
      sharepointUrl: input.sharepointUrl,
      numberOfOpenPositions: input.numberOfOpenPositions,
    };
  }

  private toDetailedResponse(
    jobRole: JobRoleWithNames,
  ): JobRoleDetailedResponse {
    return {
      jobRoleId: jobRole.jobRoleId,
      roleName: jobRole.roleName,
      description: jobRole.description,
      responsibilities: jobRole.responsibilities,
      sharepointUrl: jobRole.sharepointUrl,
      location: jobRole.location,
      capabilityId: jobRole.capabilityId,
      capabilityName: jobRole.capability.capabilityName,
      bandId: jobRole.bandId,
      bandName: jobRole.band.bandName,
      closingDate: jobRole.closingDate,
      statusName: jobRole.status?.statusName ?? "unknown",
      numberOfOpenPositions: jobRole.numberOfOpenPositions,
    };
  }

  private mapWriteError(error: unknown): Error {
    if (error instanceof Error && error.message === "Job role not found") {
      return error;
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return new Error("Invalid capability or band");
    }

    return error instanceof Error
      ? error
      : new Error("Failed to save job role");
  }
}
