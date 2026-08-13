import type { Request, Response } from "express";
import type { BandService } from "../services/bandService";

export class BandController {
  constructor(private readonly bandService: BandService) {}

  async getAllBands(_req: Request, res: Response) {
    try {
      const bands = await this.bandService.findAllBands();
      res.status(200).json(bands);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch bands" });
    }
  }
}
