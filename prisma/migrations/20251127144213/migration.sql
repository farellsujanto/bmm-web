/*
  Warnings:

  - The primary key for the `UserMission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserMission` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserMission_achieved_idx";

-- DropIndex
DROP INDEX "UserMission_missionId_idx";

-- DropIndex
DROP INDEX "UserMission_userId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referrerId" INTEGER;

-- AlterTable
ALTER TABLE "UserMission" DROP CONSTRAINT "UserMission_pkey",
DROP COLUMN "id",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "User_referrerId_idx" ON "User"("referrerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
