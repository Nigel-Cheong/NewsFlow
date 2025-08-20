
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
        <h1 className="text-xl font-semibold">{title}</h1>
        <Badge variant={getStatusVariant(status)} className="capitalize">
          {status}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onUndo} disabled={!canUndo}>
          <Undo />
          <span className="sr-only">Undo</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onRedo} disabled={!canRedo}>
          <Redo />
          <span className="sr-only">Redo</span>
        </Button>
        <Button variant="outline" onClick={onSuggestLayout} disabled={isSuggestingLayout}>
          {isSuggestingLayout ? (
            <Loader2 className="animate-spin" />
          ) : (
            <LayoutTemplate />
          )}
          Suggest Layout
        </Button>
        <Button onClick={onSave}>
            <Save />
            Save
        </Button>
        
        <Link href={`/newsletters/${newsletterId}/preview`} target="_blank">
          <Button>
            <Eye />
            Preview
          </Button>
        </Link>

        {status === 'Pending Approval' && (
          <>
            <Button onClick={() => onStatusChange('Approved')} variant="default">
              <Check />
              Approve
            </Button>
            <Button onClick={() => onStatusChange('Rejected')} variant="destructive">
              <X />
              Reject
            </Button>
          </>
        )}
        {(status === 'Approved' || status === 'Rejected') && (
           <Button onClick={() => onStatusChange('Draft')} variant="outline">
            Revert to Draft
          </Button>
        )}
      </div>
    </header>
  );
}
