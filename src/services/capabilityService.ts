import { type CapabilityDao, CapabilityDaoImpl } from "../dao/capabilityDao";
import type { CapabilityResponse } from "../models/CapabilityResponse";

export class CapabilityService {
  constructor(
    private readonly capabilityDao: CapabilityDao = new CapabilityDaoImpl(),
  ) {}

  async findAllCapabilities(): Promise<CapabilityResponse[]> {
    return this.capabilityDao.findAllCapabilities();
  }
}
