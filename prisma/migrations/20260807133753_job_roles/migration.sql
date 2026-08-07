/*
  Warnings:

  - You are about to drop the column `status` on the `job-roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "job-roles" DROP COLUMN "status",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "numberOfOpenPositions" INTEGER,
ADD COLUMN     "resposibilities" TEXT,
ADD COLUMN     "sharepointUrl" TEXT,
ADD COLUMN     "statusId" INTEGER;

-- CreateTable
CREATE TABLE "Status" (
    "statusId" SERIAL NOT NULL,
    "statusName" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("statusId")
);

-- AddForeignKey
ALTER TABLE "job-roles" ADD CONSTRAINT "job-roles_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("statusId") ON DELETE SET NULL ON UPDATE CASCADE;
