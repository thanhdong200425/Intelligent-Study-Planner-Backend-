-- CreateTable
CREATE TABLE "public"."feedback" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "feedback_type" TEXT NOT NULL,
    "category" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
