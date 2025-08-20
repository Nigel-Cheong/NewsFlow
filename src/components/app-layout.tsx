
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppHeader } from './app-header';
import { Editor } from './editor';
import { SourcesSidebar } from './sources-sidebar';
import { ChatSidebar } from './chat-sidebar';
import type { ApprovalStatus, ContentBlock, FlaggedIssue, Newsletter, Source } from '@/lib/types';
import { mockNewsletters, SENSITIVE_KEYWORDS } from '@/lib/mock-data';
import { runConfidentialityCheck, runSuggestLayout, runGenerateBlocks } from '@/app/actions';
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
  const [flaggedIssues, setFlaggedIssues] = useState<FlaggedIssue[]>([]);
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
      setHistory([initialNewsletter.blocks]);
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

  const handleUpdateBlockContent = (blockId: string, newContent: string) => {
    if (!newsletter) return;
    const newBlocks = newsletter.blocks.map(block =>
        block.id === blockId ? { ...block, content: newContent } : block
    );
    updateBlocks(newBlocks);
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
    const issues = result.flaggedItems.map(item => {
        const block = content.find(b => b.id === item.blockId);
        return { ...item, blockTitle: block?.title };
    });
    setFlaggedIssues(issues);
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
        updateBlocks(result.layout.map((block, index) => ({...block, id: `block-${Date.now()}-${index}`})));
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
  
  const handleAddNewSource = async (source: Source) => {
      if (!newsletter || !source.content) return;
      
      toast({
        title: "Generating Content...",
        description: "The AI is processing the new source. Please wait."
      });
      
      let textToProcess = source.content;
      if (source.type === 'image') {
          textToProcess = `[IMAGE: ${source.name}]`;
      }


      try {
        const result = await runGenerateBlocks(textToProcess);
        if (result.blocks && result.blocks.length > 0) {
            const newContentBlocks: ContentBlock[] = result.blocks.map((block, index) => {
                const newBlock = {...block, id: `block-${Date.now()}-${index}`, colspan: 2};
                if (newBlock.type === 'image-with-text') {
                    newBlock.imageUrl = source.content; 
                }
                return newBlock;
            });
            
            const footerIndex = newsletter.blocks.findIndex(b => b.type === 'footer');
            const insertionPoint = footerIndex !== -1 ? footerIndex : newsletter.blocks.length;

            const newBlocks = [...newsletter.blocks];
            newBlocks.splice(insertionPoint, 0, ...newContentBlocks);
            
            updateBlocks(newBlocks);

            let sourceName = source.name;
            if (source.type === 'text' && source.name === 'Pasted Text') {
                const textSourceCount = (newsletter.sources?.filter(s => s.name.startsWith('Pasted Text')).length || 0) + 1;
                sourceName = `Pasted Text ${textSourceCount}`;
            }

            const newSources = [...(newsletter.sources || []), { name: sourceName, type: source.type }];
            setNewsletter({...newsletter, blocks: newBlocks, sources: newSources });

            toast({
                title: "Content Added!",
                description: `New content from "${sourceName}" has been added to your newsletter.`,
            });

        } else {
             toast({
                title: "AI Generation Failed",
                description: "Could not generate content from the new source.",
                variant: "destructive"
            });
        }
      } catch (error) {
        console.error("Failed to generate blocks from new source", error);
        toast({
            title: "An Error Occurred",
            description: "Could not process the new source.",
            variant: "destructive"
        });
      }
  }

  const handleDeleteSource = (sourceNameToDelete: string) => {
      if (!newsletter) return;
      const newSources = (newsletter.sources || []).filter(s => s.name !== sourceNameToDelete);
      setNewsletter({...newsletter, sources: newSources});
  }

  const handleUpdateSource = (originalName: string, newName: string) => {
      if (!newsletter) return;
      const newSources = (newsletter.sources || []).map(s => 
          s.name === originalName ? {...s, name: newName } : s
      );
      setNewsletter({...newsletter, sources: newSources});
  }

  const handleDeleteSentence = (blockId: string, sentenceToDelete: string) => {
      if (!newsletter) return;
      const newBlocks = newsletter.blocks.map(block => {
          if (block.id === blockId) {
              return { ...block, content: block.content.replace(sentenceToDelete, '') };
          }
          return block;
      });
      updateBlocks(newBlocks);
      toast({
        title: "Sentence Removed",
        description: "The selected sentence has been deleted from the content block."
      });
  };

  const handleDeleteAllSentences = () => {
    if (!newsletter || flaggedIssues.length === 0) return;

    let blocksToUpdate = [...newsletter.blocks];
    
    flaggedIssues.forEach(issue => {
        blocksToUpdate = blocksToUpdate.map(block => {
            if (block.id === issue.blockId) {
                return { ...block, content: block.content.replace(issue.sentence, '') };
            }
            return block;
        });
    });

    updateBlocks(blocksToUpdate);
    toast({
        title: "All Flagged Sentences Removed",
        description: `${flaggedIssues.length} sentences have been deleted from the newsletter.`
    });
  };

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
            <ResizablePanel defaultSize={20} minSize={20}>
                <SourcesSidebar
                    sources={newsletter.sources || []}
                    issues={flaggedIssues}
                    isConfidential={isConfidential}
                    onAddNewSource={handleAddNewSource}
                    onDeleteSource={handleDeleteSource}
                    onUpdateSource={handleUpdateSource}
                    onDeleteSentence={handleDeleteSentence}
                    onDeleteAllSentences={handleDeleteAllSentences}
                />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={55} minSize={30}>
                <main className="flex-1 flex flex-col transition-all duration-300 ease-in-out h-full">
                  <Editor
                    blocks={newsletter.blocks}
                    setBlocks={(newBlocks) => updateBlocks(newBlocks)}
                    flaggedSentences={flaggedIssues.map(issue => issue.sentence)}
                  />
                </main>
            </ResizablePanel>
            <ResizableHandle withHandle />
             <ResizablePanel defaultSize={25} minSize={15}>
                <ChatSidebar 
                  newsletterContent={newsletter.blocks} 
                  onApplySuggestion={handleUpdateBlockContent}
                />
            </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
