/*
  Warnings:

  - Added the required column `profileId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "profileId" TEXT NOT NULL;
