import { auth } from '@/auth';
import { getInstagramAccount } from '@/lib/instagram';
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

    const accountInfo = await getInstagramAccount(session.accessToken);

    return NextResponse.json({ accountInfo });
  } catch (error: any) {
    console.error('Error fetching Instagram account:', error);

    return NextResponse.json(
      { error: 'Failed to fetch Instagram account information' },
      { status: 500 }
    );
  }
}