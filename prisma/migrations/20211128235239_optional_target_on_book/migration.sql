/*
  Warnings:

  - You are about to drop the `DailyTarget` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN "goal_snapshot_currentPage" INTEGER;
ALTER TABLE "Book" ADD COLUMN "goal_snapshot_mode" TEXT;
ALTER TABLE "Book" ADD COLUMN "goal_snapshot_pageCount" INTEGER;
ALTER TABLE "Book" ADD COLUMN "goal_snapshot_rateGoal" INTEGER;
ALTER TABLE "Book" ADD COLUMN "goal_snapshot_targetDate" DATETIME;
ALTER TABLE "Book" ADD COLUMN "goal_targetCalculatedAt" DATETIME;
ALTER TABLE "Book" ADD COLUMN "goal_targetPage" INTEGER;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DailyTarget";
PRAGMA foreign_keys=on;
