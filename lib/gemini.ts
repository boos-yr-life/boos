import { GoogleGenerativeAI } from '@google/generative-ai';
import { SentimentType } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateComment({
  videoTitle,
  videoDescription,
  channelTitle,
  template,
  sentiment,
  additionalContext,
  transcript,
}: {
  videoTitle: string;
  videoDescription: string;
  channelTitle: string;
  template?: string;
  sentiment?: SentimentType;
  additionalContext?: string;
  transcript?: string | null;
}): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const sentimentInstructions = {
    positive: 'Use an encouraging and appreciative tone. Be supportive and highlight the positive aspects.',
    neutral: 'Use a balanced and informative tone. Be objective and professional.',
    constructive: 'Provide helpful feedback with actionable suggestions. Be respectful and constructive.',
    enthusiastic: 'Show excitement and genuine engagement. Be energetic and passionate about the topic.',
  };

  const transcriptSection = transcript 
    ? `\n\nVideo Transcript (excerpt):\n${transcript}`
    : '';

  const prompt = `You are helping a user create a thoughtful, authentic YouTube comment.

Video Information:
- Title: ${videoTitle}
- Channel: ${channelTitle}
- Description: ${videoDescription.slice(0, 500)}${transcriptSection}

${template ? `Template/Style to Follow:\n${template}\n` : ''}

${sentiment ? `Tone: ${sentimentInstructions[sentiment]}\n` : ''}

${additionalContext ? `Additional Context from User:\n${additionalContext}\n` : ''}

Instructions:
1. Create a genuine, personalized comment that feels natural and human
2. Keep it SHORT: 1-2 sentences (20-40 words max)
3. Be specific to this video's content${transcript ? ' (reference the transcript when relevant)' : ''}
4. Avoid generic praise - reference actual content when possible
5. Make it conversational and authentic
6. Do NOT use emojis unless specifically requested
7. Do NOT sound overly formal or robotic
8. Be concise and to the point - shorter is better

Generate the comment:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text().trim();
}
