import { auth } from '@/auth';
import { getChannelInfo } from '@/lib/youtube';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const channelInfo = await getChannelInfo(session.accessToken);

    return NextResponse.json({ 
      channelInfo,
      connected: true,
    });
  } catch (error: any) {
    console.error('Error getting channel info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get channel info' },
      { status: 500 }
    );
  }
}
