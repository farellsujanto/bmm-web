/*
  Warnings:

  - A unique constraint covering the columns `[companyOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "companyOrderId" INTEGER;

-- CreateTable
CREATE TABLE "CompanyOrder" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "address" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CompanyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyOrder_orderId_key" ON "CompanyOrder"("orderId");

-- CreateIndex
CREATE INDEX "CompanyOrder_orderId_idx" ON "CompanyOrder"("orderId");

-- CreateIndex
CREATE INDEX "CompanyOrder_taxId_idx" ON "CompanyOrder"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_companyOrderId_key" ON "Order"("companyOrderId");

-- CreateIndex
CREATE INDEX "Order_companyOrderId_idx" ON "Order"("companyOrderId");

-- AddForeignKey
ALTER TABLE "CompanyOrder" ADD CONSTRAINT "CompanyOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
