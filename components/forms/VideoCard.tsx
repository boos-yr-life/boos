"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { YouTubeVideo } from '@/types';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface VideoCardProps {
  video: YouTubeVideo;
  onSelect?: () => void;
  selected?: boolean;
}

export function VideoCard({ video, onSelect, selected }: VideoCardProps) {
  return (
    <Card 
      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex gap-3">
        <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover"
              sizes="128px"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 mb-1">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">
            {video.channelTitle}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {video.viewCount && (
              <Badge variant="secondary" className="text-xs">
                {parseInt(video.viewCount).toLocaleString()} views
              </Badge>
            )}
            {selected && (
              <Badge className="text-xs bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
