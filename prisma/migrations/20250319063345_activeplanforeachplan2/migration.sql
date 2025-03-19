/*
  Warnings:

  - You are about to drop the column `hasActivFitnessPlan` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "hasActivFitnessPlan",
ADD COLUMN     "hasActiveFitnessPlan" BOOLEAN NOT NULL DEFAULT false;
