/*
  Warnings:

  - You are about to drop the column `completionPercentage` on the `WatchHistory` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `WatchHistory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `WatchHistory` table. All the data in the column will be lost.
  - You are about to drop the column `watchTime` on the `WatchHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,profileId,episodeId]` on the table `WatchHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "WatchHistory_contentId_idx";

-- AlterTable
ALTER TABLE "WatchHistory" DROP COLUMN "completionPercentage",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "watchTime";

-- CreateIndex
CREATE UNIQUE INDEX "WatchHistory_userId_profileId_episodeId_key" ON "WatchHistory"("userId", "profileId", "episodeId");
