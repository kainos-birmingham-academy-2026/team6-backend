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
}
