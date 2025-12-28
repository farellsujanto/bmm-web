-- CreateEnum
CREATE TYPE "ProductRequestStatus" AS ENUM ('PENDING', 'REVIEWING', 'QUOTED', 'REJECTED');

-- CreateTable
CREATE TABLE "ProductRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "ProductRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "quotedPrice" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRequestItem" (
    "id" SERIAL NOT NULL,
    "productRequestId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductRequest_userId_idx" ON "ProductRequest"("userId");

-- CreateIndex
CREATE INDEX "ProductRequest_status_idx" ON "ProductRequest"("status");

-- CreateIndex
CREATE INDEX "ProductRequest_createdAt_idx" ON "ProductRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ProductRequestItem_productRequestId_idx" ON "ProductRequestItem"("productRequestId");

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequestItem" ADD CONSTRAINT "ProductRequestItem_productRequestId_fkey" FOREIGN KEY ("productRequestId") REFERENCES "ProductRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
