/*
  Warnings:

  - Added the required column `movieId` to the `WatchHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WatchHistory" ADD COLUMN     "movieId" TEXT NOT NULL;
