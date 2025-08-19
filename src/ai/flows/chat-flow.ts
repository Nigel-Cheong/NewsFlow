'use server';

/**
 * @fileOverview A simple chat flow that uses Gemini to respond to user prompts.
 *
 * - chatFlow - A function that takes a user's prompt and returns a response from Gemini.
 * - ChatInput - The input type for the chatFlow function.
 * - ChatOutput - The return type for the chatFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const ChatInputSchema = z.object({
  prompt: z.string().describe('The user\'s prompt.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s text response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt({
    name: 'chatPrompt',
    input: { schema: ChatInputSchema },
    output: { schema: ChatOutputSchema },
    prompt: `You are a helpful AI assistant.

User Prompt:
"{{{prompt}}}"
`
});


export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
    stream: true,
  },
  async (input) => {
    const {stream, response} = chatPrompt.generateStream(input);

    const result = {
        stream: (async function* () {
            for await (const chunk of stream) {
                yield {
                    response: chunk.output?.response || '',
                }
            }
        })(),
        response: (async () => {
            const final = await response
            return final.output || { response: "Sorry, I couldn't process that request." }
        })()
    }
    return result
  }
);
