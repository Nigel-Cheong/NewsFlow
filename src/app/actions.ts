'use server';

import { confidentialityCheck } from '@/ai/flows/confidentiality-check';
import { suggestLayout } from '@/ai/flows/layout-auto-selection';
import { chatFlow, type ChatInput } from '@/ai/flows/chat-flow';
import type { ContentBlock } from '@/lib/types';

export async function runConfidentialityCheck(
  content: ContentBlock[],
  sensitiveKeywords: string[]
) {
  const newsletterContent = content.map((block) => block.content).join('\n\n');
  try {
    const result = await confidentialityCheck({ newsletterContent, sensitiveKeywords });
    return result;
  } catch (error) {
    console.error('Error in confidentiality check:', error);
    return { flaggedKeywords: [], isConfidential: false };
  }
}

export async function runSuggestLayout(content: ContentBlock[]) {
  const headerBlock = content.find((block) => block.type === 'header');
  const footerBlock = content.find((block) => block.type === 'footer');

  const bodyContent = content.filter(
    (block) => block.type !== 'header' && block.type !== 'footer'
  );

  const newsletterContent = bodyContent
    .map((block) => `Type: ${block.type}, Content: ${block.content}`)
    .join('\n\n');

  try {
    // If there's no body content, just return the header and/or footer.
    if (bodyContent.length === 0) {
      const layout = [];
      if (headerBlock) layout.push(headerBlock);
      if (footerBlock) layout.push(footerBlock);
      return { layout };
    }

    const result = await suggestLayout({ content: newsletterContent });
    
    let finalLayout = result.layout || [];

    if (headerBlock) {
      finalLayout = [headerBlock, ...finalLayout];
    }
    if (footerBlock) {
      finalLayout = [...finalLayout, footerBlock];
    }
    
    return { layout: finalLayout };

  } catch (error) {
    console.error('Error in layout suggestion:', error);
    return { layout: [] };
  }
}

export async function runChat(input: ChatInput) {
    try {
        const {stream, response} = await chatFlow(input);
        
        const reader = stream.getReader();
        const textDecoder = new TextDecoder();
        
        const readableStream = new ReadableStream({
            async start(controller) {
                while(true) {
                    const { done, value } = await reader.read();
                    if(done) {
                        break;
                    }
                    controller.enqueue(textDecoder.decode(value));
                }
                controller.close();
            }
        });
        
        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        });

    } catch (error) {
        console.error('Error in chat:', error);
        return new Response(JSON.stringify({ response: 'Sorry, I encountered an error.', blocks: input.blocks }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
