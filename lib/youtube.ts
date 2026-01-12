import { google } from 'googleapis';

export function getYouTubeClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  return google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });
}

export async function searchVideos(accessToken: string, query: string, maxResults: number = 10) {
  const youtube = getYouTubeClient(accessToken);
  
  const response = await youtube.search.list({
    part: ['snippet'],
    q: query,
    type: ['video'],
    maxResults,
    order: 'relevance',
  });

  return response.data.items?.map((item) => ({
    id: item.id?.videoId || '',
    title: item.snippet?.title || '',
    description: item.snippet?.description || '',
    channelTitle: item.snippet?.channelTitle || '',
    channelId: item.snippet?.channelId || '',
    thumbnailUrl: item.snippet?.thumbnails?.medium?.url || '',
    publishedAt: item.snippet?.publishedAt || '',
  })) || [];
}

export async function getVideoDetails(accessToken: string, videoId: string) {
  const youtube = getYouTubeClient(accessToken);
  
  const response = await youtube.videos.list({
    part: ['snippet', 'statistics'],
    id: [videoId],
  });

  const video = response.data.items?.[0];
  if (!video) {
    throw new Error('Video not found');
  }

  return {
    id: video.id || '',
    title: video.snippet?.title || '',
    description: video.snippet?.description || '',
    channelTitle: video.snippet?.channelTitle || '',
    channelId: video.snippet?.channelId || '',
    thumbnailUrl: video.snippet?.thumbnails?.medium?.url || '',
    viewCount: video.statistics?.viewCount,
    publishedAt: video.snippet?.publishedAt || '',
  };
}

export async function postComment(accessToken: string, videoId: string, commentText: string) {
  const youtube = getYouTubeClient(accessToken);
  
  const response = await youtube.commentThreads.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        videoId,
        topLevelComment: {
          snippet: {
            textOriginal: commentText,
          },
        },
      },
    },
  });

  return response.data;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export async function getChannelInfo(accessToken: string) {
  const youtube = getYouTubeClient(accessToken);
  
  const response = await youtube.channels.list({
    part: ['snippet'],
    mine: true,
  });

  const channel = response.data.items?.[0];
  if (!channel) {
    throw new Error('No channel found');
  }

  return {
    id: channel.id || '',
    title: channel.snippet?.title || '',
    thumbnailUrl: channel.snippet?.thumbnails?.default?.url,
  };
}

export async function getVideoTranscript(
  accessToken: string,
  videoId: string
): Promise<string | null> {
  try {
    const youtube = getYouTubeClient(accessToken);
    
    // First, get the list of caption tracks for the video
    const captionsResponse = await youtube.captions.list({
      part: ['snippet'],
      videoId: videoId,
    });

    if (!captionsResponse.data.items || captionsResponse.data.items.length === 0) {
      return null; // No captions available
    }

    // Find English caption track (or first available if no English)
    const englishCaption = captionsResponse.data.items.find(
      (caption) => caption.snippet?.language === 'en' || caption.snippet?.language?.startsWith('en')
    );
    const captionTrack = englishCaption || captionsResponse.data.items[0];

    if (!captionTrack.id) {
      return null;
    }

    // Download the caption track
    const downloadResponse = await youtube.captions.download({
      id: captionTrack.id,
      tfmt: 'srt', // Get in SRT format for easier parsing
    });

    // The response data contains the transcript
    if (typeof downloadResponse.data === 'string') {
      // Parse SRT format to extract text only (remove timestamps)
      const text = downloadResponse.data
        .split('\n\n')
        .map((block) => {
          const lines = block.split('\n');
          // Skip line number and timestamp lines, keep only the text
          return lines.slice(2).join(' ');
        })
        .filter((text) => text.trim())
        .join(' ');
      
      // Limit transcript to ~3000 characters to keep within context limits
      return text.slice(0, 3000);
    }

    return null;
  } catch (error: any) {
    // Captions might be disabled or unavailable
    console.log('Could not fetch transcript:', error.message);
    return null;
  }
}

export async function getMyCommentThreads(
  accessToken: string,
  maxResults: number = 50
) {
  try {
    const youtube = getYouTubeClient(accessToken);
    
    // Get channel ID for the authenticated user
    const channelsResponse = await youtube.channels.list({
      part: ['id', 'snippet', 'contentDetails'],
      mine: true,
    });
    
    const channelId = channelsResponse.data.items?.[0]?.id;
    const channelTitle = channelsResponse.data.items?.[0]?.snippet?.title;
    
    if (!channelId) {
      throw new Error('Could not retrieve channel information');
    }

    console.log(`Fetching comments for channel: ${channelTitle} (${channelId})`);

    // Try to get the user's activities (comments they've made)
    try {
      const activitiesResponse = await youtube.activities.list({
        part: ['snippet', 'contentDetails'],
        mine: true,
        maxResults: 50,
      });

      console.log(`Activities found: ${activitiesResponse.data.items?.length || 0}`);

      // Filter for comment activities and extract comment IDs
      const commentActivities = activitiesResponse.data.items?.filter(
        (activity) => activity.snippet?.type === 'comment'
      ) || [];

      console.log(`Comment activities: ${commentActivities.length}`);

      // If we found comment activities, fetch the actual comments
      if (commentActivities.length > 0) {
        const commentPromises = commentActivities.map(async (activity) => {
          const commentId = (activity.contentDetails?.comment?.resourceId as any)?.commentId;
          if (!commentId) return null;

          try {
            const commentResponse = await youtube.comments.list({
              part: ['snippet'],
              id: [commentId],
            });

            const comment = commentResponse.data.items?.[0];
            if (!comment) return null;

            return {
              id: comment.id || '',
              videoId: comment.snippet?.videoId || '',
              textDisplay: comment.snippet?.textDisplay || '',
              textOriginal: comment.snippet?.textOriginal || '',
              authorChannelId: comment.snippet?.authorChannelId?.value || '',
              likeCount: comment.snippet?.likeCount || 0,
              publishedAt: comment.snippet?.publishedAt || '',
              updatedAt: comment.snippet?.updatedAt || '',
              totalReplyCount: 0, // Individual comments don't have reply count
              videoTitle: '',
            };
          } catch (err) {
            console.log(`Could not fetch comment ${commentId}`);
            return null;
          }
        });

        const comments = (await Promise.all(commentPromises)).filter(Boolean);
        console.log(`Successfully fetched ${comments.length} comments from activities`);
        return comments as any[];
      }
    } catch (activityError: any) {
      console.log('Activity API failed, trying alternative method:', activityError.message);
    }

    // Fallback: Get all comment threads related to channel
    const response = await youtube.commentThreads.list({
      part: ['snippet', 'replies'],
      allThreadsRelatedToChannelId: channelId,
      maxResults,
      order: 'time',
      textFormat: 'plainText',
    });

    console.log(`Total threads fetched: ${response.data.items?.length || 0}`);

    // Filter to only include comments authored by this channel
    const myComments = response.data.items?.filter((thread) => {
      const authorChannelId = thread.snippet?.topLevelComment?.snippet?.authorChannelId?.value;
      return authorChannelId === channelId;
    });

    console.log(`Filtered to ${myComments?.length || 0} comments by user`);

    return myComments?.map((thread) => {
      const topLevelComment = thread.snippet?.topLevelComment;
      const snippet = topLevelComment?.snippet;
      
      return {
        id: topLevelComment?.id || '',
        videoId: snippet?.videoId || '',
        textDisplay: snippet?.textDisplay || '',
        textOriginal: snippet?.textOriginal || '',
        authorChannelId: snippet?.authorChannelId?.value || '',
        likeCount: snippet?.likeCount || 0,
        publishedAt: snippet?.publishedAt || '',
        updatedAt: snippet?.updatedAt || '',
        totalReplyCount: thread.snippet?.totalReplyCount || 0,
        canReply: thread.snippet?.canReply || false,
        videoTitle: '',
      };
    }) || [];
  } catch (error: any) {
    console.error('Error fetching comment threads:', error.message);
    throw error;
  }
}

export async function getCommentEngagement(
  accessToken: string,
  commentId: string
) {
  try {
    const youtube = getYouTubeClient(accessToken);
    
    const response = await youtube.comments.list({
      part: ['snippet'],
      id: [commentId],
    });

    const comment = response.data.items?.[0];
    if (!comment) {
      return null;
    }

    return {
      id: comment.id || '',
      likeCount: comment.snippet?.likeCount || 0,
      publishedAt: comment.snippet?.publishedAt || '',
      updatedAt: comment.snippet?.updatedAt || '',
    };
  } catch (error: any) {
    console.error('Error fetching comment engagement:', error.message);
    return null;
  }
}

export async function getVideoDetailsForComments(
  accessToken: string,
  videoIds: string[]
) {
  try {
    // Return empty object if no video IDs provided
    if (!videoIds || videoIds.length === 0) {
      return {};
    }

    const youtube = getYouTubeClient(accessToken);
    
    // YouTube API accepts up to 50 video IDs at once
    const response = await youtube.videos.list({
      part: ['snippet'],
      id: videoIds,
      maxResults: 50,
    });

    const videoMap: { [key: string]: { title: string; channelTitle: string } } = {};
    response.data.items?.forEach((video) => {
      if (video.id) {
        videoMap[video.id] = {
          title: video.snippet?.title || '',
          channelTitle: video.snippet?.channelTitle || '',
        };
      }
    });

    return videoMap;
  } catch (error: any) {
    console.error('Error fetching video details:', error.message);
    return {};
  }
}
