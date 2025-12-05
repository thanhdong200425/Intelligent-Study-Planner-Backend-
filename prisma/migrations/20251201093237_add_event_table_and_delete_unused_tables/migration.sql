/*
  Warnings:

  - You are about to drop the `habit_completions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `habits` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."habit_completions" DROP CONSTRAINT "habit_completions_habit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."habit_completions" DROP CONSTRAINT "habit_completions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."habits" DROP CONSTRAINT "habits_user_id_fkey";

-- DropTable
DROP TABLE "public"."habit_completions";

-- DropTable
DROP TABLE "public"."habits";

-- CreateTable
CREATE TABLE "public"."events" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "event_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
