'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically suggesting layout templates based on the content type.
 *
 * @function suggestLayout - The main function to suggest a layout template.
 * @typedef {SuggestLayoutInput} SuggestLayoutInput - The input type for the suggestLayout function.
 * @typedef {SuggestLayoutOutput} SuggestLayoutOutput - The output type for the suggestLayout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLayoutInputSchema = z.object({
  contentType: z
    .string()
    .describe(
      'The type of content for which a layout is to be suggested (e.g., text-only, image-with-text, bullet points).'
    ),
  content: z.string().describe('The actual content of the newsletter.'),
});

export type SuggestLayoutInput = z.infer<typeof SuggestLayoutInputSchema>;

const SuggestLayoutOutputSchema = z.object({
  layoutTemplate: z
    .string()
    .describe(
      'The suggested layout template based on the content type (e.g., text-only, image-with-text, bullet points).'
    ),
});

export type SuggestLayoutOutput = z.infer<typeof SuggestLayoutOutputSchema>;

export async function suggestLayout(input: SuggestLayoutInput): Promise<SuggestLayoutOutput> {
  return suggestLayoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLayoutPrompt',
  input: {schema: SuggestLayoutInputSchema},
  output: {schema: SuggestLayoutOutputSchema},
  prompt: `Based on the content type "{{{contentType}}}" and the content itself:

  """{{{content}}}"""

  Suggest an appropriate layout template (e.g., text-only, image-with-text, bullet points). Be brief.
`,
});

const suggestLayoutFlow = ai.defineFlow(
  {
    name: 'suggestLayoutFlow',
    inputSchema: SuggestLayoutInputSchema,
    outputSchema: SuggestLayoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
