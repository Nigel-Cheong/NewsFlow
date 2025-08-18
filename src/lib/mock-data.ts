import type { Newsletter } from './types';

export const mockNewsletters: Newsletter[] = [
  {
    id: 'newsletter-1',
    title: 'Q3 Company Updates',
    lastUpdated: '2 days ago',
    blocks: [
      {
        id: 'block-1-1',
        type: 'text',
        content:
          "Welcome to the Q3 company update. This quarter has been pivotal for our growth. We've onboarded new talent and expanded our market reach significantly. The Project Alpha is proceeding on schedule, and we expect a beta launch next month.",
      },
      {
        id: 'block-1-2',
        type: 'image-with-text',
        content:
          "Our team came together for a successful offsite event. The event was focused on brainstorming for our next big project, codenamed 'Project Phoenix'. It's still confidential, so please don't share details externally.",
        imageUrl: 'https://placehold.co/600x400',
      },
      {
        id: 'block-1-3',
        type: 'bullet-points',
        content:
          "Key takeaways from Q3:\n- Successful launch of our new feature.\n- Exceeded our sales target by 15%.\n- Key financial data shows strong performance, but this is proprietary information.",
      },
    ],
  },
  {
    id: 'newsletter-2',
    title: 'New Product Launch Announcement',
    lastUpdated: '5 days ago',
    blocks: [
        {
            id: 'block-2-1',
            type: 'text',
            content: "We are thrilled to announce the launch of our new product, 'InnovateX'. This product will revolutionize the market with its cutting-edge features and user-friendly design."
        }
    ]
  },
  {
    id: 'newsletter-3',
    title: 'Monthly Engineering Report',
    lastUpdated: '1 week ago',
    blocks: [
        {
            id: 'block-3-1',
            type: 'text',
            content: "This month's engineering report highlights our progress on the core platform. We've closed over 50 tickets and improved performance by 10%."
        }
    ]
  }
];


// These are the keywords the AI will look for.
export const SENSITIVE_KEYWORDS = [
  'confidential',
  'proprietary',
  'Project Alpha',
  'Project Phoenix',
  'financial data',
  'secret',
];
