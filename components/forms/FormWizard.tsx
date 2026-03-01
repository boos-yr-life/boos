"use client";

import { useFormWizard } from '@/hooks/useFormWizard';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { PlatformSelector } from './PlatformSelector';
import { ConnectYouTube } from './ConnectYouTube';
import { ConnectInstagram } from './ConnectInstagram';
import { ConnectFacebook } from './ConnectFacebook';
import { ContentSelector } from './ContentSelector';
import { DefineComment } from './DefineComment';
import { ReviewComment } from './ReviewComment';

const STEP_TITLES = [
  'Select Platform',
  'Connect Account',
  'Select Content',
  'Define Comment',
  'Review & Post',
];

export function FormWizard() {
  const { step, data } = useFormWizard();
  const progress = (step / 5) * 100;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <PlatformSelector />;
      case 2:
        switch (data.selectedPlatform) {
          case 'youtube':
            return <ConnectYouTube />;
          case 'instagram':
            return <ConnectInstagram />;
          case 'facebook':
            return <ConnectFacebook />;
          default:
            return <PlatformSelector />;
        }
      case 3:
        return <ContentSelector />;
      case 4:
        return <DefineComment />;
      case 5:
        return <ReviewComment />;
      default:
        return <PlatformSelector />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Step {step} of 5</span>
            <span className="text-muted-foreground">{STEP_TITLES[step - 1]}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>
    </div>
  );
}
