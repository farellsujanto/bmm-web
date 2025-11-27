/*
  Warnings:

  - You are about to drop the column `preOrderEnd` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `preOrderStart` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "preOrderEnd",
DROP COLUMN "preOrderStart",
ADD COLUMN     "dataSheetUrl" TEXT,
ADD COLUMN     "discount" DECIMAL(5,2),
ADD COLUMN     "preOrderReadyEarliest" TIMESTAMP(3),
ADD COLUMN     "preOrderReadyLatest" TIMESTAMP(3),
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE INDEX "Product_sortOrder_idx" ON "Product"("sortOrder");
