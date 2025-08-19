'use server';

/**
 * @fileOverview A simple chat flow that uses Gemini to respond to user prompts and edit newsletter content.
 *
 * - chatFlow - A function that takes a user's prompt and returns a response from Gemini.
 * - ChatInput - The input type for the chatFlow function.
 * - ChatOutput - The return type for the chatFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ContentBlockSchema } from '@/lib/types';


const ChatInputSchema = z.object({
  prompt: z.string().describe('The user\'s prompt.'),
  blocks: z.array(ContentBlockSchema).describe('The current content blocks of the newsletter.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s text response to the user.'),
  blocks: z.array(ContentBlockSchema).describe('The updated content blocks of the newsletter.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const editorPrompt = ai.definePrompt({
    name: 'editorPrompt',
    input: { schema: ChatInputSchema },
    output: { schema: ChatOutputSchema },
    prompt: `You are a newsletter editor AI. The user will give you a prompt to modify the newsletter content.
You must respond with a friendly and helpful message, and the updated JSON for the newsletter blocks.

User Prompt:
"{{{prompt}}}"

Current Newsletter Blocks (JSON):
{{{json blocks}}}

Your task is to understand the user's request and return the modified block structure that reflects their changes.
- You can add, remove, or modify blocks.
- When modifying a block, try to preserve its ID.
- When adding a new block, generate a new unique ID in the format 'block-xxxxxxxx'.
- Maintain the existing schema for each block.
- Your text response should briefly confirm what you've done.
`
});


export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const {output} = await editorPrompt(input);
    if (!output) {
      return { response: "Sorry, I couldn't process that request.", blocks: input.blocks };
    }
    return output;
  }
);
