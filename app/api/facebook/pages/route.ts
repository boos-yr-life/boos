import { auth } from '@/auth';
import { getFacebookPages } from '@/lib/facebook';
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

    const pages = await getFacebookPages(session.accessToken);

    return NextResponse.json({ pages });
  } catch (error: any) {
    console.error('Error fetching Facebook pages:', error);

    return NextResponse.json(
      { error: 'Failed to fetch Facebook pages' },
      { status: 500 }
    );
  }
}