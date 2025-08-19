
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppHeader } from './app-header';
import { Editor } from './editor';
import { SourcesSidebar } from './sources-sidebar';
import { ChatSidebar } from './chat-sidebar';
import type { ApprovalStatus, ContentBlock, FlaggedIssue, Newsletter } from '@/lib/types';
import { mockNewsletters, SENSITIVE_KEYWORDS } from '@/lib/mock-data';
import { runConfidentialityCheck, runSuggestLayout } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface AppLayoutProps {
  newsletterId: string;
}

export function AppLayout({ newsletterId }: AppLayoutProps) {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('Draft');
  const [flaggedKeywords, setFlaggedKeywords] = useState<string[]>([]);
  const [isConfidential, setIsConfidential] = useState(false);
  const [isSuggestingLayout, setIsSuggestingLayout] = useState(false);
  
  const [history, setHistory] = useState<ContentBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { toast } = useToast();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load from localStorage first, then fallback to mock data
    const savedNewsletterJSON = localStorage.getItem(newsletterId);
    let initialNewsletter: Newsletter | undefined;

    if (savedNewsletterJSON) {
      initialNewsletter = JSON.parse(savedNewsletterJSON);
    } else {
      initialNewsletter = mockNewsletters.find(n => n.id === newsletterId);
    }

    if (initialNewsletter) {
      setNewsletter(initialNewsletter);
      const initialBlocks = initialNewsletter.blocks.map(b => ({ ...b, colspan: b.colspan || 1 }));
      setHistory([initialBlocks]);
      setHistoryIndex(0);
    }
  }, [newsletterId]);
  
  const updateBlocks = (newBlocks: ContentBlock[], fromHistory = false) => {
    if (!newsletter) return;
    
    // Ensure all blocks have a colspan
    const blocksWithColspan = newBlocks.map(b => ({ ...b, colspan: b.colspan || 1 }));
    
    setNewsletter({ ...newsletter, blocks: blocksWithColspan });
    
    if (!fromHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(blocksWithColspan);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      // The history already contains blocks with colspans
      setNewsletter(prev => prev ? { ...prev, blocks: history[newIndex] } : null);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
       // The history already contains blocks with colspans
      setNewsletter(prev => prev ? { ...prev, blocks: history[newIndex] } : null);
    }
  };

  const checkConfidentiality = useCallback(async (content: ContentBlock[]) => {
    const result = await runConfidentialityCheck(content, SENSITIVE_KEYWORDS);
    setFlaggedKeywords(result.flaggedKeywords);
    setIsConfidential(result.isConfidential);
  }, []);

  useEffect(() => {
    if (newsletter?.blocks) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        checkConfidentiality(newsletter.blocks);
      }, 500);
    }
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [newsletter?.blocks, checkConfidentiality]);

  const handleSuggestLayout = async () => {
    if (!newsletter?.blocks) return;
    setIsSuggestingLayout(true);
    try {
      const result = await runSuggestLayout(newsletter.blocks);
      if (result.layout && result.layout.length > 0) {
        const newBlocks = result.layout.map((block, index) => ({
          ...block,
          id: `block-${Date.now()}-${index}`,
        }));
        updateBlocks(newBlocks);
        toast({
          title: 'Layout Updated',
          description: 'The content has been automatically arranged into a new layout.',
        });
      } else {
        toast({
          title: 'Layout Suggestion Failed',
          description: 'Could not generate a new layout. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error suggesting layout:', error);
      toast({
        title: 'An Error Occurred',
        description: 'Failed to suggest a new layout. Please check the console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggestingLayout(false);
    }
  };
  
  const handleStatusChange = (newStatus: ApprovalStatus) => {
    setApprovalStatus(newStatus);
    toast({
        title: "Status Updated",
        description: `Newsletter status changed to "${newStatus}".`
    });
  }

  const handleSave = () => {
    if (!newsletter) {
      toast({
        title: "Save Failed",
        description: "No newsletter data to save.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatedNewsletter = {
        ...newsletter,
        lastUpdated: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
      };
      
      localStorage.setItem(newsletter.id, JSON.stringify(updatedNewsletter));
      
      setNewsletter(updatedNewsletter);

      toast({
          title: "Changes Saved!",
          description: "Your newsletter has been successfully saved to your browser.",
      });
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      toast({
        title: "Save Failed",
        description: "Could not save changes. Your browser might not support localStorage or it's full.",
        variant: "destructive"
      });
    }
  }

  const flaggedIssues: FlaggedIssue[] = newsletter?.blocks.flatMap(block => 
    flaggedKeywords
      .filter(kw => new RegExp(`\\b${kw}\\b`, 'i').test(block.content))
      .map(kw => ({ keyword: kw, blockId: block.id }))
  )
  .filter((issue, index, self) => 
    index === self.findIndex(t => (
      t.keyword === issue.keyword && t.blockId === issue.blockId
    ))
  ) || [];

  if (!newsletter) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading newsletter...</p>
        <Link href="/">
            <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        title={newsletter.title}
        status={approvalStatus}
        onStatusChange={handleStatusChange}
        onSuggestLayout={handleSuggestLayout}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isSuggestingLayout={isSuggestingLayout}
      />
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15}>
                <SourcesSidebar
                    issues={flaggedIssues}
                    isConfidential={isConfidential}
                />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={55} minSize={30}>
                <main className="flex-1 flex flex-col transition-all duration-300 ease-in-out h-full">
                  <Editor
                    blocks={newsletter.blocks}
                    setBlocks={(newBlocks) => updateBlocks(newBlocks)}
                    flaggedKeywords={flaggedKeywords}
                  />
                </main>
            </ResizablePanel>
            <ResizableHandle withHandle />
             <ResizablePanel defaultSize={25} minSize={15}>
                <ChatSidebar />
            </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
