import { auth } from '@/auth';
import { getFacebookPost, extractFacebookPostId } from '@/lib/facebook';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const postId = extractFacebookPostId(url);
    if (!postId) {
      return NextResponse.json(
        { error: 'Invalid Facebook URL' },
        { status: 400 }
      );
    }

    const post = await getFacebookPost(session.accessToken, postId);

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Error fetching Facebook post:', error);

    return NextResponse.json(
      { error: 'Failed to fetch Facebook post' },
      { status: 500 }
    );
  }
}