-- CreateEnum
CREATE TYPE "WeekendWorthy" AS ENUM ('YES', 'NO');

-- CreateTable
CREATE TABLE "Dishes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "main" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "otherInfo" TEXT NOT NULL,
    "weekendWorthy" "WeekendWorthy" NOT NULL DEFAULT 'NO',

    CONSTRAINT "Dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
