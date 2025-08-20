
'use client';

import { useState } from 'react';
import type { ApprovalStatus, Newsletter } from '@/lib/types';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendApprovalEmail } from '@/app/actions';

interface ApprovalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (email: string) => Promise<void>;
}

function ApprovalDialog({ isOpen, onOpenChange, onSubmit }: ApprovalDialogProps) {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async () => {
        setIsSending(true);
        await onSubmit(email);
        setIsSending(false);
        onOpenChange(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit for Approval</DialogTitle>
                    <DialogDescription>
                        Enter the email of the person you want to send this newsletter to for approval.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                        Email
                        </Label>
                        <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="col-span-3"
                        placeholder="approver@example.com"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSending || !email}>
                        {isSending ? <Loader2 className="animate-spin" /> : <Send />}
                        Send for Approval
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


interface AppHeaderProps {
  newsletter: Newsletter;
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
  newsletter,
  onStatusChange,
  onSuggestLayout,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSuggestingLayout,
}: AppHeaderProps) {
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const { toast } = useToast();
  
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
  
  const handleEmailSubmit = async (email: string) => {
    try {
      await sendApprovalEmail(email, newsletter);
      onStatusChange('Pending Approval');
      toast({
        title: 'Approval Request Sent',
        description: `The newsletter has been sent to ${email} for approval.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to Send Email',
        description: 'Could not send the approval request. Please try again.',
        variant: 'destructive',
      });
    }
  };


  return (
    <>
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-4">
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
        </Link>
        <Badge variant={getStatusVariant(newsletter.status)} className="capitalize">
          {newsletter.status}
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
        
        <Link href={`/newsletters/${newsletter.id}/preview`} target="_blank">
          <Button size="sm">
            <Eye />
            Preview
          </Button>
        </Link>
        
        {newsletter.status === 'Draft' && (
            <Button onClick={() => setIsApprovalDialogOpen(true)} size="sm">
              <Send />
              Submit for Approval
            </Button>
        )}

        {newsletter.status === 'Pending Approval' && (
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
        {(newsletter.status === 'Approved' || newsletter.status === 'Rejected') && (
           <Button onClick={() => onStatusChange('Draft')} variant="outline" size="sm">
            Revert to Draft
          </Button>
        )}
      </div>
    </header>
     <ApprovalDialog 
        isOpen={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
        onSubmit={handleEmailSubmit}
      />
    </>
  );
}
