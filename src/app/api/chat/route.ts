
import { runChat } from '@/app/actions';
import { nextJS } from '@genkit-ai/next';

export const POST = nextJS(async (req) => {
    const { prompt, blocks } = await req.json();
    return await runChat({ prompt, blocks});
});

