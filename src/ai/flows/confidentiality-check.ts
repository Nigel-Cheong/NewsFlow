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
    .describe('The content of the newsletter to be checked, with each block prefixed by its ID, like "id: [blockId]\\n[content]".'),
  sensitiveKeywords: z
    .array(z.string())
    .describe('An array of sensitive keywords to look for in the content.'),
});
export type ConfidentialityCheckInput = z.infer<typeof ConfidentialityCheckInputSchema>;


const FlaggedItemSchema = z.object({
    keyword: z.string().describe('The sensitive keyword that was found.'),
    sentence: z.string().describe('The full sentence in which the sensitive keyword was found.'),
    blockId: z.string().describe('The ID of the block where the keyword was found.'),
});

const ConfidentialityCheckOutputSchema = z.object({
  flaggedItems: z
    .array(FlaggedItemSchema)
    .describe('An array of objects, each containing a flagged keyword, the full sentence it appeared in, and the block ID.'),
  isConfidential: z
    .boolean()
    .describe('Whether the newsletter content is considered confidential based on the presence of any sensitive keywords.'),
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
  prompt: `You are a content safety checker. Your task is to review the following newsletter content and identify any sentences that contain sensitive keywords from the provided list.

For each sensitive keyword you find, you MUST return an object containing:
1. The keyword itself.
2. The full sentence where the keyword was discovered.
3. The blockId associated with that content block.

The content is provided with block IDs. Use these exact IDs in your response.

Sensitive Keywords: {{#each sensitiveKeywords}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}}

Newsletter Content:
"""
{{{newsletterContent}}}
"""

Based on your findings, also determine if the overall content should be considered confidential.
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
