/*
  Warnings:

  - The `progress` column on the `ContinueWatching` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `progress` column on the `WatchHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ContinueWatching" DROP COLUMN "progress",
ADD COLUMN     "progress" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WatchHistory" DROP COLUMN "progress",
ADD COLUMN     "progress" BOOLEAN NOT NULL DEFAULT false;
