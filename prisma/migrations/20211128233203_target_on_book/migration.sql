/*
  Warnings:

  - You are about to drop the `DailyTarget` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `goal_snapshot_currentPage` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goal_snapshot_mode` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goal_snapshot_pageCount` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goal_snapshot_targetDate` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goal_targetCalculatedAt` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goal_targetPage` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DailyTarget";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "readerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "ISBN" TEXT,
    "pageCount" INTEGER NOT NULL,
    "currentPage" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "rateGoal" INTEGER,
    "startDate" DATETIME NOT NULL,
    "targetDate" DATETIME NOT NULL,
    "archivedAt" DATETIME,
    "completedAt" DATETIME,
    "deletedAt" DATETIME,
    "coverUrl" TEXT,
    "goal_targetPage" INTEGER NOT NULL,
    "goal_targetCalculatedAt" DATETIME NOT NULL,
    "goal_snapshot_pageCount" INTEGER NOT NULL,
    "goal_snapshot_currentPage" INTEGER NOT NULL,
    "goal_snapshot_targetDate" DATETIME NOT NULL,
    "goal_snapshot_rateGoal" INTEGER,
    "goal_snapshot_mode" TEXT NOT NULL,
    CONSTRAINT "Book_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("ISBN", "archivedAt", "author", "completedAt", "coverUrl", "createdAt", "currentPage", "deletedAt", "id", "mode", "pageCount", "rateGoal", "readerId", "startDate", "targetDate", "title", "updatedAt") SELECT "ISBN", "archivedAt", "author", "completedAt", "coverUrl", "createdAt", "currentPage", "deletedAt", "id", "mode", "pageCount", "rateGoal", "readerId", "startDate", "targetDate", "title", "updatedAt" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
