"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <Youtube className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl">YouTube Comment Bot</CardTitle>
          <CardDescription className="text-base">
            Automate YouTube comments with AI-powered responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Connect your YouTube account securely</p>
            <p>✓ Search videos by topic or paste URLs</p>
            <p>✓ Generate personalized comments with AI</p>
            <p>✓ Review and post comments automatically</p>
          </div>
          <Button 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full"
            size="lg"
          >
            <Youtube className="mr-2 h-5 w-5" />
            Get Started with YouTube
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to authorize access to your YouTube account
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
