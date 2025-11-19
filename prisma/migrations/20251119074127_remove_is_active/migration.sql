/*
  Warnings:

  - You are about to drop the column `is_active` on the `timer_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."timer_sessions" DROP COLUMN "is_active";
