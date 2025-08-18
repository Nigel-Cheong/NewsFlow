import type { Newsletter } from './types';

export const mockNewsletter: Newsletter = {
  id: 'newsletter-1',
  title: 'Q3 Company Updates',
  blocks: [
    {
      id: 'block-1',
      type: 'text',
      content:
        "Welcome to the Q3 company update. This quarter has been pivotal for our growth. We've onboarded new talent and expanded our market reach significantly. The Project Alpha is proceeding on schedule, and we expect a beta launch next month.",
    },
    {
      id: 'block-2',
      type: 'image-with-text',
      content:
        "Our team came together for a successful offsite event. The event was focused on brainstorming for our next big project, codenamed 'Project Phoenix'. It's still confidential, so please don't share details externally.",
      imageUrl: 'https://placehold.co/600x400',
    },
    {
      id: 'block-3',
      type: 'bullet-points',
      content:
        "Key takeaways from Q3:\n- Successful launch of our new feature.\n- Exceeded our sales target by 15%.\n- Key financial data shows strong performance, but this is proprietary information.",
    },
  ],
};

// These are the keywords the AI will look for.
export const SENSITIVE_KEYWORDS = [
  'confidential',
  'proprietary',
  'Project Alpha',
  'Project Phoenix',
  'financial data',
  'secret',
];
