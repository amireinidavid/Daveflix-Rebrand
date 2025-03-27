/*
  Warnings:

  - Added the required column `profileId` to the `ContinueWatching` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progress` to the `ContinueWatching` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContinueWatching" ADD COLUMN     "profileId" TEXT NOT NULL,
ADD COLUMN     "progress" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WatchHistory" ADD COLUMN     "progress" TEXT;
