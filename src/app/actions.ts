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
  const newsletterContent = content
    .map((block) => `Type: ${block.type}, Content: ${block.content}`)
    .join('\n\n');

  try {
    const result = await suggestLayout({ content: newsletterContent });
    return result;
  } catch (error) {
    console.error('Error in layout suggestion:', error);
    return { layout: [] };
  }
}
