"use client";

import { useFormWizard } from '@/hooks/useFormWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COMMENT_TEMPLATES, SENTIMENTS } from '@/lib/templates';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function DefineComment() {
  const { data, updateData, nextStep, prevStep } = useFormWizard();
  const [useTemplate, setUseTemplate] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const hasStartedGenerationRef = useRef(false);
  
  const videos = data.selectedVideos || [];
  const currentVideo = videos[currentVideoIndex];
  const isQuickMode = data.selectedTemplate === 'quick';

  // Auto-generate all comments in quick mode
  useEffect(() => {
    if (isQuickMode && videos.length > 0 && !isGenerating && !hasStartedGenerationRef.current) {
      const comments = data.generatedComment as { [key: string]: string } | undefined;
      const hasGeneratedComments = videos.every(video => comments?.[video.id]);
      
      if (!hasGeneratedComments) {
        hasStartedGenerationRef.current = true;
        generateAllComments();
      }
    }
  }, [isQuickMode, videos.length]);

  const generateAllComments = async () => {
    setIsGenerating(true);
    
    try {
      // Generate all comments in parallel
      const generatePromises = videos.map(async (video, index) => {
        const sentiment = data.videoSentiments?.[video.id] || 'positive';
        
        try {
          // Fetch transcript
          let transcript: string | null = null;
          try {
            const transcriptResponse = await fetch(
              `/api/youtube/video?url=https://www.youtube.com/watch?v=${video.id}`
            );
            const transcriptData = await transcriptResponse.json();
            transcript = transcriptData.transcript || null;
          } catch (err) {
            console.log('Could not fetch transcript, using metadata only');
          }

          // Generate comment
          const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoTitle: video.title,
              videoDescription: video.description,
              channelTitle: video.channelTitle,
              sentiment: sentiment,
              transcript,
            }),
          });

          const result = await response.json();

          if (result.success) {
            // Update progress
            setCurrentVideoIndex(index);
            return { videoId: video.id, comment: result.comment, transcript, success: true };
          } else {
            return { videoId: video.id, error: result.error, success: false };
          }
        } catch (error) {
          console.error('Error generating comment:', error);
          return { videoId: video.id, error: 'Failed to generate', success: false };
        }
      });

      // Wait for all generations to complete
      const results = await Promise.all(generatePromises);
      
      console.log('All parallel generations completed:', results);
      
      // Process all results
      const generatedComments: { [key: string]: string } = {};
      const updatedTranscripts: { [key: string]: string | null } = { ...(data.videoTranscripts || {}) };
      let successCount = 0;
      
      results.forEach((result) => {
        if (result.success && result.comment) {
          generatedComments[result.videoId] = result.comment;
          if (result.transcript) {
            updatedTranscripts[result.videoId] = result.transcript;
          }
          successCount++;
        }
      });
      
      // Update all data at once
      updateData({ 
        generatedComment: generatedComments,
        videoTranscripts: updatedTranscripts
      });
      
      if (successCount === videos.length) {
        toast.success(`All ${videos.length} comments generated successfully!`);
      } else {
        toast.warning(`${successCount}/${videos.length} comments generated`);
      }
      
      setIsGenerating(false);
      
      // Auto-advance to next step after state updates
      setTimeout(() => {
        nextStep();
      }, 800);
    } catch (error) {
      console.error('Error in parallel generation:', error);
      toast.error('Failed to generate comments');
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!currentVideo) {
      toast.error('No video selected');
      return;
    }

    // In quick mode, use per-video sentiment
    const sentiment = isQuickMode 
      ? data.videoSentiments?.[currentVideo.id] || 'positive'
      : data.selectedSentiment;

    if (!isQuickMode) {
      if (useTemplate && !data.selectedTemplate) {
        toast.error('Please select a template');
        return;
      }

      if (!useTemplate && !sentiment) {
        toast.error('Please select a sentiment');
        return;
      }
    }

    setIsGenerating(true);
    try {
      const template = data.selectedTemplate && data.selectedTemplate !== 'quick'
        ? COMMENT_TEMPLATES.find(t => t.id === data.selectedTemplate)?.template
        : undefined;

      // First, try to fetch transcript for better context
      let transcript: string | null = null;
      try {
        const transcriptResponse = await fetch(
          `/api/youtube/video?url=https://www.youtube.com/watch?v=${currentVideo.id}`
        );
        const transcriptData = await transcriptResponse.json();
        transcript = transcriptData.transcript || null;
        
        // Store transcript for potential re-generation
        if (transcript) {
          const updatedTranscripts = {
            ...(data.videoTranscripts || {}),
            [currentVideo.id]: transcript,
          };
          updateData({ videoTranscripts: updatedTranscripts });
        }
      } catch (err) {
        console.log('Could not fetch transcript, using metadata only');
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: currentVideo.title,
          videoDescription: currentVideo.description,
          channelTitle: currentVideo.channelTitle,
          template,
          sentiment: sentiment,
          additionalContext: data.additionalContext,
          transcript,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store comment for this specific video
        const generatedComments = (typeof data.generatedComment === 'object' && data.generatedComment !== null)
          ? { ...(data.generatedComment as { [key: string]: string }) }
          : {};
        generatedComments[currentVideo.id] = result.comment;
        updateData({ generatedComment: generatedComments });
        toast.success(`Comment generated for video ${currentVideoIndex + 1}/${videos.length}`);
        
        // Move to next video or finish
        if (currentVideoIndex < videos.length - 1) {
          setCurrentVideoIndex(currentVideoIndex + 1);
        } else {
          nextStep();
        }
      } else {
        toast.error(result.error || 'Failed to generate comment');
      }
    } catch (error) {
      toast.error('Failed to generate comment');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isQuickMode ? 'Quick Generate' : 'Define Your Comment'}</CardTitle>
        <CardDescription>
          {isQuickMode 
            ? 'Generating comments with your selected sentiments'
            : 'Choose a template or describe the sentiment you want'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isQuickMode ? (
          <>
            {/* Quick Mode Progress */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Generating all {videos.length} comments simultaneously
                  </span>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
                <Progress value={isGenerating ? 50 : 100} className="h-2" />
              </div>

              <div className="grid grid-cols-1 gap-2">
                {videos.map((video) => (
                  <div key={video.id} className="p-3 border rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium line-clamp-1 flex-1">
                        {video.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-md ml-2">
                        {data.videoSentiments?.[video.id] || 'positive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-center text-muted-foreground">
                All comments are being generated at the same time for faster results
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Method Selection */}
            <div className="space-y-2">
              <Label>Comment Style</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={useTemplate ? 'default' : 'outline'}
                  onClick={() => setUseTemplate(true)}
                  className="flex-1"
                >
                  Use Template
                </Button>
                <Button
                  type="button"
                  variant={!useTemplate ? 'default' : 'outline'}
                  onClick={() => setUseTemplate(false)}
                  className="flex-1"
                >
                  Choose Sentiment
                </Button>
              </div>
            </div>

            {/* Template Selection */}
            {useTemplate && (
          <div className="space-y-2">
            <Label>Comment Template</Label>
            <Select
              value={data.selectedTemplate || ''}
              onValueChange={(value) => updateData({ selectedTemplate: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {COMMENT_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {template.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sentiment Selection */}
        {!useTemplate && (
          <div className="space-y-2">
            <Label>Comment Sentiment</Label>
            <Select
              value={data.selectedSentiment || ''}
              onValueChange={(value: any) => updateData({ selectedSentiment: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sentiment..." />
              </SelectTrigger>
              <SelectContent>
                {SENTIMENTS.map((sentiment) => (
                  <SelectItem key={sentiment.value} value={sentiment.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{sentiment.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {sentiment.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Additional Context */}
        <div className="space-y-2">
          <Label htmlFor="context">Additional Context (Optional)</Label>
          <Textarea
            id="context"
            placeholder="Any specific points you want to mention or questions to ask..."
            value={data.additionalContext || ''}
            onChange={(e) => updateData({ additionalContext: e.target.value })}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Add specific details to personalize your comment
          </p>
        </div>
          </>
        )}

        {/* Selected Video Info - Only show in customize mode */}
        {!isQuickMode && currentVideo && (
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                Video {currentVideoIndex + 1} of {videos.length}
              </p>
              {currentVideoIndex > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentVideoIndex(currentVideoIndex - 1)}
                >
                  Previous Video
                </Button>
              )}
            </div>
            <p className="line-clamp-2">{currentVideo.title}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            className="flex-1"
            disabled={isQuickMode && isGenerating}
          >
            Back
          </Button>
          {!isQuickMode && (
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || (useTemplate ? !data.selectedTemplate : !data.selectedSentiment)}
              className="flex-1"
            >
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGenerating ? 'Generating...' : 'Generate Comment'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
