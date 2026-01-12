export interface YouTubeChannel {
  id: string;
  title: string;
  thumbnailUrl?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl: string;
  viewCount?: string;
  publishedAt: string;
}

export interface CommentTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

export type SentimentType = 'positive' | 'neutral' | 'constructive' | 'enthusiastic';

export interface WizardData {
  // Step 1: YouTube Connection
  youtubeConnected: boolean;
  channelInfo?: YouTubeChannel;
  
  // Step 2: Topic Selection
  selectedTopic?: string;
  customTopic?: string;
  videoUrl?: string;
  selectedVideo?: YouTubeVideo;
  selectedVideos?: YouTubeVideo[]; // Multiple videos
  videoSentiments?: { [videoId: string]: SentimentType }; // Sentiment per video (quick mode)
  
  // Step 3: Comment Definition
  selectedTemplate?: string;
  customTemplate?: string;
  selectedSentiment?: SentimentType;
  additionalContext?: string;
  
  // Step 4: AI Generated Comment
  generatedComment?: string | { [videoId: string]: string };
  isConfirmed?: boolean;
  videoTranscripts?: { [videoId: string]: string | null }; // Store transcripts per video
}

export interface WizardState {
  step: number;
  data: WizardData;
  setStep: (step: number) => void;
  updateData: (data: Partial<WizardData>) => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

export interface AIGenerateRequest {
  videoTitle: string;
  videoDescription: string;
  channelTitle: string;
  template?: string;
  sentiment?: SentimentType;
  additionalContext?: string;
}

export interface AIGenerateResponse {
  comment: string;
  success: boolean;
  error?: string;
}

export interface YouTubeSearchRequest {
  query: string;
  maxResults?: number;
}

export interface YouTubeCommentRequest {
  videoId: string;
  commentText: string;
}

export interface PostedComment {
  id: string;
  userId: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  channelTitle: string;
  commentText: string;
  sentiment: SentimentType;
  youtubeCommentId?: string;
  likeCount: number;
  replyCount: number;
  postedAt: string;
  lastSyncedAt?: string;
  metadata?: any;
}

export interface AnalyticsStats {
  totalComments: number;
  totalLikes: number;
  totalReplies: number;
  engagementRate: number;
}
