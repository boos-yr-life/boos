import { CommentTemplate, SentimentType } from '@/types';

export const COMMENT_TEMPLATES: CommentTemplate[] = [
  {
    id: 'thoughtful-question',
    name: 'Thoughtful Question',
    description: 'Ask an insightful question that encourages discussion',
    template: 'This is really interesting! I\'m curious about [specific aspect]. Could you elaborate on how [related topic] plays into this?',
  },
  {
    id: 'expert-insight',
    name: 'Expert Insight',
    description: 'Share your expertise or additional perspective',
    template: 'Great content! I\'ve been working with [related field] for a while, and I\'ve found that [your insight]. This aligns well with what you mentioned about [video topic].',
  },
  {
    id: 'supportive-feedback',
    name: 'Supportive Feedback',
    description: 'Provide encouraging and constructive feedback',
    template: 'This was really helpful! I especially appreciated [specific part]. One thing that could make this even better is [constructive suggestion].',
  },
  {
    id: 'critical-analysis',
    name: 'Critical Analysis',
    description: 'Offer a balanced, analytical perspective',
    template: 'Interesting perspective on [topic]. While I agree with [point of agreement], I think it\'s worth considering [alternative viewpoint] because [reasoning].',
  },
];

export const SENTIMENTS: { value: SentimentType; label: string; description: string }[] = [
  {
    value: 'positive',
    label: 'Positive',
    description: 'Encouraging and appreciative tone',
  },
  {
    value: 'neutral',
    label: 'Neutral',
    description: 'Balanced and informative tone',
  },
  {
    value: 'constructive',
    label: 'Constructive',
    description: 'Helpful feedback with suggestions',
  },
  {
    value: 'enthusiastic',
    label: 'Enthusiastic',
    description: 'Excited and engaged tone',
  },
];

export const VIDEO_TOPICS = [
  { value: 'technology', label: 'Technology' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'education', label: 'Education' },
  { value: 'music', label: 'Music' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'sports', label: 'Sports' },
  { value: 'science', label: 'Science' },
  { value: 'cooking', label: 'Cooking & Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'fitness', label: 'Fitness & Health' },
  { value: 'art', label: 'Art & Design' },
  { value: 'news', label: 'News & Politics' },
  { value: 'custom', label: 'Custom Topic...' },
];
