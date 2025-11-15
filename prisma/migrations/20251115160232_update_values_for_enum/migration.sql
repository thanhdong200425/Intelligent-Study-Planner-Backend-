/*
  Warnings:

  - The values [SHORT,LONG] on the enum `BreakType` will be removed. If these variants are still used in the database, this will fail.
  - The values [LOW,MEDIUM,HIGH,UNKNOWN] on the enum `TaskPriority` will be removed. If these variants are still used in the database, this will fail.
  - The values [READING,CODING,WRITING,PSET,OTHER] on the enum `TaskType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BreakType_new" AS ENUM ('short', 'long');
ALTER TABLE "public"."time_blocks" ALTER COLUMN "break_type" TYPE "public"."BreakType_new" USING ("break_type"::text::"public"."BreakType_new");
ALTER TYPE "public"."BreakType" RENAME TO "BreakType_old";
ALTER TYPE "public"."BreakType_new" RENAME TO "BreakType";
DROP TYPE "public"."BreakType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TaskPriority_new" AS ENUM ('low', 'medium', 'high', 'unknown');
ALTER TABLE "public"."tasks" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "public"."tasks" ALTER COLUMN "priority" TYPE "public"."TaskPriority_new" USING ("priority"::text::"public"."TaskPriority_new");
ALTER TYPE "public"."TaskPriority" RENAME TO "TaskPriority_old";
ALTER TYPE "public"."TaskPriority_new" RENAME TO "TaskPriority";
DROP TYPE "public"."TaskPriority_old";
ALTER TABLE "public"."tasks" ALTER COLUMN "priority" SET DEFAULT 'medium';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TaskType_new" AS ENUM ('reading', 'coding', 'writing', 'pset', 'other');
ALTER TABLE "public"."tasks" ALTER COLUMN "type" TYPE "public"."TaskType_new" USING ("type"::text::"public"."TaskType_new");
ALTER TYPE "public"."TaskType" RENAME TO "TaskType_old";
ALTER TYPE "public"."TaskType_new" RENAME TO "TaskType";
DROP TYPE "public"."TaskType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."tasks" ALTER COLUMN "priority" SET DEFAULT 'medium';
