import prisma from "../prismaClient";

export interface CapabilityDao {
  findAllCapabilities(): Promise<
    Array<{ capabilityId: number; capabilityName: string }>
  >;
}

export class CapabilityDaoImpl implements CapabilityDao {
  async findAllCapabilities(): Promise<
    Array<{ capabilityId: number; capabilityName: string }>
  > {
    return prisma.capability.findMany({
      select: {
        capabilityId: true,
        capabilityName: true,
      },
    });
  }
}
