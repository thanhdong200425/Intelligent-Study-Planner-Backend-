/*
  Warnings:

  - You are about to drop the column `createdAt` on the `availability_windows` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `availability_windows` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `availability_windows` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `availability_windows` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `availability_windows` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `availability_windows` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `deadlines` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `deadlines` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `deadlines` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `deadlines` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `deadlines` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `habit_completions` table. All the data in the column will be lost.
  - You are about to drop the column `habitId` on the `habit_completions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `habit_completions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `habits` table. All the data in the column will be lost.
  - You are about to drop the column `currentStreak` on the `habits` table. All the data in the column will be lost.
  - You are about to drop the column `longestStreak` on the `habits` table. All the data in the column will be lost.
  - You are about to drop the column `targetMinutes` on the `habits` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `habits` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `habits` table. All the data in the column will be lost.
  - You are about to drop the column `actualMinutes` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `deadlineId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `estimateMinutes` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `actualMinutes` on the `time_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `breakType` on the `time_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `time_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `time_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `isBreak` on the `time_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `time_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `time_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `time_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `time_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `actualMinutes` on the `timer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `timer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `timer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `timer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `timer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `timeBlockId` on the `timer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `timer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `timer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `habitStreaks` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `mostProductiveTimeSlot` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `tasksCompleted` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `tasksOverdue` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `timePerCourse` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `totalActualTime` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `totalPredictedTime` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `weekEnd` on the `weekly_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `weekStart` on the `weekly_summaries` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[habit_id,date]` on the table `habit_completions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,week_start]` on the table `weekly_summaries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day_of_week` to the `availability_windows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `availability_windows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `availability_windows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `availability_windows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `availability_windows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `deadlines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `due_date` to the `deadlines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `deadlines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `deadlines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `habit_id` to the `habit_completions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `habit_completions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_minutes` to the `habits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `habits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `habits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimate_minutes` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `time_blocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `time_blocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `time_blocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `time_blocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `timer_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_block_id` to the `timer_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `timer_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `timer_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashed_password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `habit_streaks` to the `weekly_summaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_per_course` to the `weekly_summaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `weekly_summaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `weekly_summaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week_end` to the `weekly_summaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week_start` to the `weekly_summaries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."availability_windows" DROP CONSTRAINT "availability_windows_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."courses" DROP CONSTRAINT "courses_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."deadlines" DROP CONSTRAINT "deadlines_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."deadlines" DROP CONSTRAINT "deadlines_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."habit_completions" DROP CONSTRAINT "habit_completions_habitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."habit_completions" DROP CONSTRAINT "habit_completions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."habits" DROP CONSTRAINT "habits_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_deadlineId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."time_blocks" DROP CONSTRAINT "time_blocks_taskId_fkey";

-- DropForeignKey
ALTER TABLE "public"."time_blocks" DROP CONSTRAINT "time_blocks_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."timer_sessions" DROP CONSTRAINT "timer_sessions_timeBlockId_fkey";

-- DropForeignKey
ALTER TABLE "public"."timer_sessions" DROP CONSTRAINT "timer_sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."weekly_summaries" DROP CONSTRAINT "weekly_summaries_userId_fkey";

-- DropIndex
DROP INDEX "public"."habit_completions_habitId_date_key";

-- DropIndex
DROP INDEX "public"."weekly_summaries_userId_weekStart_key";

-- AlterTable
ALTER TABLE "public"."availability_windows" DROP COLUMN "createdAt",
DROP COLUMN "dayOfWeek",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "day_of_week" INTEGER NOT NULL,
ADD COLUMN     "end_time" TEXT NOT NULL,
ADD COLUMN     "start_time" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."deadlines" DROP COLUMN "courseId",
DROP COLUMN "createdAt",
DROP COLUMN "dueDate",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "due_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."habit_completions" DROP COLUMN "createdAt",
DROP COLUMN "habitId",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "habit_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."habits" DROP COLUMN "createdAt",
DROP COLUMN "currentStreak",
DROP COLUMN "longestStreak",
DROP COLUMN "targetMinutes",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "longest_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "target_minutes" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."tasks" DROP COLUMN "actualMinutes",
DROP COLUMN "courseId",
DROP COLUMN "createdAt",
DROP COLUMN "deadlineId",
DROP COLUMN "estimateMinutes",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "actual_minutes" INTEGER,
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deadline_id" INTEGER,
ADD COLUMN     "estimate_minutes" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."time_blocks" DROP COLUMN "actualMinutes",
DROP COLUMN "breakType",
DROP COLUMN "createdAt",
DROP COLUMN "endTime",
DROP COLUMN "isBreak",
DROP COLUMN "startTime",
DROP COLUMN "taskId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "actual_minutes" INTEGER,
ADD COLUMN     "break_type" "public"."BreakType",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_break" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "task_id" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."timer_sessions" DROP COLUMN "actualMinutes",
DROP COLUMN "createdAt",
DROP COLUMN "endTime",
DROP COLUMN "isActive",
DROP COLUMN "startTime",
DROP COLUMN "timeBlockId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "actual_minutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_time" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "time_block_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hashed_password" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."weekly_summaries" DROP COLUMN "createdAt",
DROP COLUMN "habitStreaks",
DROP COLUMN "mostProductiveTimeSlot",
DROP COLUMN "tasksCompleted",
DROP COLUMN "tasksOverdue",
DROP COLUMN "timePerCourse",
DROP COLUMN "totalActualTime",
DROP COLUMN "totalPredictedTime",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
DROP COLUMN "weekEnd",
DROP COLUMN "weekStart",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "habit_streaks" JSONB NOT NULL,
ADD COLUMN     "most_productive_time_slot" JSONB,
ADD COLUMN     "tasks_completed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tasks_overdue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "time_per_course" JSONB NOT NULL,
ADD COLUMN     "total_actual_time" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_predicted_time" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD COLUMN     "week_end" DATE NOT NULL,
ADD COLUMN     "week_start" DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "habit_completions_habit_id_date_key" ON "public"."habit_completions"("habit_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_summaries_user_id_week_start_key" ON "public"."weekly_summaries"("user_id", "week_start");

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deadlines" ADD CONSTRAINT "deadlines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deadlines" ADD CONSTRAINT "deadlines_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_deadline_id_fkey" FOREIGN KEY ("deadline_id") REFERENCES "public"."deadlines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_windows" ADD CONSTRAINT "availability_windows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_blocks" ADD CONSTRAINT "time_blocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_blocks" ADD CONSTRAINT "time_blocks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_completions" ADD CONSTRAINT "habit_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_completions" ADD CONSTRAINT "habit_completions_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weekly_summaries" ADD CONSTRAINT "weekly_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timer_sessions" ADD CONSTRAINT "timer_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timer_sessions" ADD CONSTRAINT "timer_sessions_time_block_id_fkey" FOREIGN KEY ("time_block_id") REFERENCES "public"."time_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
