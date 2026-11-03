ALTER TABLE "cars" ADD COLUMN "meta_title" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "meta_description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "robots_index" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "robots_follow" boolean DEFAULT true NOT NULL;