"use client";

import { useFormWizard } from '@/hooks/useFormWizard';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { TopicSelector } from './TopicSelector';
import { DefineComment } from './DefineComment';
import { ReviewComment } from './ReviewComment';

const STEP_TITLES = [
  'Select Topic',
  'Define Comment',
  'Review & Post',
];

export function FormWizard() {
  const { step } = useFormWizard();
  const progress = (step / 3) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Step {step} of 3</span>
            <span className="text-muted-foreground">{STEP_TITLES[step - 1]}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {step === 1 && <TopicSelector />}
        {step === 2 && <DefineComment />}
        {step === 3 && <ReviewComment />}
      </div>
    </div>
  );
}
