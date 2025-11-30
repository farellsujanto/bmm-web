-- AlterTable
ALTER TABLE "PhoneOtp" ADD COLUMN     "blockedUntil" TIMESTAMP(3),
ADD COLUMN     "resendCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wrongAttempts" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "PhoneOtp_blockedUntil_idx" ON "PhoneOtp"("blockedUntil");
