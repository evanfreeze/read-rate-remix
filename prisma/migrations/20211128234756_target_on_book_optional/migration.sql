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
    "goal_targetPage" INTEGER,
    "goal_targetCalculatedAt" DATETIME,
    "goal_snapshot_pageCount" INTEGER,
    "goal_snapshot_currentPage" INTEGER,
    "goal_snapshot_targetDate" DATETIME,
    "goal_snapshot_rateGoal" INTEGER,
    "goal_snapshot_mode" TEXT,
    CONSTRAINT "Book_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("ISBN", "archivedAt", "author", "completedAt", "coverUrl", "createdAt", "currentPage", "deletedAt", "goal_snapshot_currentPage", "goal_snapshot_mode", "goal_snapshot_pageCount", "goal_snapshot_rateGoal", "goal_snapshot_targetDate", "goal_targetCalculatedAt", "goal_targetPage", "id", "mode", "pageCount", "rateGoal", "readerId", "startDate", "targetDate", "title", "updatedAt") SELECT "ISBN", "archivedAt", "author", "completedAt", "coverUrl", "createdAt", "currentPage", "deletedAt", "goal_snapshot_currentPage", "goal_snapshot_mode", "goal_snapshot_pageCount", "goal_snapshot_rateGoal", "goal_snapshot_targetDate", "goal_targetCalculatedAt", "goal_targetPage", "id", "mode", "pageCount", "rateGoal", "readerId", "startDate", "targetDate", "title", "updatedAt" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
