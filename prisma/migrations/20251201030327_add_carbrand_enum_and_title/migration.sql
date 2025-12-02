/*
  Warnings:

  - Added the required column `title` to the `cars` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `brand` on the `cars` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CarBrand" AS ENUM ('BMW', 'MERCEDES_BENZ', 'PORSCHE', 'TESLA', 'AUDI', 'LEXUS');

-- AlterTable
ALTER TABLE "cars" ADD COLUMN     "title" TEXT NOT NULL,
DROP COLUMN "brand",
ADD COLUMN     "brand" "CarBrand" NOT NULL;
