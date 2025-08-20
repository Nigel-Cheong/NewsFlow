
'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting the main content from a given URL.
 *
 * @function extractContentFromUrl - The main function to extract content from a URL.
 * @typedef {ExtractContentInput} ExtractContentInput - The input type for the extractContentFromUrl function.
 * @typedef {ExtractContentOutput} ExtractContentOutput - The output type for the extractContentFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractContentInputSchema = z.object({
  url: z.string().url().describe('The URL of the webpage to process.'),
});
export type ExtractContentInput = z.infer<typeof ExtractContentInputSchema>;

const ExtractContentOutputSchema = z.object({
  title: z.string().optional().describe('The main title of the article or webpage.'),
  content: z.string().describe('The extracted main textual content of the webpage, stripped of ads, navigation, and other boilerplate.'),
});
export type ExtractContentOutput = z.infer<typeof ExtractContentOutputSchema>;

export async function extractContentFromUrl(
  input: ExtractContentInput
): Promise<ExtractContentOutput> {
  return extractContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractContentPrompt',
  input: {schema: ExtractContentInputSchema},
  output: {schema: ExtractContentOutputSchema},
  prompt: `You are an expert web scraper and content extractor. Your task is to visit the provided URL, read its content, and extract only the main article text and its title.

Instructions:
1.  Ignore all non-essential content like advertisements, navigation bars, sidebars, footers, and comments.
2.  Extract the primary title of the article or page.
3.  Extract the full text of the main article content. Preserve the original paragraph breaks.
4.  Return the extracted title and content in the specified format.

URL to process: {{{url}}}
`,
});

const extractContentFlow = ai.defineFlow(
  {
    name: 'extractContentFlow',
    inputSchema: ExtractContentInputSchema,
    outputSchema: ExtractContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
