/*
  Warnings:

  - You are about to drop the column `mediaType` on the `cars` table. All the data in the column will be lost.
  - You are about to drop the column `mediaUrl` on the `cars` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `cars` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "car_images" ADD COLUMN     "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "cars" DROP COLUMN "mediaType",
DROP COLUMN "mediaUrl",
DROP COLUMN "thumbnailUrl";
