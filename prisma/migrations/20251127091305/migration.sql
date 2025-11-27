/*
  Warnings:

  - The `preOrderReadyEarliest` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `preOrderReadyLatest` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "preOrderReadyEarliest",
ADD COLUMN     "preOrderReadyEarliest" INTEGER,
DROP COLUMN "preOrderReadyLatest",
ADD COLUMN     "preOrderReadyLatest" INTEGER;
