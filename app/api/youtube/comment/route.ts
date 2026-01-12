import { auth } from '@/auth';
import { postComment } from '@/lib/youtube';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const commentSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  commentText: z.string().min(10, 'Comment must be at least 10 characters').max(10000, 'Comment is too long'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = commentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { videoId, commentText } = validation.data;

    const result = await postComment(session.accessToken, videoId, commentText);

    return NextResponse.json({ 
      success: true,
      commentId: result.id,
    });
  } catch (error: any) {
    console.error('Error posting comment:', error);
    
    // Handle quota exceeded
    if (error.code === 403 && error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'YouTube API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to post comment' },
      { status: 500 }
    );
  }
}
