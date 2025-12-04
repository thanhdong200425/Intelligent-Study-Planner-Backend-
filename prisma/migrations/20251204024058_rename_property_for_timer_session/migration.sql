/*
  Warnings:

  - You are about to drop the column `actual_minutes` on the `timer_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."timer_sessions" DROP COLUMN "actual_minutes",
ADD COLUMN     "duration_minutes" INTEGER NOT NULL DEFAULT 0;
