ALTER TABLE "threads" RENAME TO "chats";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "thread_id" TO "chat_id";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_thread_id_threads_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" DROP CONSTRAINT "threads_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;