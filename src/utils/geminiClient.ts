
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LeadDataSchema } from './validators';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const PROMPT_TEMPLATE = `Analyze this social media post for commercial intent to BUY/HIRE services.
Post: '{text}'
Context: User sells {businessCategory} in Kigali, Rwanda.
Understand Kinyarwanda/English/French code-switching.
Return JSON: {is_lead: boolean, confidence_score: 0-100, reason: string, draft_reply: string}`;

export const analyzePostWithGemini = async (post: { text: string; }, businessCategory: string) => {
  const prompt = PROMPT_TEMPLATE.replace('{text}', post.text).replace('{businessCategory}', businessCategory);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonResponse = JSON.parse(response.text());

    // Validate the response against the schema
    const validationResult = LeadDataSchema.safeParse(jsonResponse);
    if (!validationResult.success) {
      throw new Error(`Invalid response from Gemini: ${validationResult.error.message}`);
    }

    return validationResult.data;
  } catch (error) {
    console.error('Error analyzing post with Gemini:', error);
    throw new Error('Failed to analyze post with Gemini.');
  }
};
