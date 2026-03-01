import { pgTable, text, timestamp, integer, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const postedComments = pgTable("posted_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  platform: text("platform").notNull(), // 'youtube', 'instagram', 'facebook'
  contentId: text("content_id").notNull(), // videoId, postId, etc.
  contentTitle: text("content_title").notNull(),
  contentUrl: text("content_url").notNull(),
  authorName: text("author_name").notNull(), // channelTitle, username, pageName
  commentText: text("comment_text").notNull(),
  sentiment: text("sentiment").notNull(),
  platformCommentId: text("platform_comment_id"), // youtubeCommentId, instagramCommentId, etc.

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
  platformIdx: index("platform_idx").on(table.platform),
  contentIdIdx: index("content_id_idx").on(table.contentId),
  postedAtIdx: index("posted_at_idx").on(table.postedAt),
}));

export const insertPostedCommentSchema = createInsertSchema(postedComments);
