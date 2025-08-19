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
} from './ui/dropdown-menu';

interface EditorProps {
  blocks: ContentBlock[];
  flaggedKeywords: string[];
  setBlocks: (blocks: ContentBlock[]) => void;
}

export function Editor({ blocks, flaggedKeywords, setBlocks }: EditorProps) {
  const handleUpdateBlock = (id: string, newContent: string) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, content: newContent } : block
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
  
  const handleAddBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: `New ${type.replace('-', ' ')} block...`,
      colspan: 2, // Default to full-width
    };
    if (type === 'image-with-text') {
      newBlock.imageUrl = 'https://placehold.co/600x400';
    }
    if (type === 'video') {
      // Using a placeholder video
      newBlock.videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
      newBlock.content = 'A short video.'
    }
    setBlocks([...blocks, newBlock]);
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
              flaggedKeywords={flaggedKeywords}
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
            <DropdownMenuItem onSelect={() => handleAddBlock('text')}>
              Text
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => handleAddBlock('video')}>
              Video
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddBlock('image-with-text')}>
              Image with Text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
