'use server';

/**
 * @fileOverview An AI agent that scores leads based on their relevance to defined targets.
 *
 * - leadConfidenceScoring - A function that scores a lead's confidence score.
 * - LeadConfidenceScoringInput - The input type for the leadConfidenceScoring function.
 * - LeadConfidenceScoringOutput - The return type for the leadConfidenceScoring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LeadConfidenceScoringInputSchema = z.object({
  leadText: z.string().describe('The text content of the lead.'),
  targetTerms: z.array(z.string()).describe('The target terms defined by the user.'),
});
export type LeadConfidenceScoringInput = z.infer<typeof LeadConfidenceScoringInputSchema>;

const LeadConfidenceScoringOutputSchema = z.object({
  confidenceScore: z.number().describe('A score between 0 and 1 representing the confidence that the lead matches the target.'),
  reason: z.string().describe('The reasoning behind the assigned confidence score.'),
});
export type LeadConfidenceScoringOutput = z.infer<typeof LeadConfidenceScoringOutputSchema>;

export async function leadConfidenceScoring(input: LeadConfidenceScoringInput): Promise<LeadConfidenceScoringOutput> {
  return leadConfidenceScoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'leadConfidenceScoringPrompt',
  input: {schema: LeadConfidenceScoringInputSchema},
  output: {schema: LeadConfidenceScoringOutputSchema},
  prompt: `You are an AI assistant that scores leads based on their relevance to the defined targets.

You will receive the lead text and the target terms defined by the user. Your task is to determine a confidence score between 0 and 1 (inclusive) representing how well the lead matches the specified target. Provide reasoning for the assigned score.

Lead Text: {{{leadText}}}
Target Terms: {{#each targetTerms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Consider these factors when assigning a score:
- Presence of target terms in the lead text.
- Contextual relevance of the lead text to the target terms.
- Overall sentiment and intent of the lead text.

Output a JSON object with 'confidenceScore' and 'reason' fields. The confidenceScore must be a number between 0 and 1. The reason must explain how you arrived at the score.
`,
});

const leadConfidenceScoringFlow = ai.defineFlow(
  {
    name: 'leadConfidenceScoringFlow',
    inputSchema: LeadConfidenceScoringInputSchema,
    outputSchema: LeadConfidenceScoringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
