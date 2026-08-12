import { type BandDao, BandDaoImpl } from "../dao/bandDao";
import type { BandResponse } from "../models/BandResponse";

export class BandService {
  constructor(private readonly bandDao: BandDao = new BandDaoImpl()) {}

  async findAllBands(): Promise<BandResponse[]> {
    return this.bandDao.findAllBands();
  }
}
