-- Create posted_comments table
CREATE TABLE IF NOT EXISTS posted_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  channel_title TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  sentiment TEXT DEFAULT 'neutral',
  youtube_comment_id TEXT,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posted_comments_user_id ON posted_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_posted_comments_video_id ON posted_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_posted_comments_posted_at ON posted_comments(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_posted_comments_youtube_id ON posted_comments(youtube_comment_id);
