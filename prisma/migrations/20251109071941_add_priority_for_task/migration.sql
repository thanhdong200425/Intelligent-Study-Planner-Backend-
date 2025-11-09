-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "public"."tasks" ADD COLUMN     "priority" "public"."TaskPriority" NOT NULL DEFAULT 'MEDIUM';
