/*
  Warnings:

  - Added the required column `title` to the `Picture` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Picture" (
    "pictureId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "Picture_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Picture" ("authorId", "label", "pictureId") SELECT "authorId", "label", "pictureId" FROM "Picture";
DROP TABLE "Picture";
ALTER TABLE "new_Picture" RENAME TO "Picture";
CREATE UNIQUE INDEX "Picture_title_key" ON "Picture"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
