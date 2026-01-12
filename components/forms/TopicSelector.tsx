"use client";

import { useFormWizard } from '@/hooks/useFormWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VIDEO_TOPICS } from '@/lib/templates';
import { useState } from 'react';
import { Search, Link2, Zap } from 'lucide-react';
import { VideoCard } from '@/components/forms/VideoCard';
import { toast } from 'sonner';
import { SentimentType } from '@/types';

export function TopicSelector() {
  const { data, updateData, nextStep } = useFormWizard();
  const [selectedTopicType, setSelectedTopicType] = useState<string>('dropdown');
  const [customTopic, setCustomTopic] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleTopicSelect = (value: string) => {
    if (value === 'custom') {
      setSelectedTopicType('custom');
    } else {
      updateData({ selectedTopic: value });
      setSelectedTopicType('dropdown');
    }
  };

  const handleSearch = async () => {
    const query = selectedTopicType === 'custom' ? customTopic : data.selectedTopic;
    
    if (!query) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/youtube/search?query=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (response.ok) {
        setSearchResults(result.videos);
        if (result.videos.length === 0) {
          toast.info('No videos found. Try a different topic.');
        }
      } else {
        toast.error(result.error || 'Failed to search videos');
      }
    } catch (error) {
      toast.error('Failed to search videos');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!videoUrl) {
      toast.error('Please enter a video URL');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/youtube/video?url=${encodeURIComponent(videoUrl)}`);
      const result = await response.json();
      
      if (response.ok) {
        const currentVideos = data.selectedVideos || [];
        const isAlreadySelected = currentVideos.some(v => v.id === result.video.id);
        
        if (isAlreadySelected) {
          toast.info('Video already selected');
        } else {
          updateData({ selectedVideos: [...currentVideos, result.video], videoUrl });
          toast.success('Video added to selection');
          setVideoUrl(''); // Clear input
        }
      } else {
        toast.error(result.error || 'Failed to load video');
      }
    } catch (error) {
      toast.error('Failed to load video');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVideoSelect = (video: any) => {
    const currentVideos = data.selectedVideos || [];
    const isAlreadySelected = currentVideos.some(v => v.id === video.id);
    
    if (isAlreadySelected) {
      // Remove video if already selected
      const updatedVideos = currentVideos.filter(v => v.id !== video.id);
      const updatedSentiments = { ...(data.videoSentiments || {}) };
      delete updatedSentiments[video.id];
      updateData({ 
        selectedVideos: updatedVideos,
        videoSentiments: updatedSentiments
      });
      toast.info('Video removed from selection');
    } else {
      // Add video to selection with default sentiment
      const updatedSentiments = {
        ...(data.videoSentiments || {}),
        [video.id]: 'positive' as SentimentType
      };
      updateData({ 
        selectedVideos: [...currentVideos, video],
        videoSentiments: updatedSentiments
      });
      toast.success(`Video added (${currentVideos.length + 1} selected)`);
    }
  };

  const handleContinue = () => {
    if (!data.selectedVideos || data.selectedVideos.length === 0) {
      toast.error('Please select at least one video');
      return;
    }
    nextStep();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Choose Video Topic</CardTitle>
        <CardDescription>
          Select a topic category, enter a custom topic, or paste a video URL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topic Selection Method */}
        <div className="space-y-2">
          <Label>Selection Method</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={selectedTopicType === 'dropdown' ? 'default' : 'outline'}
              onClick={() => setSelectedTopicType('dropdown')}
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              Browse Topics
            </Button>
            <Button
              type="button"
              variant={selectedTopicType === 'custom' ? 'default' : 'outline'}
              onClick={() => setSelectedTopicType('custom')}
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              Custom Search
            </Button>
            <Button
              type="button"
              variant={selectedTopicType === 'url' ? 'default' : 'outline'}
              onClick={() => setSelectedTopicType('url')}
              className="flex-1"
            >
              <Link2 className="mr-2 h-4 w-4" />
              Paste URL
            </Button>
          </div>
        </div>

        {/* Dropdown Topic Selection */}
        {selectedTopicType === 'dropdown' && (
          <div className="space-y-2">
            <Label>Topic Category</Label>
            <Select onValueChange={handleTopicSelect} value={data.selectedTopic || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic..." />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_TOPICS.map((topic) => (
                  <SelectItem key={topic.value} value={topic.value}>
                    {topic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {data.selectedTopic && data.selectedTopic !== 'custom' && (
              <Button onClick={handleSearch} disabled={isSearching} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? 'Searching...' : 'Search Videos'}
              </Button>
            )}
          </div>
        )}

        {/* Custom Topic Input */}
        {selectedTopicType === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="customTopic">Custom Topic</Label>
            <Input
              id="customTopic"
              placeholder="e.g., Next.js tutorial for beginners"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching || !customTopic} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              {isSearching ? 'Searching...' : 'Search Videos'}
            </Button>
          </div>
        )}

        {/* URL Input */}
        {selectedTopicType === 'url' && (
          <div className="space-y-2">
            <Label htmlFor="videoUrl">YouTube Video URL</Label>
            <Input
              id="videoUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <Button onClick={handleUrlSubmit} disabled={isSearching || !videoUrl} className="w-full">
              <Link2 className="mr-2 h-4 w-4" />
              {isSearching ? 'Loading...' : 'Load Video'}
            </Button>
          </div>
        )}

        {/* Selected Videos Display with Sentiment Selection */}
        {data.selectedVideos && data.selectedVideos.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <Label>Selected Videos ({data.selectedVideos.length})</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateData({ selectedVideos: [] })}
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.selectedVideos.map((video) => {
                const videoSentiment = data.videoSentiments?.[video.id] || 'positive';
                return (
                  <div key={video.id} className="space-y-2 p-3 border rounded-lg">
                    <VideoCard
                      video={video}
                      selected
                      onSelect={() => handleVideoSelect(video)}
                    />
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quick Sentiment:</Label>
                      <Select 
                        value={videoSentiment}
                        onValueChange={(value: SentimentType) => {
                          updateData({
                            videoSentiments: {
                              ...(data.videoSentiments || {}),
                              [video.id]: value
                            }
                          });
                        }}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">✨ Positive - Encouraging & appreciative</SelectItem>
                          <SelectItem value="enthusiastic">🔥 Enthusiastic - Excited & energetic</SelectItem>
                          <SelectItem value="neutral">💬 Neutral - Balanced & professional</SelectItem>
                          <SelectItem value="constructive">💡 Constructive - Helpful feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <Label>Search Results (Click to select)</Label>
            {searchResults.map((video) => {
              const isSelected = data.selectedVideos?.some(v => v.id === video.id);
              return (
                <VideoCard
                  key={video.id}
                  video={video}
                  onSelect={() => handleVideoSelect(video)}
                  selected={isSelected}
                />
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="pt-4 border-t space-y-2">
          <Button 
            onClick={() => {
              if (!data.selectedVideos || data.selectedVideos.length === 0) {
                toast.error('Please select at least one video');
                return;
              }
              // Set quick mode flag and skip to generation
              updateData({ selectedTemplate: 'quick' });
              nextStep();
            }} 
            disabled={!data.selectedVideos || data.selectedVideos.length === 0} 
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            Quick Generate ({data.selectedVideos?.length || 0} video{data.selectedVideos?.length !== 1 ? 's' : ''})
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!data.selectedVideos || data.selectedVideos.length === 0} 
            variant="outline"
            className="w-full"
          >
            Customize Comments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
