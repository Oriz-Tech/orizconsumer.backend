-- AlterTable
ALTER TABLE "UserWeeklyRecommendationPlan" ADD COLUMN     "activityTitle" TEXT;

-- CreateIndex
CREATE INDEX "UserRecommendationPlans_dateCreatedFor_idx" ON "UserRecommendationPlans"("dateCreatedFor");

-- CreateIndex
CREATE INDEX "UserRecommendationPlans_weeklyPlanId_idx" ON "UserRecommendationPlans"("weeklyPlanId");

-- CreateIndex
CREATE INDEX "UserRecommendationPlans_userId_dateCreatedFor_idx" ON "UserRecommendationPlans"("userId", "dateCreatedFor");
