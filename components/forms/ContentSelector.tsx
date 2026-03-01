"use client";

import { useFormWizard } from '@/hooks/useFormWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VIDEO_TOPICS } from '@/lib/templates';
import { useState } from 'react';
import { Search, Link2, Zap } from 'lucide-react';
import { VideoCard } from '@/components/forms/VideoCard';
import { toast } from 'sonner';
import { SentimentType, Platform } from '@/types';

export function ContentSelector() {
  const { data, updateData, nextStep } = useFormWizard();
  const [selectedMethod, setSelectedMethod] = useState<string>('search');
  const [customQuery, setCustomQuery] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const getPlatformName = () => {
    switch (data.selectedPlatform) {
      case 'youtube': return 'YouTube';
      case 'instagram': return 'Instagram';
      case 'facebook': return 'Facebook';
      default: return 'Platform';
    }
  };

  const getContentType = () => {
    switch (data.selectedPlatform) {
      case 'youtube': return 'videos';
      case 'instagram': return 'posts';
      case 'facebook': return 'posts';
      default: return 'content';
    }
  };

  const getApiEndpoint = () => {
    switch (data.selectedPlatform) {
      case 'youtube': return '/api/youtube/search';
      case 'instagram': return '/api/instagram/search';
      case 'facebook': return '/api/facebook/search';
      default: return '';
    }
  };

  const getVideoEndpoint = () => {
    switch (data.selectedPlatform) {
      case 'youtube': return '/api/youtube/video';
      case 'instagram': return '/api/instagram/post';
      case 'facebook': return '/api/facebook/post';
      default: return '';
    }
  };

  const handleSearch = async () => {
    const query = selectedMethod === 'custom' ? customQuery : data.selectedTopic;

    if (!query) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      const endpoint = getApiEndpoint();
      const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}`);
      const result = await response.json();

      if (response.ok) {
        setSearchResults(result.content || result.videos || []);
        if ((result.content || result.videos || []).length === 0) {
          toast.info(`No ${getContentType()} found. Try a different search.`);
        }
      } else {
        toast.error(result.error || `Failed to search ${getContentType()}`);
      }
    } catch (error) {
      toast.error(`Failed to search ${getContentType()}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!contentUrl) {
      toast.error(`Please enter a ${getContentType().slice(0, -1)} URL`);
      return;
    }

    setIsSearching(true);
    try {
      const endpoint = getVideoEndpoint();
      const response = await fetch(`${endpoint}?url=${encodeURIComponent(contentUrl)}`);
      const result = await response.json();

      if (response.ok) {
        const content = result.content || result.video || result.post;
        updateData({
          selectedVideo: content,
          selectedVideos: [content],
          videoSentiments: { [content.id]: 'positive' as SentimentType },
          [data.selectedPlatform === 'youtube' ? 'videoUrl' :
           data.selectedPlatform === 'instagram' ? 'instagramPostUrl' :
           'facebookPostUrl']: contentUrl
        });
        toast.success(`${getContentType().slice(0, -1)} loaded successfully`);
        setContentUrl('');
      } else {
        toast.error(result.error || `Failed to load ${getContentType().slice(0, -1)}`);
      }
    } catch (error) {
      toast.error(`Failed to load ${getContentType().slice(0, -1)}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleContentSelect = (content: any) => {
    const currentVideos = data.selectedVideos || [];
    const isAlreadySelected = currentVideos.some(v => v.id === content.id);

    if (isAlreadySelected) {
      // Remove content if already selected
      const updatedVideos = currentVideos.filter(v => v.id !== content.id);
      const updatedSentiments = { ...(data.videoSentiments || {}) };
      delete updatedSentiments[content.id];
      updateData({
        selectedVideos: updatedVideos,
        videoSentiments: updatedSentiments
      });
      toast.info(`${getContentType().slice(0, -1)} removed from selection`);
    } else {
      // Add content to selection with default sentiment
      const updatedSentiments = {
        ...(data.videoSentiments || {}),
        [content.id]: 'positive' as SentimentType
      };
      updateData({
        selectedVideos: [...currentVideos, content],
        videoSentiments: updatedSentiments
      });
      toast.success(`${getContentType().slice(0, -1)} added (${currentVideos.length + 1} selected)`);
    }
  };

  const handleContinue = () => {
    if (!data.selectedVideos || data.selectedVideos.length === 0) {
      toast.error(`Please select at least one ${getContentType().slice(0, -1)}`);
      return;
    }
    nextStep();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Choose {getPlatformName()} Content</CardTitle>
        <CardDescription>
          Select a topic category, enter a custom search, or paste a content URL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Method */}
        <div className="space-y-2">
          <Label>Selection Method</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={selectedMethod === 'topic' ? 'default' : 'outline'}
              onClick={() => setSelectedMethod('topic')}
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              Browse Topics
            </Button>
            <Button
              type="button"
              variant={selectedMethod === 'custom' ? 'default' : 'outline'}
              onClick={() => setSelectedMethod('custom')}
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              Custom Search
            </Button>
            <Button
              type="button"
              variant={selectedMethod === 'url' ? 'default' : 'outline'}
              onClick={() => setSelectedMethod('url')}
              className="flex-1"
            >
              <Link2 className="mr-2 h-4 w-4" />
              Paste URL
            </Button>
          </div>
        </div>

        {/* Topic Selection */}
        {selectedMethod === 'topic' && (
          <div className="space-y-2">
            <Label>Topic Category</Label>
            <select
              className="w-full p-2 border rounded"
              onChange={(e) => updateData({ selectedTopic: e.target.value })}
              value={data.selectedTopic || ''}
            >
              <option value="">Select a topic...</option>
              {VIDEO_TOPICS.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
            {data.selectedTopic && (
              <Button onClick={handleSearch} disabled={isSearching} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? 'Searching...' : `Search ${getContentType()}`}
              </Button>
            )}
          </div>
        )}

        {/* Custom Search Input */}
        {selectedMethod === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="customQuery">Custom Search</Label>
            <Input
              id="customQuery"
              placeholder={`e.g., ${data.selectedPlatform === 'youtube' ? 'Next.js tutorial' : 'travel photography'}`}
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching || !customQuery} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              {isSearching ? 'Searching...' : `Search ${getContentType()}`}
            </Button>
          </div>
        )}

        {/* URL Input */}
        {selectedMethod === 'url' && (
          <div className="space-y-2">
            <Label htmlFor="contentUrl">{getPlatformName()} {getContentType().slice(0, -1)} URL</Label>
            <Input
              id="contentUrl"
              placeholder={`https://${data.selectedPlatform}.com/...`}
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <Button onClick={handleUrlSubmit} disabled={isSearching || !contentUrl} className="w-full">
              <Link2 className="mr-2 h-4 w-4" />
              {isSearching ? 'Loading...' : `Load ${getContentType().slice(0, -1)}`}
            </Button>
          </div>
        )}

        {/* Selected Content Display */}
        {data.selectedVideos && data.selectedVideos.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <Label>Selected {getContentType()} ({data.selectedVideos.length})</Label>
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
              {data.selectedVideos.map((content) => {
                const contentSentiment = data.videoSentiments?.[content.id] || 'positive';
                return (
                  <div key={content.id} className="space-y-2 p-3 border rounded-lg">
                    <VideoCard
                      video={content}
                      selected
                      onSelect={() => handleContentSelect(content)}
                    />
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quick Sentiment:</Label>
                      <select
                        className="w-full p-2 border rounded text-sm"
                        value={contentSentiment}
                        onChange={(e) => {
                          updateData({
                            videoSentiments: {
                              ...(data.videoSentiments || {}),
                              [content.id]: e.target.value as SentimentType
                            }
                          });
                        }}
                      >
                        <option value="positive">✨ Positive - Encouraging & appreciative</option>
                        <option value="enthusiastic">🔥 Enthusiastic - Excited & energetic</option>
                        <option value="neutral">💬 Neutral - Balanced & professional</option>
                        <option value="constructive">💡 Constructive - Helpful feedback</option>
                      </select>
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
            {searchResults.map((content) => {
              const isSelected = data.selectedVideos?.some(v => v.id === content.id);
              return (
                <VideoCard
                  key={content.id}
                  video={content}
                  onSelect={() => handleContentSelect(content)}
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
                toast.error(`Please select at least one ${getContentType().slice(0, -1)}`);
                return;
              }
              updateData({ selectedTemplate: 'quick' });
              nextStep();
            }}
            disabled={!data.selectedVideos || data.selectedVideos.length === 0}
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            Quick Generate ({data.selectedVideos?.length || 0} {getContentType().slice(0, -1)}{data.selectedVideos?.length !== 1 ? 's' : ''})
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