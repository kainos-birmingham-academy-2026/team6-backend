import type { Request, Response } from "express";
import type { CapabilityService } from "../services/capabilityService";

export class CapabilityController {
  constructor(private readonly capabilityService: CapabilityService) {}

  async getAllCapabilities(_req: Request, res: Response) {
    try {
      const capabilities = await this.capabilityService.findAllCapabilities();
      res.status(200).json(capabilities);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch capabilities" });
    }
  }
}
