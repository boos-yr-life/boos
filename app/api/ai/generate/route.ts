import { generateComment } from '@/lib/gemini';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const generateSchema = z.object({
  videoTitle: z.string().min(1, 'Video title is required'),
  videoDescription: z.string(),
  channelTitle: z.string(),
  template: z.string().optional(),
  sentiment: z.enum(['positive', 'neutral', 'constructive', 'enthusiastic']).optional(),
  additionalContext: z.string().optional(),
  transcript: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = generateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: validation.error.issues[0].message 
        },
        { status: 400 }
      );
    }

    const comment = await generateComment(validation.data);

    return NextResponse.json({ 
      success: true,
      comment,
    });
  } catch (error: any) {
    console.error('Error generating comment:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to generate comment' 
      },
      { status: 500 }
    );
  }
}
