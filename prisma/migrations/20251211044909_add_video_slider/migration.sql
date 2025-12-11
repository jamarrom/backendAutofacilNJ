-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "auction_sliders" ADD COLUMN     "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "home_sliders" ADD COLUMN     "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;
