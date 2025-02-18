/*
  Warnings:

  - A unique constraint covering the columns `[userId,weeklyPlanId,activityTitle]` on the table `UserWeeklyRecommendationPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserWeeklyRecommendationPlan_userId_weeklyPlanId_activityTi_key" ON "UserWeeklyRecommendationPlan"("userId", "weeklyPlanId", "activityTitle");
