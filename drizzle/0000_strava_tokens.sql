CREATE TABLE "strava_oauth_states" (
	"state" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strava_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
