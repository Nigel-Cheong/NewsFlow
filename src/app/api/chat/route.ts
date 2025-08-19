
import { runChat } from '@/app/actions';
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => {
    const { prompt, context } = await req.json();
    return runChat(prompt, context);
};
