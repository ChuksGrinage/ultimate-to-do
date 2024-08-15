ALTER TABLE "user" RENAME TO "account";--> statement-breakpoint
ALTER TABLE "task" RENAME COLUMN "user_id" TO "account_id";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "name" TO "first_name";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "user_email_unique";--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "last_name" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_email_unique" UNIQUE("email");