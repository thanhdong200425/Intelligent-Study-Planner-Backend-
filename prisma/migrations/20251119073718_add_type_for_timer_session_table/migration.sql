/*
  Warnings:

  - Added the required column `type` to the `timer_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."timer_sessions" ADD COLUMN     "type" "public"."TimerSessionType" NOT NULL;
