import type { Request, Response } from "express";
import { CapabilityService } from "../services/capabilityService";
import { JobRoleMatcherService } from "../services/jobRoleMatcherService";
import type { JobRoleService } from "../services/jobRoleService";
import { matcherSubmitSchema } from "../validation/jobRoleMatcherValidation";

export class JobRoleMatcherController {
  constructor(
    private readonly jobRoleService: JobRoleService,
    private readonly matcherService: JobRoleMatcherService = new JobRoleMatcherService(),
    private readonly capabilityService: CapabilityService = new CapabilityService(),
  ) {}

  getQuestions(_req: Request, res: Response) {
    return res.status(200).json(this.matcherService.getQuestions());
  }

  async submitAnswers(req: Request, res: Response) {
    const parsed = matcherSubmitSchema.safeParse(req.body ?? {});

    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid quiz submission" });
    }

    let recommendations: ReturnType<
      typeof this.matcherService.getTopCapabilities
    >;

    try {
      recommendations = this.matcherService.getTopCapabilities(
        parsed.data.answers,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid quiz submission";
      return res.status(400).json({ error: message });
    }

    const capabilities = await this.capabilityService.findAllCapabilities();
    const matchingCapabilityIds = recommendations
      .map(
        (rec) =>
          capabilities.find((c) => c.capabilityName === rec.capabilityName)
            ?.capabilityId,
      )
      .filter((id): id is number => id !== undefined);

    const matchingRoles = matchingCapabilityIds.length
      ? await this.jobRoleService.findJobRolesWithFilters({
          capabilities: matchingCapabilityIds,
        })
      : [];

    return res.status(200).json({ recommendations, matchingRoles });
  }
}
