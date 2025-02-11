/*
  Warnings:

  - You are about to drop the column `isDone` on the `UserPlans` table. All the data in the column will be lost.
  - Changed the type of `mealPlan` on the `UserPlans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fitnessPlan` on the `UserPlans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "UserPlans" DROP COLUMN "isDone",
ADD COLUMN     "isFitnessPlanDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMealPlanDone" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "mealPlan",
ADD COLUMN     "mealPlan" JSONB NOT NULL,
DROP COLUMN "fitnessPlan",
ADD COLUMN     "fitnessPlan" JSONB NOT NULL;
