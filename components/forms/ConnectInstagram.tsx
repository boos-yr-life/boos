"use client";

import { useFormWizard } from '@/hooks/useFormWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import { CheckCircle2, Instagram } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ConnectInstagram() {
  const { data, updateData, nextStep } = useFormWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  useEffect(() => {
    // Check if already connected
    if (data.instagramConnected) {
      fetchAccountInfo();
    }
  }, [data.instagramConnected]);

  const fetchAccountInfo = async () => {
    try {
      const response = await fetch('/api/instagram/account');
      if (response.ok) {
        const { accountInfo } = await response.json();
        setAccountInfo(accountInfo);
        updateData({
          instagramConnected: true,
          instagramAccount: accountInfo,
        });
      }
    } catch (error) {
      console.error('Error fetching account info:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    // For Instagram, we'll use a different OAuth flow
    // This would typically redirect to Instagram's OAuth
    window.location.href = '/api/auth/instagram';
  };

  const handleContinue = () => {
    if (data.instagramConnected) {
      nextStep();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-6 w-6 text-pink-600" />
          Connect Your Instagram Account
        </CardTitle>
        <CardDescription>
          Authorize access to post comments on your behalf
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data.instagramConnected ? (
          <>
            <p className="text-sm text-muted-foreground">
              We'll need permission to access your Instagram account to search for posts and post comments.
              Your credentials are never stored and all access is handled securely through Instagram OAuth.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Connect Instagram Account
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
                {accountInfo && (
                  <p className="text-sm text-green-700 dark:text-green-300 truncate">
                    @{accountInfo.username}
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