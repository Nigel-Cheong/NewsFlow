'use server';

/**
 * @fileOverview A simple chat flow that uses Gemini to respond to user prompts.
 *
 * - runChat - A function that takes a user's prompt and returns a response from Gemini.
 * - ChatInput - The input type for the runChat function.
 * - ChatOutput - The return type for the runChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  prompt: z.string().describe('The user\'s prompt.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function runChat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
        prompt: input.prompt,
    });
    return { response: text };
  }
);
