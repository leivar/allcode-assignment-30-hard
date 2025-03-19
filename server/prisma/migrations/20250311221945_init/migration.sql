-- CreateTable
CREATE TABLE "User" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Picture" (
    "pictureId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "Picture_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomLabels" (
    "customLabelId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customLabelName" TEXT NOT NULL,
    "customLabelOwnerId" INTEGER NOT NULL,
    CONSTRAINT "CustomLabels_customLabelOwnerId_fkey" FOREIGN KEY ("customLabelOwnerId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Labels" (
    "customLabelId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "labelName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
