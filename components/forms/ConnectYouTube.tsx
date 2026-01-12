"use client";

import { useFormWizard } from '@/hooks/useFormWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import { CheckCircle2, Youtube } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ConnectYouTube() {
  const { data, updateData, nextStep } = useFormWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [channelInfo, setChannelInfo] = useState<any>(null);

  useEffect(() => {
    // Check if already connected
    if (data.youtubeConnected) {
      fetchChannelInfo();
    }
  }, [data.youtubeConnected]);

  const fetchChannelInfo = async () => {
    try {
      const response = await fetch('/api/youtube/channel');
      if (response.ok) {
        const { channelInfo } = await response.json();
        setChannelInfo(channelInfo);
        updateData({ 
          youtubeConnected: true,
          channelInfo,
        });
      }
    } catch (error) {
      console.error('Error fetching channel info:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleContinue = () => {
    if (data.youtubeConnected) {
      nextStep();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-6 w-6 text-red-600" />
          Connect Your YouTube Account
        </CardTitle>
        <CardDescription>
          Authorize access to post comments on your behalf
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data.youtubeConnected ? (
          <>
            <p className="text-sm text-muted-foreground">
              We'll need permission to access your YouTube account to search for videos and post comments. 
              Your credentials are never stored and all access is handled securely through Google OAuth.
            </p>
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              <Youtube className="mr-2 h-5 w-5" />
              Connect YouTube Account
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Connected Successfully
                </p>
                {channelInfo && (
                  <p className="text-sm text-green-700 dark:text-green-300 truncate">
                    {channelInfo.title}
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={handleContinue}
              className="w-full"
              size="lg"
            >
              Continue to Topic Selection
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
