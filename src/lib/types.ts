export interface ContentBlock {
  id: string;
  type: 'text' | 'image-with-text' | 'bullet-points';
  content: string;
  imageUrl?: string;
}

export interface Newsletter {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface FlaggedIssue {
  keyword: string;
  blockId: string;
}

export type ApprovalStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
