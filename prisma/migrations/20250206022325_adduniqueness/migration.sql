/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Otps` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phonenumber]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Otps_identifier_key" ON "Otps"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phonenumber_key" ON "Users"("phonenumber");
