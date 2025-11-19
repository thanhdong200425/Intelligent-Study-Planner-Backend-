-- CreateEnum
CREATE TYPE "public"."TimerSessionType" AS ENUM ('focus', 'break', 'long_break');

-- AlterTable
ALTER TABLE "public"."timer_sessions" ADD COLUMN     "task_id" INTEGER,
ALTER COLUMN "time_block_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."timer_sessions" ADD CONSTRAINT "timer_sessions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
