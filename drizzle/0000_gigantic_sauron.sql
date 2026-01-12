CREATE TABLE IF NOT EXISTS "posted_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"video_id" text NOT NULL,
	"video_title" text NOT NULL,
	"video_url" text NOT NULL,
	"channel_title" text NOT NULL,
	"comment_text" text NOT NULL,
	"sentiment" text NOT NULL,
	"youtube_comment_id" text,
	"like_count" integer DEFAULT 0,
	"reply_count" integer DEFAULT 0,
	"posted_at" timestamp DEFAULT now() NOT NULL,
	"last_synced_at" timestamp,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "posted_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "video_id_idx" ON "posted_comments" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posted_at_idx" ON "posted_comments" USING btree ("posted_at");