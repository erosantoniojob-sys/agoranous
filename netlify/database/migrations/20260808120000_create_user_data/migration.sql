CREATE TABLE IF NOT EXISTS "user_data" (
  "user_id" text NOT NULL,
  "collection" text NOT NULL,
  "data" jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_data_user_id_collection_pk" PRIMARY KEY("user_id", "collection")
);
