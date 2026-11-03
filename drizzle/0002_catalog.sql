CREATE TYPE "public"."car_condition" AS ENUM('new', 'used');--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"english_name" text DEFAULT '' NOT NULL,
	"intro" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"logo_url" text,
	"color" text DEFAULT '#1d4ed8' NOT NULL,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"meta_title" text DEFAULT '' NOT NULL,
	"meta_description" text DEFAULT '' NOT NULL,
	"robots_index" boolean DEFAULT true NOT NULL,
	"robots_follow" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand_id" integer NOT NULL,
	"name" text NOT NULL,
	"year" integer NOT NULL,
	"condition" "car_condition" DEFAULT 'new' NOT NULL,
	"mileage" integer DEFAULT 0 NOT NULL,
	"price" bigint NOT NULL,
	"min_down_percent" integer DEFAULT 30 NOT NULL,
	"gearbox" text DEFAULT 'اتوماتیک' NOT NULL,
	"fuel" text DEFAULT 'بنزین' NOT NULL,
	"color" text DEFAULT '#e5e7eb' NOT NULL,
	"image_url" text,
	"image_alt" text DEFAULT '' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"weekly_views" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cars_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cars_brand_idx" ON "cars" USING btree ("brand_id");