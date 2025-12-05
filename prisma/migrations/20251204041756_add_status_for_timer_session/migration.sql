-- CreateEnum
CREATE TYPE "public"."TimerSessionStatus" AS ENUM ('active', 'completed', 'stopped');

-- AlterTable
ALTER TABLE "public"."timer_sessions" ADD COLUMN     "status" "public"."TimerSessionStatus" NOT NULL DEFAULT 'active';
