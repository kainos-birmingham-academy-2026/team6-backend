import type { Request, Response } from "express";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
  constructor(private readonly jobRoleService: JobRoleService) {}

  async getAllJobRoles(_req: Request, res: Response) {
    try {
      const jobRoles = await this.jobRoleService.findAllJobRoles();
      res.status(200).json(jobRoles);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch job roles" });
    }
  }


  async getJobRoleInfoById(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid job role id" });
      return;
    }

    try {
      const jobRole = await this.jobRoleService.getJobRoleDetailById(id);
      res.status(200).json(jobRole);
    } catch (error) {
      if (error instanceof Error && error.message === "Job role not found") {
        res.status(404).json({ error: "Job role not found" });
        return;
      }

      res.status(500).json({ error: "Failed to fetch job role" });
    }
  }
}
