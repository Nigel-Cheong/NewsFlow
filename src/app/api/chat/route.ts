
import { runChat } from '@/app/actions';
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => {
    const { prompt } = await req.json();
    return runChat(prompt);
};
