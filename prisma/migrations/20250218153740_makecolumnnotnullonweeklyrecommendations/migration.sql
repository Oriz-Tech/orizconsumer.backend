/*
  Warnings:

  - Made the column `weeklyPlanId` on table `UserWeeklyRecommendationPlan` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserWeeklyRecommendationPlan" ADD COLUMN     "subtitle" TEXT,
ALTER COLUMN "weeklyPlanId" SET NOT NULL;
