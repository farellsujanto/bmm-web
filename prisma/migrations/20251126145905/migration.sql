/*
  Warnings:

  - You are about to alter the column `targetValue` on the `Mission` table. The data in that column could be lost. The data in that column will be cast from `Decimal(13,2)` to `Decimal(12,2)`.
  - You are about to alter the column `currentProgress` on the `UserMission` table. The data in that column could be lost. The data in that column will be cast from `Decimal(13,2)` to `Decimal(12,2)`.
  - You are about to alter the column `totalSpent` on the `UserStatistics` table. The data in that column could be lost. The data in that column will be cast from `Decimal(13,2)` to `Decimal(12,2)`.
  - You are about to alter the column `totalReferralEarnings` on the `UserStatistics` table. The data in that column could be lost. The data in that column will be cast from `Decimal(13,2)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "Mission" ALTER COLUMN "targetValue" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "UserMission" ALTER COLUMN "currentProgress" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "UserStatistics" ALTER COLUMN "totalSpent" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totalReferralEarnings" SET DATA TYPE DECIMAL(12,2);
