"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  Eye,
  Calendar,
  BarChart3,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface AnalyticsData {
  stats: {
    totalComments: number;
    totalLikes: number;
    totalReplies: number;
    engagementRate: number;
  };
  topVideos: Array<{
    videoId: string;
    videoTitle: string;
    channelTitle: string;
    commentCount: number;
    totalLikes: number;
    totalReplies: number;
    engagement: number;
  }>;
  recentComments: Array<{
    id: string;
    videoId: string;
    videoTitle: string;
    videoUrl: string;
    channelTitle: string;
    text: string;
    likes: number;
    replies: number;
    postedAt: string;
  }>;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch analytics from database
      const response = await fetch('/api/analytics');
      const result = await response.json();
      
      if (result.success) {
        setData(result);
        toast.success('Analytics updated');
      } else {
        toast.error(result.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncEngagement = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/analytics/sync', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {

        toast.success(`Synced ${result.updatedComments.length} comments`);
        
        // Refresh analytics
        await fetchAnalytics();
      } else {
        toast.error(result.error || 'Failed to sync engagement');
      }
    } catch (error) {
      toast.error('Failed to sync engagement');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = data?.stats || {
    totalComments: 0,
    totalLikes: 0,
    totalReplies: 0,
    engagementRate: 0,
  };

  const recentComments = data?.recentComments || [];
  const topVideos = data?.topVideos || [];

  return (
    <div className="p-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Track your comment performance and engagement
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={syncEngagement} 
              disabled={isSyncing || isLoading}
              variant="outline"
              size="sm"
            >
              <TrendingUp className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Engagement'}
            </Button>
            <Button 
              onClick={fetchAnalytics} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        {stats.totalComments === 0 && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Start tracking your comments
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Analytics will appear here once you post comments through this app. 
                    Go to <Link href="/dashboard" className="underline font-medium">Home</Link> to generate and post your first comment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Comments
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <p className="text-xs text-muted-foreground">
                Comments posted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Likes
              </CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground">
                Likes received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Replies
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReplies}</div>
              <p className="text-xs text-muted-foreground">
                Replies received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Engagement Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.engagementRate.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Avg. engagement per comment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
            <CardDescription>
              Your latest posted comments and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-4">Loading comments...</p>
              </div>
            ) : recentComments.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No comments yet</h3>
                <p className="text-muted-foreground mt-2">
                  Post your first comment to see analytics here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link 
                          href={comment.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {comment.videoTitle}
                            <ExternalLink className="h-3 w-3" />
                          </Badge>
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {comment.channelTitle} • {comment.postedAt}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {comment.likes} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {comment.replies} replies
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Videos</CardTitle>
              <CardDescription>
                Videos with highest engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : topVideos.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No data available yet
                </div>
              ) : (
                <div className="space-y-3">
                  {topVideos.map((video, index) => (
                    <div key={video.videoId} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`https://www.youtube.com/watch?v=${video.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          <p className="text-sm font-medium line-clamp-1">{video.videoTitle}</p>
                        </Link>
                        <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span>{video.commentCount} comments</span>
                          <span>•</span>
                          <span>{video.totalLikes} likes</span>
                          <span>•</span>
                          <span>{video.totalReplies} replies</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comment Distribution</CardTitle>
              <CardDescription>
                Where you're most active
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : topVideos.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No data available yet
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Videos Commented</span>
                      <span className="font-semibold">{topVideos.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Avg. Comments Per Video</span>
                      <span className="font-semibold">
                        {(stats.totalComments / topVideos.length).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Avg. Engagement Per Video</span>
                      <span className="font-semibold">
                        {((stats.totalLikes + stats.totalReplies) / topVideos.length).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
