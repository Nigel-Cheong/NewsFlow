
import { z } from 'zod';

export const ContentBlockSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  type: z.enum([
    'text',
    'image-with-text',
    'video-with-text',
    'spacer',
    'table',
    'carousel',
    'event',
    'form',
    'announcement',
    'footer',
    'link-with-text',
    'header',
  ]),
  content: z.string(),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  colspan: z.union([z.literal(1), z.literal(2)]).optional(),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  eventLocation: z.string().optional(),
  tableData: z.array(z.array(z.string())).optional(),
});

export type ContentBlock = z.infer<typeof ContentBlockSchema>;

export const SourceSchema = z.object({
    name: z.string(),
    type: z.enum(['file', 'link', 'text', 'gdrive', 'image']),
    content: z.string(), // Raw content for processing
});

export type Source = z.infer<typeof SourceSchema>;

export interface Newsletter {
  id: string;
  title: string;
  blocks: ContentBlock[];
  lastUpdated: string;
  sources?: Omit<Source, 'content'>[];
}

export interface FlaggedIssue {
  keyword: string;
  blockId: string;
  blockTitle?: string;
}

export type ApprovalStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
