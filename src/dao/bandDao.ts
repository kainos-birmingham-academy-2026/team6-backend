import prisma from "../prismaClient";

export interface BandDao {
  findAllBands(): Promise<Array<{ bandId: number; bandName: string }>>;
}

export class BandDaoImpl implements BandDao {
  async findAllBands(): Promise<Array<{ bandId: number; bandName: string }>> {
    return prisma.band.findMany({
      select: {
        bandId: true,
        bandName: true,
      },
    });
  }
}
