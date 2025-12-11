/*
  Warnings:

  - You are about to drop the column `videoThumbnail` on the `cars` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `cars` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cars" DROP COLUMN "videoThumbnail",
DROP COLUMN "videoUrl",
ADD COLUMN     "mediaType" "MediaType" DEFAULT 'IMAGE',
ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;
