ALTER TABLE "brands" ADD COLUMN "show_on_home" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- Start with the brands that currently have cars on sale
UPDATE "brands" SET "show_on_home" = true WHERE EXISTS (SELECT 1 FROM "cars" WHERE "cars"."brand_id" = "brands"."id" AND "cars"."is_active");
