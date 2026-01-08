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
  userInstructions: z.string().describe('The user instructions for generating the reply.'),
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
  prompt: `You are an AI assistant helping a user respond to leads.

  Based on the lead content, its confidence score, and the user's instructions, generate a draft reply.

  Lead Content: {{{leadContent}}}
  Confidence Score: {{{confidenceScore}}}
  User Instructions: {{{userInstructions}}}

  Draft Reply:`,
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
