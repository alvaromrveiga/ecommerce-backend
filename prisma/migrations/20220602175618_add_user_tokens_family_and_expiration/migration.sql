/*
  Warnings:

  - A unique constraint covering the columns `[family]` on the table `UserTokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiresAt` to the `UserTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family` to the `UserTokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTokens" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "family" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserTokens_family_key" ON "UserTokens"("family");
