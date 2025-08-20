
'use client';

import type { ApprovalStatus } from '@/lib/types';
import {
  Newspaper,
  Undo,
  Redo,
  LayoutTemplate,
  Send,
  Check,
  X,
  Loader2,
  Save,
  Eye,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import Link from 'next/link';

interface AppHeaderProps {
  newsletterId: string;
  title: string;
  status: ApprovalStatus;
  onStatusChange: (newStatus: ApprovalStatus) => void;
  onSuggestLayout: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSuggestingLayout: boolean;
}

export function AppHeader({
  newsletterId,
  title,
  status,
  onStatusChange,
  onSuggestLayout,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSuggestingLayout,
}: AppHeaderProps) {
  const getStatusVariant = (
    status: ApprovalStatus
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Approved':
        return 'default';
      case 'Pending Approval':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      case 'Draft':
      default:
        return 'outline';
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <Newspaper className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">
              <span style={{ color: '#d9432f' }}>N</span>
              <span style={{ color: '#176ced' }}>e</span>
              <span style={{ color: '#ffb700' }}>w</span>
              <span style={{ color: '#009a57' }}>s</span>
              <span style={{ color: '#d9432f' }}>F</span>
              <span style={{ color: '#176ced' }}>l</span>
              <span style={{ color: '#ffb700' }}>o</span>
              <span style={{ color: '#009a57' }}>w</span>
        </h1>
        <Badge variant={getStatusVariant(status)} className="capitalize">
          {status}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onUndo} disabled={!canUndo} className="h-9 w-9">
          <Undo />
          <span className="sr-only">Undo</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onRedo} disabled={!canRedo} className="h-9 w-9">
          <Redo />
          <span className="sr-only">Redo</span>
        </Button>
        <Button variant="outline" onClick={onSuggestLayout} disabled={isSuggestingLayout} size="sm">
          {isSuggestingLayout ? (
            <Loader2 className="animate-spin" />
          ) : (
            <LayoutTemplate />
          )}
          Suggest Layout
        </Button>
        <Button onClick={onSave} size="sm">
            <Save />
            Save
        </Button>
        
        <Link href={`/newsletters/${newsletterId}/preview`} target="_blank">
          <Button size="sm">
            <Eye />
            Preview
          </Button>
        </Link>
        
        {status === 'Draft' && (
            <Button onClick={() => onStatusChange('Pending Approval')} size="sm">
              <Send />
              Submit for Approval
            </Button>
        )}

        {status === 'Pending Approval' && (
          <>
            <Button onClick={() => onStatusChange('Approved')} variant="default" size="sm">
              <Check />
              Approve
            </Button>
            <Button onClick={() => onStatusChange('Rejected')} variant="destructive" size="sm">
              <X />
              Reject
            </Button>
          </>
        )}
        {(status === 'Approved' || status === 'Rejected') && (
           <Button onClick={() => onStatusChange('Draft')} variant="outline" size="sm">
            Revert to Draft
          </Button>
        )}
      </div>
    </header>
  );
}
