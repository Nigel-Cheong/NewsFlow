
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ContentBlockView } from '@/components/content-block';
import type { Newsletter, ApprovalStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper, Send, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function PreviewHeader({ newsletter, onStatusChange }: { newsletter: Newsletter, onStatusChange: (status: ApprovalStatus) => void }) {

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
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shrink-0 sticky top-0 bg-opacity-80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
                <Newspaper className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">{newsletter.title}</h1>
                 <Badge variant={getStatusVariant(newsletter.status)} className="capitalize">
                    {newsletter.status}
                </Badge>
            </div>
            <div className='flex items-center gap-2'>
                {newsletter.status === 'Draft' && (
                    <Button onClick={() => onStatusChange('Pending Approval')}>
                        <Send />
                        Submit for Approval
                    </Button>
                )}
                 {newsletter.status === 'Pending Approval' && (
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
                {(newsletter.status === 'Approved' || newsletter.status === 'Rejected') && (
                    <Button onClick={() => onStatusChange('Draft')} variant="outline">
                        Revert to Draft
                    </Button>
                )}
                 <Link href={`/newsletters/${newsletter.id}`}>
                    <Button variant="outline">Back to Editor</Button>
                </Link>
            </div>
        </header>
    );
}


export default function NewsletterPreviewPage() {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const savedNewsletterJSON = localStorage.getItem(id);
      if (savedNewsletterJSON) {
        setNewsletter(JSON.parse(savedNewsletterJSON));
      }
    }
  }, [id]);

  const handleStatusChange = (newStatus: ApprovalStatus) => {
    if (!newsletter) return;

    const updatedNewsletter = { ...newsletter, status: newStatus };
    setNewsletter(updatedNewsletter);
    localStorage.setItem(newsletter.id, JSON.stringify(updatedNewsletter));
    
    // Dispatch a storage event to notify the editor page of the change
    window.dispatchEvent(new StorageEvent('storage', {
        key: newsletter.id,
        newValue: JSON.stringify(updatedNewsletter),
    }));

    toast({
        title: "Status Updated",
        description: `Newsletter status changed to "${newStatus}".`
    });

    if (newStatus === 'Approved') {
        setTimeout(() => router.push(`/newsletters/${id}`), 1000);
    }
  }

  if (!newsletter) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading newsletter preview...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-background min-h-screen">
      <PreviewHeader newsletter={newsletter} onStatusChange={handleStatusChange} />
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-4">
          {newsletter.blocks.map((block) => (
             <div 
                key={block.id}
                className={cn('w-full', {
                    'md:col-span-2': !block.colspan || block.colspan === 2,
                    'md:col-span-1': block.colspan === 1,
                })}
              >
                <ContentBlockView
                    block={block}
                    blocks={newsletter.blocks}
                    setBlocks={(newBlocks) => {
                        const updatedNewsletter = {...newsletter, blocks: newBlocks};
                        setNewsletter(updatedNewsletter);
                        localStorage.setItem(newsletter.id, JSON.stringify(updatedNewsletter));
                    }}
                    flaggedSentences={[]}
                />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
