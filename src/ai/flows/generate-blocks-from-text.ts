
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating structured newsletter content blocks from raw text.
 *
 * @function generateBlocksFromText - The main function to generate content blocks.
 * @typedef {GenerateBlocksInput} GenerateBlocksInput - The input type for the generateBlocksFromText function.
 * @typedef {GenerateBlocksOutput} GenerateBlocksOutput - The output type for the generateBlocksFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlocksInputSchema = z.object({
  text: z.string().describe('The raw text content from various sources.'),
});
export type GenerateBlocksInput = z.infer<typeof GenerateBlocksInputSchema>;

const GeneratedBlockSchema = z.object({
  title: z.string().optional().describe('A concise title for the content block, derived from headings in the text.'),
  content: z.string().describe('The main text content of the block, typically a paragraph.'),
  type: z
    .enum(['text', 'image-with-text'])
    .describe("The type of the block. Use 'image-with-text' if the content describes a visual concept, otherwise use 'text'."),
});

const GenerateBlocksOutputSchema = z.object({
  blocks: z
    .array(GeneratedBlockSchema)
    .describe(
      'An array of content blocks generated from the input text.'
    ),
});
export type GenerateBlocksOutput = z.infer<typeof GenerateBlocksOutputSchema>;


export async function generateBlocksFromText(
  input: GenerateBlocksInput
): Promise<GenerateBlocksOutput> {
  return generateBlocksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlocksPrompt',
  input: {schema: GenerateBlocksInputSchema},
  output: {schema: GenerateBlocksOutputSchema},
  prompt: `You are an expert content strategist. Your task is to analyze the provided raw text and structure it into a series of logical content blocks for a newsletter.

Rules:
1.  Read through the entire text provided.
2.  Identify natural sections, headings, and paragraphs.
3.  For each section, create a content block object.
4.  Use any clear heading in the text as the 'title' for the block. If there's no clear heading for a paragraph, you can omit the title.
5.  The 'content' of the block should be the main paragraph text.
6.  Set the 'type' to 'text'. If the text strongly implies a visual component (e.g., "the chart shows...", "in the photo, you can see..."), you can use 'image-with-text'.
7.  Do not create blocks for source markers like "Source: file.pdf".

Raw Text:
"""
{{{text}}}
"""

Return a structured array of content blocks.
`,
});

const generateBlocksFlow = ai.defineFlow(
  {
    name: 'generateBlocksFlow',
    inputSchema: GenerateBlocksInputSchema,
    outputSchema: GenerateBlocksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
