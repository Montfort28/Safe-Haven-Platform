/*
  Warnings:

  - Added the required column `duration` to the `Meditation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meditation" ADD COLUMN     "duration" INTEGER NOT NULL;
