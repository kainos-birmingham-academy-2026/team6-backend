import prisma from "../prismaClient";

export type ApplicationCreateInput = {
  userId: number;
  jobRoleId: number;
  applicationStatusId: number;
  cv: string;
};

export type ApplicationResponse = {
  applicationId: number;
  userId: number;
  jobRoleId: number;
  applicationStatusId: number;
  cv: string;
};

export interface ApplicationDao {
  createApplication(data: ApplicationCreateInput): Promise<ApplicationResponse>;
  findApplicationById(
    applicationId: number,
  ): Promise<ApplicationResponse | null>;
  findApplicationStatusIdByName(statusName: string): Promise<number | null>;
}

export class ApplicationDaoImpl implements ApplicationDao {
  async createApplication(
    data: ApplicationCreateInput,
  ): Promise<ApplicationResponse> {
    const application = await prisma.applications.create({
      data: {
        userId: data.userId,
        jobRoleId: data.jobRoleId,
        applicationStatusId: data.applicationStatusId,
        cv: data.cv,
      },
      select: {
        applicationId: true,
        userId: true,
        jobRoleId: true,
        applicationStatusId: true,
        cv: true,
      },
    });

    return application;
  }

  async findApplicationById(
    applicationId: number,
  ): Promise<ApplicationResponse | null> {
    const application = await prisma.applications.findUnique({
      where: {
        applicationId,
      },
      select: {
        applicationId: true,
        userId: true,
        jobRoleId: true,
        applicationStatusId: true,
        cv: true,
      },
    });

    return application;
  }

  async findApplicationStatusIdByName(
    statusName: string,
  ): Promise<number | null> {
    const status = await prisma.applicationStatus.findFirst({
      where: {
        applicationStatusName: statusName,
      },
      select: {
        applicationStatusId: true,
      },
    });

    return status?.applicationStatusId ?? null;
  }
}
