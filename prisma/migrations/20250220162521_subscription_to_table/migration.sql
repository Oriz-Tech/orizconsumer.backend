-- AlterTable
ALTER TABLE "UserRecommendationPlans" ADD COLUMN     "dateTrialEnd" TIMESTAMP(3),
ADD COLUMN     "isTrialSubscription" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subscriptionType" INTEGER NOT NULL DEFAULT 0;
