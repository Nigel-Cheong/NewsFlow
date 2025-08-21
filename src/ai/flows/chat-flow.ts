
'use server';

/**
 * @fileOverview A general-purpose chat flow using Gemini.
 *
 * - chat - A function that handles the chat interaction.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  prompt: z.string().describe("The user's message."),
  context: z.string().optional().describe('The context for the chat, such as the current newsletter content, including block IDs.')
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const LayoutSuggestionSchema = z.object({
    blockId: z.string().describe("The ID of the block to be resized."),
    colspan: z.number().min(1).max(2).describe("The new column span for the block (1 for half-width, 2 for full-width).")
});

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's text response to the user's prompt."),
  replacement: z.object({
      blockId: z.string().describe("The ID of the content block to be replaced."),
      newContent: z.string().describe("The suggested new content for the block.")
  }).optional().describe("A suggestion to replace a specific content block. This should be populated if the user asks for a change to a specific part of the newsletter."),
  layoutSuggestion: z.array(LayoutSuggestionSchema).optional().describe("A suggestion to change the grid layout. This should be populated if the user asks for layout or grid changes (e.g., 'put block X and Y side-by-side').")
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a helpful assistant for a newsletter editor.

Your goal is to help the user improve their newsletter. You can answer questions, rewrite parts of the content, or suggest layout changes. The grid system has 2 columns. A block can span 1 column (half-width) or 2 columns (full-width).

Here are your capabilities:

1.  **Content Rewriting**: If the user asks for a change to a specific part of the newsletter (e.g., "make the introduction more exciting" or "rewrite the second paragraph"), you MUST identify the corresponding blockId from the context and provide the rewritten content in the 'replacement' field of the output. Your text 'response' should then be a brief confirmation, like "Here is a more enthusiastic version:".

2.  **Layout Suggestions**: If the user asks to change the layout (e.g., "put the intro and the offsite update side-by-side" or "make the takeaways full width"), you MUST populate the 'layoutSuggestion' field with an array of objects, each specifying a 'blockId' and its new 'colspan' value. For side-by-side blocks, you would suggest a 'colspan' of 1 for each. For a full-width block, suggest a 'colspan' of 2. Your 'response' should be a confirmation, like "Done. I've adjusted the layout."

3.  **General Questions**: If the user asks a general question, just provide a helpful answer in the 'response' field and leave the other fields empty.

The user is currently working on a newsletter with the following content. Use this as context for your answers. Each block has a unique 'blockId'.
---
{{{context}}}
---

User: {{{prompt}}}
AI:`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
