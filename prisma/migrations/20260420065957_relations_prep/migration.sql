/*
  Warnings:

  - You are about to drop the column `main` on the `Dishes` table. All the data in the column will be lost.
  - You are about to drop the column `side` on the `Dishes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Dishes" DROP COLUMN "main",
DROP COLUMN "side";

-- CreateTable
CREATE TABLE "Side" (
    "id" SERIAL NOT NULL,
    "ingredient" TEXT NOT NULL,

    CONSTRAINT "Side_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Main" (
    "id" SERIAL NOT NULL,
    "ingredient" TEXT NOT NULL,

    CONSTRAINT "Main_pkey" PRIMARY KEY ("id")
);
