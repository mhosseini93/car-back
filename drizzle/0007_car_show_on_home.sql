ALTER TABLE "cars" ADD COLUMN "show_on_home" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- Keep the cars that led the old view-count ranking on the homepage
UPDATE "cars" SET "show_on_home" = true WHERE "id" IN (SELECT "id" FROM "cars" WHERE "is_active" AND "weekly_views" > 0 ORDER BY "weekly_views" DESC LIMIT 8);
