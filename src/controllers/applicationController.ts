import type { Request, Response } from "express";
import type { ApplicationService } from "../services/applicationService";
import { updateApplicationStatusSchema } from "../validation/applicationValidation";

export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  async getMyApplications(req: Request, res: Response) {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Authentication token is required" });
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

  async updateApplicationStatus(req: Request, res: Response) {
    const applicationId = Number(req.params.id);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return res.status(400).json({ error: "Invalid application id" });
    }

    const result = updateApplicationStatusSchema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(400)
        .json({ error: "Invalid status", details: result.error.issues });
    }

    try {
      const application = await this.applicationService.updateApplicationStatus(
        applicationId,
        result.data.status,
      );
      return res.status(200).json(application);
    } catch (error) {
      if (error instanceof Error && error.message === "Application not found") {
        return res.status(404).json({ error: "Application not found" });
      }

      return res
        .status(500)
        .json({ error: "Failed to update application status" });
    }
  }
}
