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
  businessCategory: z.string().describe('The business category of the user.'),
});
export type LeadConfidenceScoringInput = z.infer<typeof LeadConfidenceScoringInputSchema>;

const LeadConfidenceScoringOutputSchema = z.object({
  isLead: z.boolean().describe('Whether or not the post is a lead with commercial intent to buy or hire services.'),
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
  prompt: `You are an AI assistant that scores leads based on their relevance to defined targets for a user in Kigali, Rwanda.
You can understand Kinyarwanda, English, and French, including code-switching.

The user sells products/services in the '{businessCategory}' category.

Analyze this social media post for commercial intent to BUY or HIRE services.

Post: '{{{leadText}}}'
Target Terms: {{#each targetTerms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Your task is to determine if this is a lead, and provide a confidence score between 0 and 1 (inclusive) representing how well the lead matches the user's business. Provide reasoning for the assigned score.

Consider these factors:
- Presence of target terms in the lead text.
- Direct questions asking for recommendations or help.
- Contextual relevance of the lead text to the user's business category.
- Expressions of problems that the user's business can solve.
- Overall sentiment and intent of the lead text.

A promotional post from another business is NOT a lead. A general comment or question is NOT a lead unless it shows intent to purchase.

Return a JSON object with 'isLead', 'confidenceScore' and 'reason' fields.
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
