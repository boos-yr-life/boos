import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch comments from database
    const comments = await sql`
      SELECT 
        id,
        video_id as "videoId",
        video_title as "videoTitle",
        video_url as "videoUrl",
        channel_title as "channelTitle",
        comment_text as "commentText",
        sentiment,
        like_count as "likeCount",
        reply_count as "replyCount",
        posted_at as "postedAt"
      FROM posted_comments
      WHERE user_id = ${session.user.id}
      ORDER BY posted_at DESC
    `;

    if (comments.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          totalComments: 0,
          totalLikes: 0,
          totalReplies: 0,
          engagementRate: 0,
        },
        topVideos: [],
        recentComments: [],
      });
    }

    console.log(`Analyzing ${comments.length} tracked comments`);

    // Calculate stats
    const totalComments = comments.length;
    const totalLikes = comments.reduce((sum, c) => sum + (c.likeCount || 0), 0);
    const totalReplies = comments.reduce((sum, c) => sum + (c.replyCount || 0), 0);
    const engagementRate = totalComments > 0 
      ? ((totalLikes + totalReplies) / totalComments).toFixed(2)
      : 0;

    // Group by video for top performers
    const videoGroups = comments.reduce((acc, comment) => {
      if (!acc[comment.videoId]) {
        acc[comment.videoId] = {
          videoId: comment.videoId,
          videoTitle: comment.videoTitle,
          videoUrl: comment.videoUrl,
          channelTitle: comment.channelTitle,
          comments: [],
          totalLikes: 0,
          totalReplies: 0,
        };
      }
      
      acc[comment.videoId].comments.push(comment);
      acc[comment.videoId].totalLikes += comment.likeCount || 0;
      acc[comment.videoId].totalReplies += comment.replyCount || 0;
      
      return acc;
    }, {} as Record<string, any>);

    const topVideos = Object.values(videoGroups)
      .sort((a: any, b: any) => 
        (b.totalLikes + b.totalReplies) - (a.totalLikes + a.totalReplies)
      )
      .slice(0, 5)
      .map((group: any) => ({
        videoId: group.videoId,
        videoTitle: group.videoTitle,
        videoUrl: group.videoUrl,
        channelTitle: group.channelTitle,
        commentCount: group.comments.length,
        totalLikes: group.totalLikes,
        totalReplies: group.totalReplies,
        engagement: group.totalLikes + group.totalReplies,
      }));

    // Get recent comments
    const recentComments = comments
      .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
      .slice(0, 10)
      .map(comment => ({
        id: comment.id,
        videoId: comment.videoId,
        videoTitle: comment.videoTitle,
        videoUrl: comment.videoUrl,
        channelTitle: comment.channelTitle,
        text: comment.commentText,
        likes: comment.likeCount,
        replies: comment.replyCount,
        postedAt: new Date(comment.postedAt).toLocaleDateString(),
      }));

    return NextResponse.json({
      success: true,
      stats: {
        totalComments,
        totalLikes,
        totalReplies,
        engagementRate: parseFloat(engagementRate as string),
      },
      topVideos,
      recentComments,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
