-- AlterTable
ALTER TABLE "UserRecommendationPlans" ADD COLUMN     "wellnessActivitiesCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wellnessNumberOfActivities" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wellnessPlan" JSONB,
ADD COLUMN     "wellnessPointsGained" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wellnessTotalPoints" INTEGER NOT NULL DEFAULT 0;
