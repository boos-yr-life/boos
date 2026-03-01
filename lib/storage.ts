/**
 * Database storage for tracking comments posted through the app.
 * Uses PostgreSQL to persist comments across devices and sessions.
 */

import { PostedComment } from '@/types';

export type StoredComment = PostedComment;

export async function savePostedComment(
  userId: string,
  comment: Omit<PostedComment, 'id' | 'userId' | 'postedAt' | 'lastSyncedAt'>
): Promise<{ id: string }> {
  const response = await fetch('/api/comments/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...comment }),
  });

  if (!response.ok) {
    throw new Error('Failed to save comment');
  }

  return response.json();
}

export async function getPostedComments(userId: string): Promise<PostedComment[]> {
  const response = await fetch(`/api/comments?userId=${encodeURIComponent(userId)}`);

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  const data = await response.json();
  return data.comments || [];
}

export async function updateCommentEngagement(
  commentId: string,
  likeCount: number,
  replyCount: number
): Promise<void> {
  const response = await fetch('/api/comments/update', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentId, likeCount, replyCount }),
  });

  if (!response.ok) {
    throw new Error('Failed to update comment engagement');
  }
}
