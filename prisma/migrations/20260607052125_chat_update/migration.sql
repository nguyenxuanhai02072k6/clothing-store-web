-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "lastMessage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "cskhName" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ChatSession" ("createdAt", "customerEmail", "customerName", "id", "lastMessage", "updatedAt") SELECT "createdAt", "customerEmail", "customerName", "id", "lastMessage", "updatedAt" FROM "ChatSession";
DROP TABLE "ChatSession";
ALTER TABLE "new_ChatSession" RENAME TO "ChatSession";
CREATE UNIQUE INDEX "ChatSession_customerEmail_key" ON "ChatSession"("customerEmail");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
