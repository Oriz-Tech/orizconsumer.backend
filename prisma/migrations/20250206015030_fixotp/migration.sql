/*
  Warnings:

  - Changed the type of `otpType` on the `Otps` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Otps" DROP COLUMN "otpType",
ADD COLUMN     "otpType" INTEGER NOT NULL;
