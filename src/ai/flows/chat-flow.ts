
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

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's text response to the user's prompt."),
  replacement: z.object({
      blockId: z.string().describe("The ID of the content block to be replaced."),
      newContent: z.string().describe("The suggested new content for the block.")
  }).optional().describe("A suggestion to replace a specific content block. This should be populated if the user asks for a change to a specific part of the newsletter.")
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

Your goal is to help the user improve their newsletter. You can answer questions or rewrite parts of the content.

If the user asks for a change to a specific part of the newsletter (e.g., "make the introduction more exciting" or "rewrite the second paragraph"), you MUST identify the corresponding blockId from the context and provide the rewritten content in the 'replacement' field of the output. Your text 'response' should then be a brief confirmation, like "Here is a more enthusiastic version:" or "Sure, here's a rewrite:".

If the user asks a general question that doesn't involve rewriting content, just provide a helpful answer in the 'response' field and leave the 'replacement' field empty.

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
