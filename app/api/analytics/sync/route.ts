import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCommentEngagement } from '@/lib/youtube';
import { sql } from '@/db';

type CommentRecord = {
  id: string;
  youtubeCommentId: string | null;
  likeCount: number;
  replyCount: number;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.accessToken || !session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch comments from database
    const comments = await sql`
      SELECT id, youtube_comment_id as "youtubeCommentId", like_count as "likeCount", reply_count as "replyCount"
      FROM posted_comments
      WHERE user_id = ${session.user.id}
        AND youtube_comment_id IS NOT NULL
    `;

    if (!comments || comments.length === 0) {
      return NextResponse.json({ 
        success: true,
        updatedComments: [],
        message: 'No comments to sync'
      });
    }

    console.log(`Syncing engagement for ${comments.length} comments`);

    // Fetch updated engagement data from YouTube
    const updatedComments = await Promise.all(
      comments.map(async (comment: CommentRecord) => {
        if (!comment.youtubeCommentId) {
          return {
            id: comment.id,
            likeCount: comment.likeCount,
            replyCount: comment.replyCount,
          };
        }

        try {
          const engagement = await getCommentEngagement(
            session.accessToken as string,
            comment.youtubeCommentId
          );

          if (!engagement) {
            return {
              id: comment.id,
              likeCount: comment.likeCount,
              replyCount: comment.replyCount,
            };
          }

          // Update database with new engagement data
          await sql`
            UPDATE posted_comments
            SET like_count = ${engagement.likeCount},
                last_synced_at = NOW()
            WHERE id = ${comment.id}
          `;

          return {
            id: comment.id,
            likeCount: engagement.likeCount,
            replyCount: comment.replyCount,
          };
        } catch (error) {
          console.error(`Failed to sync comment ${comment.id}:`, error);
          return {
            id: comment.id,
            likeCount: comment.likeCount,
            replyCount: comment.replyCount,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      updatedComments,
    });
  } catch (error: any) {
    console.error('Error syncing engagement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync engagement' },
      { status: 500 }
    );
  }
}
