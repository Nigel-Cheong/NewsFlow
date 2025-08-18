'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppHeader } from './app-header';
import { Editor } from './editor';
import { IssuesSidebar } from './issues-sidebar';
import type { ApprovalStatus, ContentBlock, FlaggedIssue, Newsletter } from '@/lib/types';
import { mockNewsletter, SENSITIVE_KEYWORDS } from '@/lib/mock-data';
import { runConfidentialityCheck, runSuggestLayout } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function AppLayout() {
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
    // Simulate fetching data
    setNewsletter(mockNewsletter);
    setHistory([mockNewsletter.blocks]);
    setHistoryIndex(0);
  }, []);
  
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
    const result = await runSuggestLayout(newsletter.blocks);
    toast({
      title: 'Layout Suggestion',
      description: `AI suggests using a "${result.layoutTemplate}" layout.`,
    });
    setIsSuggestingLayout(false);
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <main className="flex-1 flex flex-col">
          <Editor
            blocks={newsletter.blocks}
            setBlocks={(newBlocks) => updateBlocks(newBlocks)}
            flaggedKeywords={flaggedKeywords}
          />
        </main>
        <IssuesSidebar issues={flaggedIssues} isConfidential={isConfidential} />
      </div>
    </div>
  );
}
