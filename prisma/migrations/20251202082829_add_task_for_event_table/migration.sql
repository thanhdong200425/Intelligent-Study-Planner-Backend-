-- AlterTable
ALTER TABLE "public"."events" ADD COLUMN     "task_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
