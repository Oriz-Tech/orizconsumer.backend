/*
  Warnings:

  - Added the required column `dateCreatedFor` to the `UserRecommendationPlans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserRecommendationPlans" ADD COLUMN     "dateCreatedFor" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "hasActivePlan" BOOLEAN;
