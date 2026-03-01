import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const comments = await sql`
      SELECT
        id,
        user_id as "userId",
        platform,
        content_id as "contentId",
        content_title as "contentTitle",
        content_url as "contentUrl",
        author_name as "authorName",
        comment_text as "commentText",
        sentiment,
        platform_comment_id as "platformCommentId",
        like_count as "likeCount",
        reply_count as "replyCount",
        posted_at as "postedAt",
        last_synced_at as "lastSyncedAt"
      FROM posted_comments
      WHERE user_id = ${session.user.id}
      ORDER BY posted_at DESC
    `;

    return NextResponse.json({ 
      success: true,
      comments 
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
