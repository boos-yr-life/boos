import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      platform,
      contentId,
      contentTitle,
      contentUrl,
      authorName,
      commentText,
      sentiment,
      platformCommentId,
    } = body;

    const [comment] = await sql`
      INSERT INTO posted_comments (
        user_id,
        platform,
        content_id,
        content_title,
        content_url,
        author_name,
        comment_text,
        sentiment,
        platform_comment_id,
        like_count,
        reply_count
      ) VALUES (
        ${session.user.id},
        ${platform || 'youtube'},
        ${contentId},
        ${contentTitle},
        ${contentUrl},
        ${authorName},
        ${commentText},
        ${sentiment || 'neutral'},
        ${platformCommentId || null},
        0,
        0
      )
      RETURNING id
    `;

    return NextResponse.json({ 
      success: true,
      id: comment.id 
    });
  } catch (error: any) {
    console.error('Error saving comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save comment' },
      { status: 500 }
    );
  }
}
