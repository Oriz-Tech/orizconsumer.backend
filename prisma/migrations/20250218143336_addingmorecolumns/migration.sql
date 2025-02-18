-- AlterTable
ALTER TABLE "UserRecommendationPlans" ADD COLUMN     "activitySubtitle" TEXT,
ADD COLUMN     "fitnessActivitiesCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fitnessNumberOfActivities" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fitnessPointsGained" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fitnessTotalPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mealActivitiesCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mealNumberOfActivities" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mealPointsGained" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mealTotalPoints" INTEGER NOT NULL DEFAULT 0;
