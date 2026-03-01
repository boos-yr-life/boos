import { auth } from '@/auth';
import { postInstagramComment } from '@/lib/instagram';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const commentSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
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

    const { postId, commentText } = validation.data;

    const result = await postInstagramComment(session.accessToken, postId, commentText);

    return NextResponse.json({
      success: true,
      commentId: result.id,
    });
  } catch (error: any) {
    console.error('Error posting Instagram comment:', error);

    return NextResponse.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    );
  }
}