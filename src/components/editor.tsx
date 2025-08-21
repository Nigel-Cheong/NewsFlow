
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

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="grid md:grid-cols-2 gap-4">
        {blocks.map((block) => (
          <div
            key={block.id}
            className={cn('w-full', {
              'md:col-span-2': !block.colspan || block.colspan === 2,
              'md:col-span-1': block.colspan === 1,
            })}
          >
            <ContentBlockView
              block={block}
              blocks={blocks}
              setBlocks={setBlocks}
              flaggedSentences={flaggedSentences}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="mt-4">
              <PlusCircle />
              Add Content Block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onAddBlock('header')}>
              Header
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddBlock('text')}>
              Text
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => onAddBlock('image-with-text')}>
              Image with Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddBlock('video-with-text')}>
              Video with Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddBlock('link-with-text')}>
              Link with Text
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAddBlock('announcement')}>
              Announcement
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => onAddBlock('event')}>
              Event
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => onAddBlock('table')}>
              Table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddBlock('carousel')}>
              Carousel
            </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => onAddBlock('form')}>
              Form
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => onAddBlock('spacer')}>
              Spacer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddBlock('footer')}>
              Footer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

    