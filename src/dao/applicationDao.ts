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

export type ApplicationWithUserAndStatus = ApplicationResponse & {
  user: {
    userId: number;
    email: string;
    userRole: string;
  };
  applicationStatus: {
    applicationStatusId: number;
    applicationStatusName: string;
  };
};

export type ApplicationWithRoleDetails = ApplicationResponse & {
  applicationStatus: {
    applicationStatusId: number;
    applicationStatusName: string;
  };
  jobRole: {
    jobRoleId: number;
    numberOfOpenPositions: number | null;
    statusId: number | null;
  };
};

export interface ApplicationDao {
  createApplication(data: ApplicationCreateInput): Promise<ApplicationResponse>;
  findApplicationById(
    applicationId: number,
  ): Promise<ApplicationResponse | null>;
  findApplicationStatusIdByName(statusName: string): Promise<number | null>;
  findApplicationsByUserId(userId: number): Promise<ApplicationWithJobRole[]>;
  findApplicationsByJobRoleId(
    jobRoleId: number,
  ): Promise<ApplicationWithUserAndStatus[]>;
  findApplicationWithJobRoleById(
    applicationId: number,
  ): Promise<ApplicationWithRoleDetails | null>;
  hireApplication(
    applicationId: number,
    jobRoleId: number,
    hiredStatusId: number,
  ): Promise<ApplicationResponse>;
  rejectApplication(
    applicationId: number,
    rejectedStatusId: number,
  ): Promise<ApplicationResponse>;
  findApplicationByUserAndJobRole(
    userId: number,
    jobRoleId: number,
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
    let status = await prisma.applicationStatus.findFirst({
      where: {
        applicationStatusName: {
          equals: statusName,
          mode: "insensitive",
        },
      },
      select: {
        applicationStatusId: true,
      },
    });

    if (!status) {
      try {
        status = await prisma.applicationStatus.create({
          data: {
            applicationStatusName: statusName.toLowerCase(),
          },
          select: {
            applicationStatusId: true,
          },
        });
      } catch (_e) {
        // In case of race condition or error, re-query
        status = await prisma.applicationStatus.findFirst({
          where: {
            applicationStatusName: {
              equals: statusName,
              mode: "insensitive",
            },
          },
          select: {
            applicationStatusId: true,
          },
        });
      }
    }

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

  async findApplicationsByJobRoleId(
    jobRoleId: number,
  ): Promise<ApplicationWithUserAndStatus[]> {
    return prisma.applications.findMany({
      where: { jobRoleId },
      orderBy: { applicationId: "asc" },
      select: {
        applicationId: true,
        userId: true,
        jobRoleId: true,
        applicationStatusId: true,
        cv: true,
        user: {
          select: {
            userId: true,
            email: true,
            userRole: true,
          },
        },
        applicationStatus: {
          select: {
            applicationStatusId: true,
            applicationStatusName: true,
          },
        },
      },
    });
  }

  async findApplicationWithJobRoleById(
    applicationId: number,
  ): Promise<ApplicationWithRoleDetails | null> {
    return prisma.applications.findUnique({
      where: { applicationId },
      select: {
        applicationId: true,
        userId: true,
        jobRoleId: true,
        applicationStatusId: true,
        cv: true,
        applicationStatus: {
          select: {
            applicationStatusId: true,
            applicationStatusName: true,
          },
        },
        jobRole: {
          select: {
            jobRoleId: true,
            numberOfOpenPositions: true,
            statusId: true,
          },
        },
      },
    });
  }

  async hireApplication(
    applicationId: number,
    jobRoleId: number,
    hiredStatusId: number,
  ): Promise<ApplicationResponse> {
    const [updatedApplication] = await prisma.$transaction([
      prisma.applications.update({
        where: { applicationId },
        data: { applicationStatusId: hiredStatusId },
        select: {
          applicationId: true,
          userId: true,
          jobRoleId: true,
          applicationStatusId: true,
          cv: true,
        },
      }),
      prisma.jobRole.update({
        where: { jobRoleId },
        data: {
          numberOfOpenPositions: {
            decrement: 1,
          },
        },
      }),
    ]);

    return updatedApplication;
  }

  async rejectApplication(
    applicationId: number,
    rejectedStatusId: number,
  ): Promise<ApplicationResponse> {
    return prisma.applications.update({
      where: { applicationId },
      data: { applicationStatusId: rejectedStatusId },
      select: {
        applicationId: true,
        userId: true,
        jobRoleId: true,
        applicationStatusId: true,
        cv: true,
      },
    });
  }
}
