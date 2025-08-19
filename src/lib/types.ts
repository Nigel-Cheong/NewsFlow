export interface ContentBlock {
  id: string;
  type:
    | 'text'
    | 'image-with-text'
    | 'video-with-text'
    | 'spacer'
    | 'table'
    | 'carousel'
    | 'event'
    | 'form'
    | 'announcement'
    | 'footer';
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  colspan?: 1 | 2;
  // Event-specific properties
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
}

export interface Newsletter {
  id: string;
  title: string;
  blocks: ContentBlock[];
  lastUpdated: string;
}

export interface FlaggedIssue {
  keyword: string;
  blockId: string;
}

export type ApprovalStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
