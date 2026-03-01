export type Platform = 'youtube' | 'instagram' | 'facebook';

export interface YouTubeChannel {
  id: string;
  title: string;
  thumbnailUrl?: string;
}

export interface InstagramAccount {
  id: string;
  username: string;
  profilePicture?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  category?: string;
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

export interface InstagramPost {
  id: string;
  caption?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  permalink: string;
  likeCount?: number;
  commentsCount?: number;
  timestamp: string;
}

export interface FacebookPost {
  id: string;
  message?: string;
  type: string;
  permalinkUrl: string;
  createdTime: string;
  likes?: { count: number };
  comments?: { count: number };
}

export interface CommentTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

export type SentimentType = 'positive' | 'neutral' | 'constructive' | 'enthusiastic';

export interface WizardData {
  // Step 1: Platform Selection
  selectedPlatform?: Platform;

  // Step 2: Platform Connection
  youtubeConnected: boolean;
  channelInfo?: YouTubeChannel;
  instagramConnected: boolean;
  instagramAccount?: InstagramAccount;
  facebookConnected: boolean;
  facebookPage?: FacebookPage;

  // Step 3: Topic Selection
  selectedTopic?: string;
  customTopic?: string;
  videoUrl?: string;
  selectedVideo?: YouTubeVideo;
  selectedVideos?: YouTubeVideo[]; // Multiple videos
  videoSentiments?: { [videoId: string]: SentimentType }; // Sentiment per video (quick mode)

  // Instagram/Facebook content
  instagramPostUrl?: string;
  selectedInstagramPost?: InstagramPost;
  facebookPostUrl?: string;
  selectedFacebookPost?: FacebookPost;

  // Step 4: Comment Definition
  selectedTemplate?: string;
  customTemplate?: string;
  selectedSentiment?: SentimentType;
  additionalContext?: string;

  // Step 5: AI Generated Comment
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
  platform: Platform;
  contentTitle: string;
  contentDescription?: string;
  authorName: string;
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

export interface InstagramCommentRequest {
  postId: string;
  commentText: string;
}

export interface FacebookCommentRequest {
  postId: string;
  commentText: string;
}

export interface PostedComment {
  id: string;
  userId: string;
  platform: Platform;
  contentId: string; // videoId, postId, etc.
  contentTitle: string;
  contentUrl: string;
  authorName: string; // channelTitle, username, pageName
  commentText: string;
  sentiment: SentimentType;
  platformCommentId?: string; // youtubeCommentId, instagramCommentId, etc.

  // Analytics data
  likeCount: number;
  replyCount: number;

  // Metadata
  postedAt: string;
  lastSyncedAt?: string;

  // Store additional context
  metadata?: any;
}

export interface AnalyticsStats {
  totalComments: number;
  totalLikes: number;
  totalReplies: number;
  engagementRate: number;
}
