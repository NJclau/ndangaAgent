'use server';

/**
 * @fileOverview An AI agent for generating automated replies to leads.
 *
 * - generateReply - A function that generates a reply based on lead content, confidence score, and user instructions.
 * - GenerateReplyInput - The input type for the generateReply function.
 * - GenerateReplyOutput - The return type for the generateReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReplyInputSchema = z.object({
  leadContent: z.string().describe('The content of the lead.'),
  confidenceScore: z.number().describe('The confidence score of the lead.'),
  userInstructions: z.string().optional().describe('The user instructions for generating the reply.'),
  businessCategory: z.string().describe('The user\'s business category.'),
  userKeywords: z.array(z.string()).describe('Keywords related to what the user sells.'),
});
export type GenerateReplyInput = z.infer<typeof GenerateReplyInputSchema>;

const GenerateReplyOutputSchema = z.object({
  draftReply: z.string().describe('The generated draft reply for the lead.'),
});
export type GenerateReplyOutput = z.infer<typeof GenerateReplyOutputSchema>;

export async function generateReply(input: GenerateReplyInput): Promise<GenerateReplyOutput> {
  return generateReplyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReplyPrompt',
  input: {schema: GenerateReplyInputSchema},
  output: {schema: GenerateReplyOutputSchema},
  prompt: `You are an AI assistant helping a user in Kigali, Rwanda respond to leads.
Your tone should be helpful, professional, and friendly. You can understand and use Kinyarwanda, English, and French.

The user's business is in the '{businessCategory}' category, and they sell things related to these keywords: {{#each userKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

Based on the lead content, its confidence score, and the user's instructions (if any), generate a draft reply.

Lead Content: {{{leadContent}}}
Confidence Score: {{{confidenceScore}}}
{{#if userInstructions}}User Instructions: {{{userInstructions}}}{{/if}}

Draft a concise and relevant reply that offers a solution to the lead's problem and gently introduces the user's business as a potential option.
`,
});

const generateReplyFlow = ai.defineFlow(
  {
    name: 'generateReplyFlow',
    inputSchema: GenerateReplyInputSchema,
    outputSchema: GenerateReplyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
