/*
  Warnings:

  - Added the required column `cv` to the `Applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Applications" ADD COLUMN     "cv" TEXT NOT NULL;
