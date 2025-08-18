'use server';

import { confidentialityCheck } from '@/ai/flows/confidentiality-check';
import { suggestLayout } from '@/ai/flows/layout-auto-selection';
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
  const newsletterContent = content.map((block) => block.content).join('\n\n');
  const contentType = content.some((block) => block.imageUrl)
    ? 'image-with-text'
    : 'text-only';

  try {
    const result = await suggestLayout({ contentType, content: newsletterContent });
    return result;
  } catch (error) {
    console.error('Error in layout suggestion:', error);
    return { layoutTemplate: 'Could not generate suggestion.' };
  }
}
