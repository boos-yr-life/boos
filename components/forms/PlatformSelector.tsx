"use client";

import { useFormWizard } from '@/hooks/useFormWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Instagram, Facebook } from 'lucide-react';
import { Platform } from '@/types';

const platforms = [
  {
    id: 'youtube' as Platform,
    name: 'YouTube',
    description: 'Comment on videos',
    icon: Youtube,
    color: 'text-red-600',
  },
  {
    id: 'instagram' as Platform,
    name: 'Instagram',
    description: 'Comment on posts and reels',
    icon: Instagram,
    color: 'text-pink-600',
  },
  {
    id: 'facebook' as Platform,
    name: 'Facebook',
    description: 'Comment on posts and pages',
    icon: Facebook,
    color: 'text-blue-600',
  },
];

export function PlatformSelector() {
  const { data, updateData, nextStep } = useFormWizard();

  const handlePlatformSelect = (platform: Platform) => {
    updateData({ selectedPlatform: platform });
    nextStep();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Platform</CardTitle>
        <CardDescription>
          Choose which social media platform you'd like to comment on
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <Button
                key={platform.id}
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => handlePlatformSelect(platform.id)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${platform.color}`} />
                  <div className="text-left">
                    <div className="font-medium">{platform.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {platform.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}