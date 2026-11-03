ALTER TABLE "cars" ADD COLUMN "gallery" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "content" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "specs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "installments" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_source_url_unique" UNIQUE("source_url");