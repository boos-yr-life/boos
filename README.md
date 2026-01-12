# YouTube Comment Bot - Setup Instructions

## Prerequisites

1. **Google Cloud Console Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable YouTube Data API v3
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
   - Copy Client ID and Client Secret

2. **Google Gemini API**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key for Gemini
   - Copy the API key

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Update `.env.local` with your credentials:
   ```env
   # Generate secret: openssl rand -base64 32
   NEXTAUTH_SECRET=your-generated-secret-here
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth (from Google Cloud Console)
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret

   # Google Gemini AI
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Generate NextAuth Secret**
   ```bash
   openssl rand -base64 32
   ```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### Step 1: Connect YouTube
- OAuth 2.0 authentication with YouTube
- Secure token storage in JWT session

### Step 2: Select Topic
- Browse curated topic categories
- Custom topic search
- Paste YouTube video URLs
- Search results with video previews

### Step 3: Define Comment
- Pre-built comment templates
- Sentiment-based generation
- Custom context input
- AI-powered with Gemini 2.0 Flash

### Step 4: Review & Post
- Edit generated comment
- Regenerate with one click
- Post directly to YouTube
- Confirmation before posting

## Mobile-First Design

- Responsive layouts for all screen sizes
- Touch-friendly 44px minimum button sizes
- Progressive form wizard with clear steps
- Mobile-optimized component layouts

## API Endpoints

- `GET /api/youtube/search?query=topic` - Search videos
- `GET /api/youtube/video?url=...` - Get video by URL
- `POST /api/youtube/comment` - Post comment
- `POST /api/ai/generate` - Generate AI comment
- `GET /api/youtube/channel` - Get channel info

## Security Features

- NextAuth.js JWT-based authentication
- Encrypted session cookies
- Google OAuth 2.0 flow
- Zod schema validation on all API routes
- Protected API routes with middleware
- Secure token refresh handling

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: NextAuth.js v5
- **UI**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **AI**: Google Gemini 2.0 Flash
- **YouTube API**: googleapis
- **Notifications**: Sonner

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Update OAuth redirect URI with production domain
5. Deploy

### Environment Variables for Production

```env
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GEMINI_API_KEY=your-gemini-key
```

## YouTube API Quotas

- Default quota: 10,000 units/day
- Search: 100 units per request
- Comment insert: 50 units per request
- Monitor usage in Google Cloud Console

## Troubleshooting

### OAuth Not Working
- Verify redirect URIs match exactly
- Check OAuth consent screen configuration
- Ensure YouTube Data API v3 is enabled

### Comment Posting Fails
- Check YouTube API quota
- Verify channel has commenting enabled
- Ensure proper OAuth scopes

### Gemini Generation Fails
- Verify API key is correct
- Check Gemini API quota/billing
- Review prompt length limits

## License

MIT
