'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppHeader } from './app-header';
import { Editor } from './editor';
import { IssuesSidebar } from './issues-sidebar';
import type { ApprovalStatus, ContentBlock, FlaggedIssue, Newsletter } from '@/lib/types';
import { mockNewsletters, SENSITIVE_KEYWORDS } from '@/lib/mock-data';
import { runConfidentialityCheck, runSuggestLayout } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PanelRightOpen, PanelRightClose } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

interface AppLayoutProps {
  newsletterId: string;
}

export function AppLayout({ newsletterId }: AppLayoutProps) {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('Draft');
  const [flaggedKeywords, setFlaggedKeywords] = useState<string[]>([]);
  const [isConfidential, setIsConfidential] = useState(false);
  const [isSuggestingLayout, setIsSuggestingLayout] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [history, setHistory] = useState<ContentBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { toast } = useToast();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Simulate fetching data for a specific newsletter
    const foundNewsletter = mockNewsletters.find(n => n.id === newsletterId);
    if (foundNewsletter) {
      setNewsletter(foundNewsletter);
      setHistory([foundNewsletter.blocks]);
      setHistoryIndex(0);
    }
  }, [newsletterId]);
  
  const updateBlocks = (newBlocks: ContentBlock[], fromHistory = false) => {
    if (!newsletter) return;
    
    setNewsletter({ ...newsletter, blocks: newBlocks });
    
    if (!fromHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newBlocks);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      updateBlocks(history[newIndex], true);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      updateBlocks(history[newIndex], true);
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
        const newBlocks = result.layout.flat().map((block, index) => ({
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
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isSuggestingLayout={isSuggestingLayout}
      />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          <Editor
            blocks={newsletter.blocks}
            setBlocks={(newBlocks) => updateBlocks(newBlocks)}
            flaggedKeywords={flaggedKeywords}
          />
        </main>
        <div className="flex">
          <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-96' : 'w-0'}`}>
            <IssuesSidebar issues={flaggedIssues} isConfidential={isConfidential} isOpen={isSidebarOpen}/>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-10 w-10 shrink-0 self-start mt-2"
          >
            {isSidebarOpen ? <PanelRightClose /> : <PanelRightOpen />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
