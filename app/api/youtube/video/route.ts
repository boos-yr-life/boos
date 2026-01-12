import { auth } from '@/auth';
import { getVideoDetails, extractVideoId, getVideoTranscript } from '@/lib/youtube';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const videoSchema = z.object({
  url: z.string().url('Invalid URL'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const url = searchParams.get('url');

    const validation = videoSchema.safeParse({ url });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url!);
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const video = await getVideoDetails(session.accessToken, videoId);
    
    // Attempt to fetch transcript (may be null if unavailable)
    const transcript = await getVideoTranscript(session.accessToken, videoId);

    return NextResponse.json({ video, transcript });
  } catch (error: any) {
    console.error('Error getting video details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get video details' },
      { status: 500 }
    );
  }
}
