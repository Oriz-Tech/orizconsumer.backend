-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "datecreatedutc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateupdatedutc" TIMESTAMP(3) NOT NULL,
    "lastaction" TEXT,
    "phonenumber" TEXT NOT NULL,
    "isverified" BOOLEAN DEFAULT false,
    "isemailverified" BOOLEAN DEFAULT false,
    "isPhonenumberVerified" BOOLEAN DEFAULT false,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "inviteid" TEXT,
    "referalnumbers" INTEGER,
    "language" TEXT,
    "timeZone" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlans" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "day" VARCHAR(10) NOT NULL,
    "mealPlan" VARCHAR(1000) NOT NULL,
    "fitnessPlan" VARCHAR(500) NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "planCorrelationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserPlans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscriptions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "subscriptionType" INTEGER NOT NULL,
    "lastAction" TEXT,
    "nextBillingDate" TIMESTAMP(3) NOT NULL,
    "paymentStage" TEXT,
    "paymentReference" TEXT,

    CONSTRAINT "UserSubscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlanSettings" (
    "id" SERIAL NOT NULL,
    "typeOfWork" TEXT,
    "occupation" TEXT,
    "dailyRoutine" TEXT,
    "weightGoal" TEXT,
    "hasMedicationCondition" BOOLEAN NOT NULL DEFAULT false,
    "medicalCondition" TEXT,
    "hasDietaryRestriction" BOOLEAN NOT NULL DEFAULT false,
    "dietaryRestriction" TEXT,
    "weight" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "enjoyedActivity" TEXT,
    "daysPerWeek" INTEGER NOT NULL,
    "hoursPerDay" INTEGER NOT NULL,
    "sleepingHours" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "planCorrelationId" TEXT NOT NULL,
    "neededCalPerday" INTEGER,

    CONSTRAINT "UserPlanSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSubscriptions" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AppSubscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLogs" (
    "id" SERIAL NOT NULL,
    "payload" TEXT,
    "event" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otps" (
    "id" SERIAL NOT NULL,
    "otp" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "dateCreatedUtc" TEXT NOT NULL,
    "otpHeader" TEXT NOT NULL,
    "dateToExpireUtc" TEXT NOT NULL,
    "otpType" TEXT NOT NULL,

    CONSTRAINT "Otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" SERIAL NOT NULL,
    "userEmail" TEXT,
    "loginAction" TEXT,
    "dateCreatedUtc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "UserPlans" ADD CONSTRAINT "UserPlans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlanSettings" ADD CONSTRAINT "UserPlanSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
