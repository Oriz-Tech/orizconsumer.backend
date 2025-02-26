/*
  Warnings:

  - The `paystackCustomerId` column on the `UserSubscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paystackPlanId` column on the `UserSubscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserSubscriptions" DROP COLUMN "paystackCustomerId",
ADD COLUMN     "paystackCustomerId" INTEGER,
DROP COLUMN "paystackPlanId",
ADD COLUMN     "paystackPlanId" INTEGER;
