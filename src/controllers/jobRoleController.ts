import type { Request, Response } from "express";
import type { ParsedQs } from "qs";
import type { ApplicationService } from "../services/applicationService";
import type { JobRoleService } from "../services/jobRoleService";
import {
  createJobRoleSchema,
  updateJobRoleSchema,
} from "../validation/jobRoleValidation";

export class JobRoleController {
  constructor(
    private readonly jobRoleService: JobRoleService,
    private readonly applicationService: ApplicationService,
  ) {}

  async getAllJobRoles(req: Request, res: Response) {
    try {
      // Check if any filter parameters are provided
      const hasFilters =
        req.query.search ||
        req.query.capabilities ||
        req.query.bands ||
        req.query.locations;

      if (hasFilters) {
        // Parse filter parameters
        const filters = this.parseFilters(req.query);
        const jobRoles =
          await this.jobRoleService.findJobRolesWithFilters(filters);
        return res.status(200).json(jobRoles);
      }

      const jobRoles = await this.jobRoleService.findAllJobRoles();
      res.status(200).json(jobRoles);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to fetch job roles" });
    }
  }

  private parseFilters(query: ParsedQs): any {
    const filters: any = {};

    // Parse search parameter
    if (query.search && typeof query.search === "string") {
      filters.search = query.search;
    }

    // Parse capabilities parameter (can be comma-separated IDs or array)
    if (query.capabilities) {
      const capabilitiesParam = Array.isArray(query.capabilities)
        ? query.capabilities.join(",")
        : String(query.capabilities);
      const capabilities = capabilitiesParam
        .split(",")
        .map((id) => {
          const num = Number(id.trim());
          if (!Number.isInteger(num) || num <= 0) {
            throw new Error("Invalid capability ID");
          }
          return num;
        })
        .filter((id) => !Number.isNaN(id));
      if (capabilities.length > 0) {
        filters.capabilities = capabilities;
      }
    }

    // Parse bands parameter (can be comma-separated IDs or array)
    if (query.bands) {
      const bandsParam = Array.isArray(query.bands)
        ? query.bands.join(",")
        : String(query.bands);
      const bands = bandsParam
        .split(",")
        .map((id) => {
          const num = Number(id.trim());
          if (!Number.isInteger(num) || num <= 0) {
            throw new Error("Invalid band ID");
          }
          return num;
        })
        .filter((id) => !Number.isNaN(id));
      if (bands.length > 0) {
        filters.bands = bands;
      }
    }

    // Parse locations parameter (can be comma-separated values or array)
    if (query.locations) {
      const locationsParam = Array.isArray(query.locations)
        ? query.locations
        : [String(query.locations)];
      const locations = locationsParam
        .map((loc) => String(loc).trim())
        .filter((loc) => loc.length > 0);
      if (locations.length > 0) {
        filters.locations = locations;
      }
    }

    return filters;
  }

  async getJobRoleInfoById(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid job role id" });
    }

    try {
      const jobRole = await this.jobRoleService.getJobRoleDetailById(id);
      return res.status(200).json(jobRole);
    } catch (error) {
      if (error instanceof Error && error.message === "Job role not found") {
        return res.status(404).json({ error: "Job role not found" });
      }

      return res.status(500).json({ error: "Failed to fetch job role" });
    }
  }

  async createJobRole(req: Request, res: Response) {
    const result = createJobRoleSchema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(400)
        .json({ error: "Invalid job role data", details: result.error.issues });
    }

    try {
      const jobRole = await this.jobRoleService.createJobRole(result.data);
      return res.status(201).json(jobRole);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Invalid capability or band"
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to create job role" });
    }
  }

  async updateJobRole(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid job role id" });
    }

    const result = updateJobRoleSchema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(400)
        .json({ error: "Invalid job role data", details: result.error.issues });
    }

    try {
      const jobRole = await this.jobRoleService.updateJobRole(id, result.data);
      return res.status(200).json(jobRole);
    } catch (error) {
      if (error instanceof Error && error.message === "Job role not found") {
        return res.status(404).json({ error: "Job role not found" });
      }

      if (
        error instanceof Error &&
        error.message === "Invalid capability or band"
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to update job role" });
    }
  }

  async deleteJobRole(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid job role id" });
    }

    try {
      await this.jobRoleService.deleteJobRole(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Job role not found") {
        return res.status(404).json({ error: "Job role not found" });
      }

      return res.status(500).json({ error: "Failed to delete job role" });
    }
  }

  async applyForJobRole(req: Request, res: Response) {
    // Verify authentication
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Authentication token is required" });
    }

    // Get job role ID from URL params
    const jobRoleId = Number(req.params.id);

    if (!Number.isInteger(jobRoleId) || jobRoleId <= 0) {
      return res.status(400).json({ error: "Invalid job role id" });
    }

    // Check if CV file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "CV file is required" });
    }

    try {
      if (!this.applicationService) {
        return res
          .status(500)
          .json({ error: "Application service is not configured" });
      }

      const result = await this.applicationService.applyForJobRole(
        req.user.userId,
        jobRoleId,
      );

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "Job role not found") {
        return res.status(404).json({ error: "Job role not found" });
      }

      return res.status(500).json({ error: "Failed to create application" });
    }
  }
}
