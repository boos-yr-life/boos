# Testing the Analytics Feature

## Quick Test Steps

### 1. Post a Comment
1. Go to Home (`/dashboard`)
2. Paste a YouTube video URL (or use quick mode with subscriptions)
3. Click "Generate Comments"
4. Review the generated comment
5. Click "Post Comment"
6. ✅ Should see: "Comment posted and tracked!"

### 2. View Analytics
1. Click "Analytics" in the navbar
2. ✅ Should see:
   - Total Comments: 1
   - Total Likes: 0 (initially)
   - Total Replies: 0 (initially)
   - Your comment in "Recent Comments" section
   - The video in "Top Performing Videos" section

### 3. Sync Engagement (Optional - wait a few minutes first)
1. On Analytics page, click "Sync Engagement"
2. Wait for sync to complete
3. ✅ Should see updated like counts if anyone liked your comment

### 4. Post Multiple Comments
1. Go back to Home
2. Post 2-3 more comments on different videos
3. Return to Analytics
4. ✅ Should see:
   - Updated totals
   - All comments in "Recent Comments"
   - Videos ranked by engagement in "Top Performing Videos"

## Expected Behavior

### Empty State
When no comments posted yet:
- Shows blue info banner with link to Home
- Stats all show 0
- Recent Comments section shows "No comments yet"
- Top Videos section shows "No data available"

### After Posting
- Stats update immediately
- Comment appears in Recent Comments with video link
- Video appears in Top Performing Videos
- Can click video links to view on YouTube

### Sync Engagement
- "Sync Engagement" button fetches latest likes from YouTube
- Shows "Syncing..." while in progress
- Updates like counts in all sections
- Toast notification confirms sync completion

## Data Storage

Comments are stored in **browser localStorage** at key: `youtube_posted_comments`

To view stored data (for debugging):
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Find `youtube_posted_comments`
4. See JSON array of all tracked comments

To clear data:
```javascript
localStorage.removeItem('youtube_posted_comments')
```

## Known Limitations

1. **Browser-specific**: Data only available in the browser where comments were posted
2. **No historical import**: Cannot retroactively track comments posted outside this app
3. **Manual sync**: Engagement metrics must be manually synced (click button)
4. **Reply counts**: Not synced (YouTube API limitation for individual comments)

## Troubleshooting

### "No comments showing"
- Make sure you posted comments through THIS app
- Check localStorage in DevTools
- Try clearing localStorage and posting a new comment

### "Sync not working"
- Ensure you're authenticated (session not expired)
- Check browser console for errors
- Verify comment was posted with youtubeCommentId

### "Like counts not updating"
- Click "Sync Engagement" button (doesn't auto-update)
- Wait a few minutes after posting before syncing
- Check that comment is still visible on YouTube

## API Quota Usage

Each operation's quota cost:

- **Post Comment**: 50 units (YouTube API)
- **Sync Engagement**: 1 unit per comment (very cheap)
- **View Analytics**: 0 units (reads from localStorage)

Default quota: 10,000 units/day = ~200 posts OR ~10,000 syncs
