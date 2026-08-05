import prisma from "../prismaClient";

export class JobRoleService {
  async findAllJobRoles() {
    return prisma.jobRole.findMany();
  }
}
