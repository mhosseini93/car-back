CREATE TYPE "public"."contact_subject" AS ENUM('purchase', 'installment', 'support', 'other');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"subject" "contact_subject" DEFAULT 'other' NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_messages_read_idx" ON "contact_messages" USING btree ("is_read","created_at");