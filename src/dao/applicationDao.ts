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

export type ApplicationWithJobRole = ApplicationResponse & {
  applicationStatus: { applicationStatusName: string };
  jobRole: {
    jobRoleId: number;
    roleName: string;
    location: string;
    closingDate: Date;
    capability: { capabilityName: string };
    band: { bandName: string };
  };
};

export interface ApplicationDao {
  createApplication(data: ApplicationCreateInput): Promise<ApplicationResponse>;
  findApplicationById(
    applicationId: number,
  ): Promise<ApplicationResponse | null>;
  findApplicationStatusIdByName(statusName: string): Promise<number | null>;
  findApplicationsByUserId(userId: number): Promise<ApplicationWithJobRole[]>;
  findApplicationByUserAndJobRole(
    userId: number,
    jobRoleId: number,
  ): Promise<ApplicationResponse | null>;
  updateApplicationStatus(
    applicationId: number,
    applicationStatusId: number,
  ): Promise<ApplicationResponse | null>;
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

  async findApplicationByUserAndJobRole(
    userId: number,
    jobRoleId: number,
  ): Promise<ApplicationResponse | null> {
    const application = await prisma.applications.findFirst({
      where: {
        userId,
        jobRoleId,
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

  async updateApplicationStatus(
    applicationId: number,
    applicationStatusId: number,
  ): Promise<ApplicationResponse | null> {
    try {
      return await prisma.applications.update({
        where: { applicationId },
        data: { applicationStatusId },
        select: {
          applicationId: true,
          userId: true,
          jobRoleId: true,
          applicationStatusId: true,
          cv: true,
        },
      });
    } catch {
      return null;
    }
  }

  async findApplicationsByUserId(
    userId: number,
  ): Promise<ApplicationWithJobRole[]> {
    return prisma.applications.findMany({
      where: { userId },
      orderBy: { applicationId: "desc" },
      select: {
        applicationId: true,
        userId: true,
        jobRoleId: true,
        applicationStatusId: true,
        cv: true,
        applicationStatus: {
          select: { applicationStatusName: true },
        },
        jobRole: {
          select: {
            jobRoleId: true,
            roleName: true,
            location: true,
            closingDate: true,
            capability: { select: { capabilityName: true } },
            band: { select: { bandName: true } },
          },
        },
      },
    });
  }
}
