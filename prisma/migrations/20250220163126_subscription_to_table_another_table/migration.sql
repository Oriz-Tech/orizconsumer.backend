/*
  Warnings:

  - You are about to drop the column `dateTrialEnd` on the `UserRecommendationPlans` table. All the data in the column will be lost.
  - You are about to drop the column `isTrialSubscription` on the `UserRecommendationPlans` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionType` on the `UserRecommendationPlans` table. All the data in the column will be lost.
  - You are about to drop the column `hasActivePlan` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserRecommendationPlans" DROP COLUMN "dateTrialEnd",
DROP COLUMN "isTrialSubscription",
DROP COLUMN "subscriptionType";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "hasActivePlan",
ADD COLUMN     "dateTrialEnd" TIMESTAMP(3),
ADD COLUMN     "isTrialSubscription" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subscriptionType" INTEGER NOT NULL DEFAULT 0;
