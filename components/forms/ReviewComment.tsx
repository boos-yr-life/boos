"use client";

import { useFormWizard } from '@/hooks/useFormWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VideoCard } from '@/components/forms/VideoCard';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { COMMENT_TEMPLATES } from '@/lib/templates';
import { savePostedComment } from '@/lib/storage';
import { useSession } from 'next-auth/react';

export function ReviewComment() {
  const { data, updateData, prevStep, reset } = useFormWizard();
  const { data: session } = useSession();
  const [isPosting, setIsPosting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [postedVideos, setPostedVideos] = useState<Set<string>>(new Set());
  
  const videos = data.selectedVideos || [];
  const currentVideo = videos[currentVideoIndex];
  const generatedComments = (data.generatedComment as any) || {};
  const [editedComments, setEditedComments] = useState<Record<string, string>>(generatedComments);
  
  const currentComment = editedComments[currentVideo?.id] || '';

  const handleRegenerate = async () => {
    if (!currentVideo) return;

    setIsRegenerating(true);
    try {
      const template = data.selectedTemplate 
        ? COMMENT_TEMPLATES.find((t: any) => t.id === data.selectedTemplate)?.template
        : undefined;

      // Use stored transcript if available
      const transcript = data.videoTranscripts?.[currentVideo.id] || null;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: currentVideo.title,
          videoDescription: currentVideo.description,
          channelTitle: currentVideo.channelTitle,
          template,
          sentiment: data.selectedSentiment,
          additionalContext: data.additionalContext,
          transcript,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEditedComments(prev => ({
          ...prev,
          [currentVideo.id]: result.comment
        }));
        toast.success('Comment regenerated');
      } else {
        toast.error(result.error || 'Failed to regenerate comment');
      }
    } catch (error) {
      toast.error('Failed to regenerate comment');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePost = async () => {
    if (!currentVideo || !currentComment) {
      toast.error('Missing video or comment');
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch('/api/youtube/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: currentVideo.id,
          commentText: currentComment,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save comment to database for analytics tracking
        if (session?.user?.id) {
          await savePostedComment(session.user.id, {
            videoId: currentVideo.id,
            videoTitle: currentVideo.title,
            videoUrl: `https://www.youtube.com/watch?v=${currentVideo.id}`,
            channelTitle: currentVideo.channelTitle,
            commentText: currentComment,
            sentiment: data.selectedSentiment || 'neutral',
            youtubeCommentId: result.commentId || '',
            likeCount: 0,
            replyCount: 0,
          });
        }

        setPostedVideos(prev => new Set([...prev, currentVideo.id]));
        toast.success(`Comment posted and tracked! (${postedVideos.size + 1}/${videos.length})`);
        
        // Move to next video or finish
        if (currentVideoIndex < videos.length - 1) {
          setCurrentVideoIndex(currentVideoIndex + 1);
        } else {
          toast.success('All comments posted successfully! 🎉');
          reset();
        }
      } else {
        toast.error(result.error || 'Failed to post comment');
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsPosting(false);
    }
  };
  
  const updateCurrentComment = (text: string) => {
    setEditedComments(prev => ({
      ...prev,
      [currentVideo?.id]: text
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Review & Post Comments</CardTitle>
        <CardDescription>
          {postedVideos.size} of {videos.length} comments posted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* All Videos in Scroll Format */}
        {videos.map((video, idx) => {
          const isPosted = postedVideos.has(video.id);
          const comment = editedComments[video.id] || generatedComments[video.id] || '';
          
          return (
            <div 
              key={video.id} 
              className={`p-4 border rounded-lg ${isPosted ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-card'}`}
            >
              {/* Video Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Video {idx + 1} of {videos.length}</span>
                    {isPosted && (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Posted
                      </span>
                    )}
                  </div>
                  <VideoCard video={video} selected={false} />
                </div>
              </div>

              {/* Comment Editor */}
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`comment-${video.id}`}>Your Comment</Label>
                  {!isPosted && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentVideoIndex(idx);
                        handleRegenerate();
                      }}
                      disabled={isRegenerating || isPosting}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating && currentVideoIndex === idx ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                  )}
                </div>
                <Textarea
                  id={`comment-${video.id}`}
                  value={comment}
                  onChange={(e) => {
                    setEditedComments(prev => ({
                      ...prev,
                      [video.id]: e.target.value
                    }));
                  }}
                  rows={4}
                  className="resize-none"
                  disabled={isPosted || isPosting}
                  placeholder="Comment will be generated..."
                />
                <p className="text-xs text-muted-foreground">
                  {comment.length} characters
                </p>
              </div>

              {/* Post Button */}
              {!isPosted && (
                <Button 
                  onClick={() => {
                    setCurrentVideoIndex(idx);
                    handlePost();
                  }}
                  disabled={isPosting || !comment.trim()}
                  className="w-full mt-3"
                  size="sm"
                >
                  {isPosting && currentVideoIndex === idx ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Post Comment
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}

        {/* Warning */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            ⚠️ Comments will be posted publicly on YouTube. Review carefully before posting.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={isPosting}
            className="flex-1"
          >
            Back
          </Button>
          {postedVideos.size === videos.length && (
            <Button 
              onClick={reset}
              className="flex-1"
            >
              Start New Batch
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
