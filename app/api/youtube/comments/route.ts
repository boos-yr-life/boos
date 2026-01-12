import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMyCommentThreads, getVideoDetailsForComments } from '@/lib/youtube';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const maxResults = parseInt(searchParams.get('maxResults') || '50');

    // Fetch user's comment threads
    const comments = await getMyCommentThreads(session.accessToken, maxResults);

    // Get unique video IDs
    const videoIds = [...new Set(comments.map(c => c.videoId))].filter(Boolean);

    // Fetch video details for all comments
    const videoDetails = await getVideoDetailsForComments(session.accessToken, videoIds);

    // Enhance comments with video titles
    const enhancedComments = comments.map(comment => ({
      ...comment,
      videoTitle: videoDetails[comment.videoId]?.title || 'Unknown Video',
      channelTitle: videoDetails[comment.videoId]?.channelTitle || 'Unknown Channel',
      videoUrl: `https://www.youtube.com/watch?v=${comment.videoId}`,
    }));

    return NextResponse.json({
      success: true,
      comments: enhancedComments,
      total: enhancedComments.length,
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
