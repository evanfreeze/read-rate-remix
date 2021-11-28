-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Book" (
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
    CONSTRAINT "Book_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "targetPage" INTEGER NOT NULL,
    "calcTime" DATETIME NOT NULL,
    "snapshot_pageCount" INTEGER NOT NULL,
    "snapshot_currentPage" INTEGER NOT NULL,
    "snapshot_targetDate" DATETIME NOT NULL,
    "snapshot_rateGoal" INTEGER,
    "snapshot_mode" TEXT NOT NULL,
    CONSTRAINT "DailyTarget_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
