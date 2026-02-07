-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NewsArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "summaryPoints" TEXT NOT NULL,
    "fullContent" TEXT,
    "youtubeUrl" TEXT,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Politics',
    "tags" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'AI Generated',
    "authorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NewsArticle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_NewsArticle" ("authorId", "category", "createdAt", "fullContent", "id", "published", "summaryPoints", "tags", "title", "updatedAt", "youtubeUrl") SELECT "authorId", "category", "createdAt", "fullContent", "id", "published", "summaryPoints", "tags", "title", "updatedAt", "youtubeUrl" FROM "NewsArticle";
DROP TABLE "NewsArticle";
ALTER TABLE "new_NewsArticle" RENAME TO "NewsArticle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
