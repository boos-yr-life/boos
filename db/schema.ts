import { pgTable, text, timestamp, integer, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const postedComments = pgTable("posted_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  videoId: text("video_id").notNull(),
  videoTitle: text("video_title").notNull(),
  videoUrl: text("video_url").notNull(),
  channelTitle: text("channel_title").notNull(),
  commentText: text("comment_text").notNull(),
  sentiment: text("sentiment").notNull(),
  youtubeCommentId: text("youtube_comment_id"),
  
  // Analytics data
  likeCount: integer("like_count").default(0),
  replyCount: integer("reply_count").default(0),
  
  // Metadata
  postedAt: timestamp("posted_at").defaultNow().notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  
  // Store additional context
  metadata: jsonb("metadata"),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  videoIdIdx: index("video_id_idx").on(table.videoId),
  postedAtIdx: index("posted_at_idx").on(table.postedAt),
}));

export const insertPostedCommentSchema = createInsertSchema(postedComments);
