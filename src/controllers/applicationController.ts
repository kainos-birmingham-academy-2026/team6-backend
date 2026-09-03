import type { Request, Response } from "express";
import type { ApplicationService } from "../services/applicationService";

export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  async getMyApplications(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication token is required" });
    }

    try {
      const applications = await this.applicationService.getMyApplications(
        req.user.userId,
      );
      return res.status(200).json(applications);
    } catch (_error) {
      return res.status(500).json({ error: "Failed to fetch applications" });
    }
  }
}
