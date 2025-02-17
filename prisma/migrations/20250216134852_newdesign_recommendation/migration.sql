-- CreateTable
CREATE TABLE "UserRecommendationPlans" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "dailyPlanId" TEXT,
    "weeklyPlanId" TEXT,
    "numberOfActivities" INTEGER NOT NULL DEFAULT 0,
    "activitiesCompleted" INTEGER NOT NULL DEFAULT 0,
    "pointsGained" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "mealPlan" JSONB,
    "fitnessPlan" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserRecommendationPlans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWeeklyRecommendationPlan" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdateAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "weeklyPlanId" TEXT,
    "numberOfActivities" INTEGER NOT NULL DEFAULT 0,
    "activitiesCompleted" INTEGER NOT NULL DEFAULT 0,
    "pointsGained" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "UserWeeklyRecommendationPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserRecommendationPlans" ADD CONSTRAINT "UserRecommendationPlans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWeeklyRecommendationPlan" ADD CONSTRAINT "UserWeeklyRecommendationPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
