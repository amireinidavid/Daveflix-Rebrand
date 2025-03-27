/*
  Warnings:

  - You are about to drop the column `movieId` on the `WatchHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,contentId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,contentId]` on the table `Watchlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contentId` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentId` to the `Watchlist` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('MOVIE', 'TV_SHOW', 'DOCUMENTARY', 'SHORT_FILM', 'SPECIAL');

-- CreateEnum
CREATE TYPE "MaturityRating" AS ENUM ('G', 'PG', 'PG_13', 'R', 'NC_17', 'TV_Y', 'TV_Y7', 'TV_G', 'TV_PG', 'TV_14', 'TV_MA');

-- CreateEnum
CREATE TYPE "TrailerType" AS ENUM ('URL', 'UPLOADED');

-- CreateEnum
CREATE TYPE "VideoSourceType" AS ENUM ('URL', 'UPLOADED');

-- DropIndex
DROP INDEX "ContinueWatching_userId_contentId_idx";

-- AlterTable
ALTER TABLE "ContinueWatching" ADD COLUMN     "episodeId" TEXT,
ALTER COLUMN "contentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "contentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "contentId" TEXT NOT NULL,
ADD COLUMN     "helpfulCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating" INTEGER NOT NULL,
ADD COLUMN     "reportCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spoilerAlert" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WatchHistory" DROP COLUMN "movieId",
ADD COLUMN     "contentId" TEXT,
ADD COLUMN     "episodeId" TEXT;

-- AlterTable
ALTER TABLE "Watchlist" ADD COLUMN     "contentId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentListItem" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "listId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "ContentListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "releaseYear" INTEGER NOT NULL,
    "maturityRating" "MaturityRating" NOT NULL,
    "duration" INTEGER,
    "posterImage" TEXT NOT NULL,
    "backdropImage" TEXT,
    "trailerUrl" TEXT,
    "trailerFile" TEXT,
    "trailerType" "TrailerType" NOT NULL DEFAULT 'URL',
    "videoUrl" TEXT,
    "videoFile" TEXT,
    "videoSourceType" "VideoSourceType" NOT NULL DEFAULT 'URL',
    "videoSD" TEXT,
    "videoHD" TEXT,
    "video4K" TEXT,
    "videoHDR" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "newRelease" BOOLEAN NOT NULL DEFAULT false,
    "director" TEXT,
    "studio" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "country" TEXT,
    "awards" TEXT,
    "availableFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "availableUntil" TIMESTAMP(3),
    "hasSD" BOOLEAN NOT NULL DEFAULT true,
    "hasHD" BOOLEAN NOT NULL DEFAULT true,
    "has4K" BOOLEAN NOT NULL DEFAULT false,
    "hasHDR" BOOLEAN NOT NULL DEFAULT false,
    "audioLanguages" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "subtitleLanguages" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenreOnContent" (
    "contentId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "GenreOnContent_pkey" PRIMARY KEY ("contentId","genreId")
);

-- CreateTable
CREATE TABLE "CastMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "character" TEXT,
    "profileImage" TEXT,
    "contentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CastMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "title" TEXT,
    "overview" TEXT,
    "posterImage" TEXT,
    "releaseYear" INTEGER,
    "showId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "thumbnailImage" TEXT,
    "videoUrl" TEXT,
    "videoFile" TEXT,
    "videoSourceType" "VideoSourceType" NOT NULL DEFAULT 'URL',
    "videoSD" TEXT,
    "videoHD" TEXT,
    "video4K" TEXT,
    "videoHDR" TEXT,
    "seasonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE INDEX "Like_contentId_idx" ON "Like"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_contentId_key" ON "Like"("userId", "contentId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_profileId_idx" ON "SearchHistory"("profileId");

-- CreateIndex
CREATE INDEX "SearchHistory_query_idx" ON "SearchHistory"("query");

-- CreateIndex
CREATE INDEX "ContentList_createdById_idx" ON "ContentList"("createdById");

-- CreateIndex
CREATE INDEX "ContentListItem_listId_idx" ON "ContentListItem"("listId");

-- CreateIndex
CREATE INDEX "ContentListItem_contentId_idx" ON "ContentListItem"("contentId");

-- CreateIndex
CREATE INDEX "Content_type_idx" ON "Content"("type");

-- CreateIndex
CREATE INDEX "Content_releaseYear_idx" ON "Content"("releaseYear");

-- CreateIndex
CREATE INDEX "Content_maturityRating_idx" ON "Content"("maturityRating");

-- CreateIndex
CREATE INDEX "Content_featured_idx" ON "Content"("featured");

-- CreateIndex
CREATE INDEX "Content_trending_idx" ON "Content"("trending");

-- CreateIndex
CREATE INDEX "Content_newRelease_idx" ON "Content"("newRelease");

-- CreateIndex
CREATE INDEX "Content_availableFrom_availableUntil_idx" ON "Content"("availableFrom", "availableUntil");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE INDEX "GenreOnContent_contentId_idx" ON "GenreOnContent"("contentId");

-- CreateIndex
CREATE INDEX "GenreOnContent_genreId_idx" ON "GenreOnContent"("genreId");

-- CreateIndex
CREATE INDEX "CastMember_contentId_idx" ON "CastMember"("contentId");

-- CreateIndex
CREATE INDEX "CastMember_name_idx" ON "CastMember"("name");

-- CreateIndex
CREATE INDEX "Season_showId_idx" ON "Season"("showId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_showId_seasonNumber_key" ON "Season"("showId", "seasonNumber");

-- CreateIndex
CREATE INDEX "Episode_seasonId_idx" ON "Episode"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_seasonId_episodeNumber_key" ON "Episode"("seasonId", "episodeNumber");

-- CreateIndex
CREATE INDEX "ContinueWatching_userId_idx" ON "ContinueWatching"("userId");

-- CreateIndex
CREATE INDEX "ContinueWatching_contentId_idx" ON "ContinueWatching"("contentId");

-- CreateIndex
CREATE INDEX "ContinueWatching_episodeId_idx" ON "ContinueWatching"("episodeId");

-- CreateIndex
CREATE INDEX "Rating_userId_idx" ON "Rating"("userId");

-- CreateIndex
CREATE INDEX "Rating_contentId_idx" ON "Rating"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_contentId_key" ON "Rating"("userId", "contentId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_contentId_idx" ON "Review"("contentId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "WatchHistory_userId_idx" ON "WatchHistory"("userId");

-- CreateIndex
CREATE INDEX "WatchHistory_profileId_idx" ON "WatchHistory"("profileId");

-- CreateIndex
CREATE INDEX "WatchHistory_contentId_idx" ON "WatchHistory"("contentId");

-- CreateIndex
CREATE INDEX "WatchHistory_episodeId_idx" ON "WatchHistory"("episodeId");

-- CreateIndex
CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

-- CreateIndex
CREATE INDEX "Watchlist_profileId_idx" ON "Watchlist"("profileId");

-- CreateIndex
CREATE INDEX "Watchlist_contentId_idx" ON "Watchlist"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_profileId_contentId_key" ON "Watchlist"("profileId", "contentId");

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContinueWatching" ADD CONSTRAINT "ContinueWatching_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContinueWatching" ADD CONSTRAINT "ContinueWatching_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewingHistory" ADD CONSTRAINT "ViewingHistory_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentList" ADD CONSTRAINT "ContentList_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentListItem" ADD CONSTRAINT "ContentListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ContentList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreOnContent" ADD CONSTRAINT "GenreOnContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreOnContent" ADD CONSTRAINT "GenreOnContent_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastMember" ADD CONSTRAINT "CastMember_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
