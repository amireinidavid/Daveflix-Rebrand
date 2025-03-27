/*
  Warnings:

  - You are about to drop the column `percentage` on the `ContinueWatching` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `ContinueWatching` table. All the data in the column will be lost.
  - The `progress` column on the `WatchHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `completionPercentage` to the `ContinueWatching` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `progress` on the `ContinueWatching` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ContinueWatching" DROP COLUMN "percentage",
DROP COLUMN "timestamp",
ADD COLUMN     "completionPercentage" DOUBLE PRECISION NOT NULL,
DROP COLUMN "progress",
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "WatchHistory" ADD COLUMN     "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "progress",
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0;
