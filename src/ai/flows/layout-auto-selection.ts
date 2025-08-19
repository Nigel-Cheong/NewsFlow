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
  content: z.string().describe('The actual content of the newsletter.'),
});

export type SuggestLayoutInput = z.infer<typeof SuggestLayoutInputSchema>;

const LayoutBlockSchema = z.object({
  content: z.string().describe('The content of the block.'),
  type: z.enum(['text', 'image-with-text', 'bullet-points']).describe('The type of the block.'),
  imageUrl: z.string().optional().describe('The URL of the image, if any.'),
});

const SuggestLayoutOutputSchema = z.object({
  layout: z.array(z.array(LayoutBlockSchema)).describe('A 2D array representing the grid layout of content blocks.'),
});

export type SuggestLayoutOutput = z.infer<typeof SuggestLayoutOutputSchema>;

export async function suggestLayout(input: SuggestLayoutInput): Promise<SuggestLayoutOutput> {
  return suggestLayoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLayoutPrompt',
  input: {schema: SuggestLayoutInputSchema},
  output: {schema: SuggestLayoutOutputSchema},
  prompt: `Based on the following newsletter content, arrange it into a 2-column grid layout. Prioritize placing image-with-text blocks side-by-side with text or bullet-point blocks.

Content:
"""
{{{content}}}
"""

Return the layout as a 2D array of content blocks.
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
