CREATE TABLE "falcon_api_key" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"keyHash" text NOT NULL,
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"revokedAt" timestamp,
	CONSTRAINT "falcon_api_key_keyHash_unique" UNIQUE("keyHash")
);
