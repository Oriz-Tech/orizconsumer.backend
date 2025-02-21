/*
  Warnings:

  - Added the required column `payload` to the `WebhookLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "lastSubscriptionDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WebhookLogs" DROP COLUMN "payload",
ADD COLUMN     "payload" JSONB NOT NULL;
