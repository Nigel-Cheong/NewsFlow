
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
import { cn } from '@/lib/utils';

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

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="grid md:grid-cols-2 gap-4">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={cn('w-full', {
              'md:col-span-2': !block.colspan || block.colspan === 2,
              'md:col-span-1': block.colspan === 1,
            })}
          >
            <ContentBlockView
              block={block}
              flaggedSentences={flaggedSentences}
              onUpdate={handleUpdateBlock}
              onDelete={handleDeleteBlock}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
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
