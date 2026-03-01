"use client";

import { useFormWizard } from '@/hooks/useFormWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import { CheckCircle2, Facebook } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ConnectFacebook() {
  const { data, updateData, nextStep } = useFormWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState<any>(null);

  useEffect(() => {
    // Check if already connected
    if (data.facebookConnected) {
      fetchPageInfo();
    }
  }, [data.facebookConnected]);

  const fetchPageInfo = async () => {
    try {
      const response = await fetch('/api/facebook/pages');
      if (response.ok) {
        const { pages } = await response.json();
        // For now, just use the first page
        const firstPage = pages[0];
        if (firstPage) {
          setPageInfo(firstPage);
          updateData({
            facebookConnected: true,
            facebookPage: firstPage,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching page info:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    // For Facebook, we'll use Facebook OAuth
    window.location.href = '/api/auth/facebook';
  };

  const handleContinue = () => {
    if (data.facebookConnected) {
      nextStep();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-6 w-6 text-blue-600" />
          Connect Your Facebook Page
        </CardTitle>
        <CardDescription>
          Authorize access to post comments on your Facebook page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data.facebookConnected ? (
          <>
            <p className="text-sm text-muted-foreground">
              We'll need permission to access your Facebook pages to search for posts and post comments.
              Your credentials are never stored and all access is handled securely through Facebook OAuth.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              <Facebook className="mr-2 h-5 w-5" />
              Connect Facebook Page
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
                {pageInfo && (
                  <p className="text-sm text-green-700 dark:text-green-300 truncate">
                    {pageInfo.name}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleContinue}
              className="w-full"
              size="lg"
            >
              Continue to Content Selection
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}