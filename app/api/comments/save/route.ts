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
      videoId,
      videoTitle,
      videoUrl,
      channelTitle,
      commentText,
      sentiment,
      youtubeCommentId,
    } = body;

    const [comment] = await sql`
      INSERT INTO posted_comments (
        user_id,
        video_id,
        video_title,
        video_url,
        channel_title,
        comment_text,
        sentiment,
        youtube_comment_id,
        like_count,
        reply_count
      ) VALUES (
        ${session.user.id},
        ${videoId},
        ${videoTitle},
        ${videoUrl},
        ${channelTitle},
        ${commentText},
        ${sentiment || 'neutral'},
        ${youtubeCommentId || null},
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
