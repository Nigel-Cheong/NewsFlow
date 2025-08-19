import { runChat } from '@/app/actions';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const { prompt } = await req.json();
    return await runChat({ prompt });
};
