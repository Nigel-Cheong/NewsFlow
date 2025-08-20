
'use client';

import { ContentBlockView } from './content-block';
import type { ContentBlock } from '@/lib/types';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface EditorProps {
  blocks: ContentBlock[];
  flaggedSentences: string[];
  setBlocks: (blocks: ContentBlock[]) => void;
  onAddBlock: (type: ContentBlock['type']) => void;
}

export function Editor({ blocks, flaggedSentences, setBlocks, onAddBlock }: EditorProps) {
  const handleUpdateBlock = (id: string, newContent: Partial<ContentBlock>) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, ...newContent } : block
      )
    );
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  const handleMoveBlock = (id:string, direction: 'up' | 'down') => {
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    setBlocks(newBlocks);
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={block.colspan === 2 ? 'md:col-span-2' : 'md:col-span-1'}
          >
            <ContentBlockView
              block={block}
              flaggedSentences={flaggedSentences}
              onUpdate={handleUpdateBlock}
              onDelete={handleDeleteBlock}
              onMove={handleMoveBlock}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center col-span-1 md:col-span-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="mt-4">
              <PlusCircle />
              Add Content Block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => onAddBlock('header')}>
              Header
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAddBlock('text')}>
              Text
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => onAddBlock('image-with-text')}>
              Image with Text
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAddBlock('video-with-text')}>
              Video with Text
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAddBlock('link-with-text')}>
              Link with Text
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onAddBlock('announcement')}>
              Announcement
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => onAddBlock('event')}>
              Event
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => onAddBlock('table')}>
              Table
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAddBlock('carousel')}>
              Carousel
            </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem onSelect={() => onAddBlock('form')}>
              Form
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => onAddBlock('spacer')}>
              Spacer
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAddBlock('footer')}>
              Footer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
