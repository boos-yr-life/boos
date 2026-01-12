import { auth } from '@/auth';
import { searchVideos } from '@/lib/youtube';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  maxResults: z.number().min(1).max(50).optional().default(10),
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
    const query = searchParams.get('query');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    const validation = searchSchema.safeParse({ query, maxResults });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const videos = await searchVideos(session.accessToken, query!, maxResults);

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error('Error searching videos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search videos' },
      { status: 500 }
    );
  }
}
