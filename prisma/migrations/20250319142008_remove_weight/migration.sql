/*
  Warnings:

  - You are about to drop the column `weight` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "weight",
ADD COLUMN     "ethnicity" TEXT,
ADD COLUMN     "height" TEXT;
