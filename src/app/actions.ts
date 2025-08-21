
'use server';

import { confidentialityCheck } from '@/ai/flows/confidentiality-check';
import { suggestLayout } from '@/ai/flows/layout-auto-selection';
import { chat } from '@/ai/flows/chat-flow';
import { generateBlocksFromText } from '@/ai/flows/generate-blocks-from-text';
import { extractContentFromUrl } from '@/ai/flows/extract-content-from-url';
import { uploadFile } from '@/ai/flows/upload-file-flow';
import type { ContentBlock, Newsletter } from '@/lib/types';

export async function runConfidentialityCheck(
  content: ContentBlock[],
  sensitiveKeywords: string[]
) {
  const newsletterContent = content.map((block) => `id: ${block.id}\n${block.content}`).join('\n\n---\n\n');
  try {
    const result = await confidentialityCheck({ newsletterContent, sensitiveKeywords });
    return result;
  } catch (error) {
    console.error('Error in confidentiality check:', error);
    return { flaggedItems: [], isConfidential: false };
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

export async function runChat(prompt: string, context?: string) {
  try {
    const result = await chat({ prompt, context });
    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return new Response(JSON.stringify({ response: 'An error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}

export async function runGenerateBlocks(text: string) {
    try {
        const result = await generateBlocksFromText({ text });
        return result;
    } catch (error) {
        console.error('Error in block generation:', error);
        return { blocks: [] };
    }
}

export async function fetchUrlContent(url: string) {
  try {
    const result = await extractContentFromUrl({ url });
    return result;
  } catch (error) {
    console.error('Error fetching URL content:', error);
    return { content: '', title: '' };
  }
}

export async function sendApprovalEmail(email: string, newsletter: Newsletter) {
    // This is a mock function. In a real app, you would use a service like Resend, SendGrid, or Nodemailer.
    console.log(`
      ===============================================
      Sending Approval Request to: ${email}
      -----------------------------------------------
      Newsletter Title: ${newsletter.title}
      Newsletter ID: ${newsletter.id}
      Preview URL: /newsletters/${newsletter.id}/preview
      ===============================================
    `);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
}

export async function runUploadFile(fileDataUri: string, fileName: string) {
    try {
      const result = await uploadFile({ fileDataUri, fileName });
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      return { url: '' };
    }
}
