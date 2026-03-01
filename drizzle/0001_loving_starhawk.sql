ALTER TABLE "posted_comments" ADD COLUMN "platform" text DEFAULT 'youtube' NOT NULL;--> statement-breakpoint
ALTER TABLE "posted_comments" ADD COLUMN "content_id" text;--> statement-breakpoint
ALTER TABLE "posted_comments" ADD COLUMN "content_title" text;--> statement-breakpoint
ALTER TABLE "posted_comments" ADD COLUMN "content_url" text;--> statement-breakpoint
ALTER TABLE "posted_comments" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "posted_comments" ADD COLUMN "platform_comment_id" text;--> statement-breakpoint

-- Migrate existing data
UPDATE "posted_comments" SET
  "content_id" = "video_id",
  "content_title" = "video_title",
  "content_url" = "video_url",
  "author_name" = "channel_title",
  "platform_comment_id" = "youtube_comment_id"
WHERE "content_id" IS NULL;--> statement-breakpoint

-- Make content_id NOT NULL after migration
ALTER TABLE "posted_comments" ALTER COLUMN "content_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posted_comments" ALTER COLUMN "content_title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posted_comments" ALTER COLUMN "content_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posted_comments" ALTER COLUMN "author_name" SET NOT NULL;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "platform_idx" ON "posted_comments" USING btree ("platform");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_id_idx" ON "posted_comments" USING btree ("content_id");--> statement-breakpoint

DROP INDEX IF EXISTS "video_id_idx";--> statement-breakpoint
ALTER TABLE "posted_comments" DROP COLUMN IF EXISTS "video_id";--> statement-breakpoint
ALTER TABLE "posted_comments" DROP COLUMN IF EXISTS "video_title";--> statement-breakpoint
ALTER TABLE "posted_comments" DROP COLUMN IF EXISTS "video_url";--> statement-breakpoint
ALTER TABLE "posted_comments" DROP COLUMN IF EXISTS "channel_title";--> statement-breakpoint
ALTER TABLE "posted_comments" DROP COLUMN IF EXISTS "youtube_comment_id";