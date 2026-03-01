import { FacebookPost, FacebookPage } from '@/types';

export function getFacebookClient(accessToken: string) {
  return {
    get: async (endpoint: string) => {
      const response = await fetch(`https://graph.facebook.com/v18.0/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`);
      }

      return response.json();
    },
    post: async (endpoint: string, data: any) => {
      const response = await fetch(`https://graph.facebook.com/v18.0/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`);
      }

      return response.json();
    },
  };
}

export async function getFacebookPages(accessToken: string): Promise<FacebookPage[]> {
  const client = getFacebookClient(accessToken);

  const response = await client.get('me/accounts?fields=id,name,category');

  return response.data?.map((page: any) => ({
    id: page.id,
    name: page.name,
    category: page.category,
  })) || [];
}

export async function getFacebookPost(accessToken: string, postId: string): Promise<FacebookPost> {
  const client = getFacebookClient(accessToken);

  const response = await client.get(`${postId}?fields=id,message,type,permalink_url,created_time,likes.summary(true),comments.summary(true)`);

  return {
    id: response.id,
    message: response.message,
    type: response.type,
    permalinkUrl: response.permalink_url,
    createdTime: response.created_time,
    likes: response.likes,
    comments: response.comments,
  };
}

export async function postFacebookComment(accessToken: string, postId: string, commentText: string): Promise<any> {
  const client = getFacebookClient(accessToken);

  return client.post(`${postId}/comments`, {
    message: commentText,
  });
}

export function extractFacebookPostId(url: string): string | null {
  // Facebook post URLs can be in various formats
  const patterns = [
    /facebook\.com\/[^/]+\/posts\/([^/?]+)/,
    /facebook\.com\/permalink\.php\?story_fbid=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}