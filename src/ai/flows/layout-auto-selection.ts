
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
  type: z
    .enum(['text', 'image-with-text', 'video-with-text', 'spacer', 'table', 'carousel', 'event', 'form', 'announcement', 'footer'])
    .describe('The type of the block.'),
  imageUrl: z.string().optional().describe('The URL of the image, if any.'),
  videoUrl: z.string().optional().describe('The URL of the video, if any.'),
  colspan: z
    .number()
    .min(1)
    .max(2)
    .describe('The column span of the block in a 2-column grid (1 for half-width, 2 for full-width).'),
});

const SuggestLayoutOutputSchema = z.object({
  layout: z
    .array(LayoutBlockSchema)
    .describe(
      'A flat array of content blocks with column spans to create a varied grid layout.'
    ),
});

export type SuggestLayoutOutput = z.infer<typeof SuggestLayoutOutputSchema>;

export async function suggestLayout(
  input: SuggestLayoutInput
): Promise<SuggestLayoutOutput> {
  return suggestLayoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLayoutPrompt',
  input: {schema: SuggestLayoutInputSchema},
  output: {schema: SuggestLayoutOutputSchema},
  prompt: `Analyze the following newsletter content and propose a visually appealing grid layout. Your goal is to create a dynamic layout by mixing full-width (2-column span) blocks with half-width (1-column span) blocks.

Rules:
1. The grid has 2 columns.
2. A block can span 1 or 2 columns.
3. Use full-width blocks for important headlines, longer text sections, images, videos, tables, carousels, announcements, footers.
4. Use side-by-side half-width blocks for shorter, related content like an image next to text, an event next to text, or two related text blocks or forms.
5. The total column span of blocks in a logical row should not exceed 2. For example, you can have two blocks with colspan=1, or one block with colspan=2. You cannot have two blocks with colspan=2 in the same row.
6. Spacers should always be full-width.

Content:
"""
{{{content}}}
"""

Return a single flat array of layout blocks, each with a 'colspan' property.
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
