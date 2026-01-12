import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/db';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { commentId, likeCount, replyCount } = await request.json();

    await sql`
      UPDATE posted_comments
      SET 
        like_count = ${likeCount},
        reply_count = ${replyCount},
        last_synced_at = NOW()
      WHERE id = ${commentId}
        AND user_id = ${session.user.id}
    `;

    return NextResponse.json({ 
      success: true 
    });
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update comment' },
      { status: 500 }
    );
  }
}
