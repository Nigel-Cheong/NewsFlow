
'use server';

import { confidentialityCheck } from '@/ai/flows/confidentiality-check';
import { suggestLayout } from '@/ai/flows/layout-auto-selection';
import { chat } from '@/ai/flows/chat-flow';
import { generateBlocksFromText } from '@/ai/flows/generate-blocks-from-text';
import { extractContentFromUrl } from '@/ai/flows/extract-content-from-url';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import type { ContentBlock, Newsletter } from '@/lib/types';
import { 
  getAllNewsletters as dbGetAllNewsletters, 
  getNewsletter as dbGetNewsletter,
  saveNewsletter as dbSaveNewsletter,
  deleteNewsletter as dbDeleteNewsletter
} from '@/lib/db';

export async function getAllNewsletters() {
  return dbGetAllNewsletters();
}

export async function getNewsletter(id: string) {
  return dbGetNewsletter(id);
}

export async function saveNewsletter(newsletter: Newsletter) {
  return dbSaveNewsletter(newsletter);
}

export async function deleteNewsletter(id: string) {
  return dbDeleteNewsletter(id);
}

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

// This is a placeholder for a real file upload implementation.
// In a real app, this would upload to a service like Google Cloud Storage.
export async function runUploadFile(fileDataUri: string, fileName: string) {
    console.log(`Faking upload for ${fileName}`);
    // In this JSON-file DB mode, we just return the data URI itself.
    // This is not efficient for large files but works for a local-only demo.
    await new Promise(resolve => setTimeout(resolve, 500)); // fake network delay
    return { url: fileDataUri };
}

export async function runExtractTextFromImage(imageDataUri: string) {
  try {
    const result = await extractTextFromImage({ imageDataUri });
    return result;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return { extractedText: '' };
  }
}
