/*
  Warnings:

  - You are about to drop the column `hasActivePlan` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "hasActivePlan",
ADD COLUMN     "hasActivFitnessPlan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasActiveMealPlan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasActiveWellnessPlan" BOOLEAN NOT NULL DEFAULT false;
