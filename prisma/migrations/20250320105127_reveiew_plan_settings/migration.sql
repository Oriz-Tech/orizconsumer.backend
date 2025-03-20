/*
  Warnings:

  - You are about to drop the column `createdAt` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `dailyRoutine` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `daysPerWeek` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryRestriction` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `enjoyedActivity` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `hasDietaryRestriction` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `hasMedicationCondition` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `hoursPerDay` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `medicalCondition` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `neededCalPerday` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `occupation` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `planCorrelationId` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `sleepingHours` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `typeOfWork` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `UserPlanSettings` table. All the data in the column will be lost.
  - You are about to drop the column `weightGoal` on the `UserPlanSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPlanSettings" DROP COLUMN "createdAt",
DROP COLUMN "dailyRoutine",
DROP COLUMN "daysPerWeek",
DROP COLUMN "dietaryRestriction",
DROP COLUMN "enjoyedActivity",
DROP COLUMN "hasDietaryRestriction",
DROP COLUMN "hasMedicationCondition",
DROP COLUMN "height",
DROP COLUMN "hoursPerDay",
DROP COLUMN "isActive",
DROP COLUMN "medicalCondition",
DROP COLUMN "neededCalPerday",
DROP COLUMN "occupation",
DROP COLUMN "planCorrelationId",
DROP COLUMN "sleepingHours",
DROP COLUMN "typeOfWork",
DROP COLUMN "updatedAt",
DROP COLUMN "weight",
DROP COLUMN "weightGoal",
ADD COLUMN     "fitnessPlanSetting" JSONB,
ADD COLUMN     "mealPlanSetting" JSONB,
ADD COLUMN     "wellnessPlanSetting" JSONB;
