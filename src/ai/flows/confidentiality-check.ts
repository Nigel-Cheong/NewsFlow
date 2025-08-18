'use server';

/**
 * @fileOverview Scans newsletter content for sensitive keywords using Gemini 2.5 Pro Flash.
 *
 * - confidentialityCheck - A function that scans content for sensitive keywords.
 * - ConfidentialityCheckInput - The input type for the confidentialityCheck function.
 * - ConfidentialityCheckOutput - The return type for the confidentialityCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfidentialityCheckInputSchema = z.object({
  newsletterContent: z
    .string()
    .describe('The content of the newsletter to be checked.'),
  sensitiveKeywords: z
    .array(z.string())
    .describe('An array of sensitive keywords to look for in the content.'),
});
export type ConfidentialityCheckInput = z.infer<typeof ConfidentialityCheckInputSchema>;

const ConfidentialityCheckOutputSchema = z.object({
  flaggedKeywords: z
    .array(z.string())
    .describe('An array of sensitive keywords found in the newsletter content.'),
  isConfidential: z
    .boolean()
    .describe('Whether the newsletter content is considered confidential.'),
});
export type ConfidentialityCheckOutput = z.infer<typeof ConfidentialityCheckOutputSchema>;

export async function confidentialityCheck(
  input: ConfidentialityCheckInput
): Promise<ConfidentialityCheckOutput> {
  return confidentialityCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'confidentialityCheckPrompt',
  input: {schema: ConfidentialityCheckInputSchema},
  output: {schema: ConfidentialityCheckOutputSchema},
  prompt: `You are a content safety checker. Review the following newsletter content and identify any sensitive keywords from the provided list.

Newsletter Content: {{{newsletterContent}}}

Sensitive Keywords: {{#each sensitiveKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Determine if the content is confidential based on the presence of these keywords. Return the list of flagged keywords and a boolean indicating confidentiality.
`,
});

const confidentialityCheckFlow = ai.defineFlow(
  {
    name: 'confidentialityCheckFlow',
    inputSchema: ConfidentialityCheckInputSchema,
    outputSchema: ConfidentialityCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
