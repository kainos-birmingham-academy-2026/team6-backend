import type { Request, Response } from "express";
import type { ApplicationService } from "../services/applicationService";

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

  async getApplicationsByJobRoleId(req: Request, res: Response) {
    const rawId = req.params.jobRoleId || req.params.id;
    const jobRoleId = Number(rawId);

    if (!Number.isInteger(jobRoleId) || jobRoleId <= 0) {
      return res.status(400).json({ error: "Invalid job role id" });
    }

    try {
      const applications =
        await this.applicationService.getApplicationsByJobRoleId(jobRoleId);
      return res.status(200).json(applications);
    } catch (error) {
      if (error instanceof Error && error.message === "Job role not found") {
        return res.status(404).json({ error: "Job role not found" });
      }

      return res.status(500).json({ error: "Failed to fetch applications" });
    }
  }

  async hireApplicant(req: Request, res: Response) {
    const rawId = req.params.applicationId || req.params.id;
    const applicationId = Number(rawId);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return res.status(400).json({ error: "Invalid application id" });
    }

    try {
      const result = await this.applicationService.hireApplicant(applicationId);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === "Application not found" ||
          error.message === "Job role not found"
        ) {
          return res.status(404).json({ error: error.message });
        }
        if (
          error.message === "Application is not in progress" ||
          error.message === "No open positions available for this role"
        ) {
          return res.status(400).json({ error: error.message });
        }
      }

      return res.status(500).json({ error: "Failed to hire applicant" });
    }
  }

  async rejectApplicant(req: Request, res: Response) {
    const rawId = req.params.applicationId || req.params.id;
    const applicationId = Number(rawId);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return res.status(400).json({ error: "Invalid application id" });
    }

    try {
      const result =
        await this.applicationService.rejectApplicant(applicationId);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Application not found") {
          return res.status(404).json({ error: error.message });
        }
        if (error.message === "Application is not in progress") {
          return res.status(400).json({ error: error.message });
        }
      }

      return res.status(500).json({ error: "Failed to reject applicant" });
    }
  }
}
