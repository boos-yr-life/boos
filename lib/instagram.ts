import { InstagramPost, InstagramAccount } from '@/types';

export function getInstagramClient(accessToken: string) {
  return {
    get: async (endpoint: string) => {
      const response = await fetch(`https://graph.instagram.com/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return response.json();
    },
  };
}

export async function getInstagramAccount(accessToken: string): Promise<InstagramAccount> {
  const client = getInstagramClient(accessToken);

  const response = await client.get('me?fields=id,username,profile_picture_url');

  return {
    id: response.id,
    username: response.username,
    profilePicture: response.profile_picture_url,
  };
}

export async function getInstagramPost(accessToken: string, postId: string): Promise<InstagramPost> {
  const client = getInstagramClient(accessToken);

  const response = await client.get(`${postId}?fields=id,caption,media_type,media_url,permalink,like_count,comments_count,timestamp`);

  return {
    id: response.id,
    caption: response.caption,
    mediaType: response.media_type,
    mediaUrl: response.media_url,
    permalink: response.permalink,
    likeCount: response.like_count,
    commentsCount: response.comments_count,
    timestamp: response.timestamp,
  };
}

export async function postInstagramComment(accessToken: string, postId: string, commentText: string): Promise<any> {
  const client = getInstagramClient(accessToken);

  const response = await fetch(`https://graph.instagram.com/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commentText,
    }),
  });

  if (!response.ok) {
    throw new Error(`Instagram API error: ${response.statusText}`);
  }

  return response.json();
}

export function extractInstagramPostId(url: string): string | null {
  // Instagram post URLs can be in various formats
  const patterns = [
    /instagram\.com\/p\/([^/?]+)/,
    /instagram\.com\/reel\/([^/?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}