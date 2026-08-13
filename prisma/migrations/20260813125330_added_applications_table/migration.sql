-- CreateTable
CREATE TABLE "Applications" (
    "applicationId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jobRoleId" INTEGER NOT NULL,
    "applicationStatusId" INTEGER NOT NULL,
    "cv" TEXT NOT NULL,

    CONSTRAINT "Applications_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "ApplicationStatus" (
    "applicationStatusId" SERIAL NOT NULL,
    "applicationStatusName" TEXT NOT NULL,

    CONSTRAINT "ApplicationStatus_pkey" PRIMARY KEY ("applicationStatusId")
);

-- AddForeignKey
ALTER TABLE "Applications" ADD CONSTRAINT "Applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applications" ADD CONSTRAINT "Applications_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "job-roles"("jobRoleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applications" ADD CONSTRAINT "Applications_applicationStatusId_fkey" FOREIGN KEY ("applicationStatusId") REFERENCES "ApplicationStatus"("applicationStatusId") ON DELETE RESTRICT ON UPDATE CASCADE;
