CREATE TABLE "library_items" (
	"id" serial PRIMARY KEY,
	"library_id" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"creator" text NOT NULL,
	"year" integer,
	"synopsis" text NOT NULL,
	"genres" jsonb DEFAULT '[]' NOT NULL,
	"cover_url" text,
	"source" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
