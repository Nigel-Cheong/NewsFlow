
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
  flaggedKeywords: string[];
  setBlocks: (blocks: ContentBlock[]) => void;
}

export function Editor({ blocks, flaggedKeywords, setBlocks }: EditorProps) {
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
  
  const handleAddBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: `New ${type.replace(/-/g, ' ')} block...`,
      colspan: 2, // Default to full-width
    };

    switch (type) {
        case 'header':
            newBlock.content = 'Newsletter Title';
            newBlock.subtitle = 'A catchy subtitle for your newsletter';
            newBlock.imageUrl = 'https://placehold.co/1200x400';
            newBlock.colspan = 2;
            break;
        case 'image-with-text':
            newBlock.imageUrl = 'https://placehold.co/600x400';
            break;
        case 'video-with-text':
            newBlock.videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
            newBlock.content = 'A short video with text.'
            break;
        case 'link-with-text':
            newBlock.linkUrl = 'https://google.com';
            newBlock.content = 'Click here to learn more';
            newBlock.colspan = 2;
            break;
        case 'spacer':
            newBlock.content = '';
            newBlock.colspan = 2;
            break;
        case 'table':
            newBlock.content = 'Data Table';
            newBlock.colspan = 2;
            newBlock.tableData = [
                ['Header 1', 'Header 2', 'Header 3'],
                ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
                ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3'],
            ]
            break;
        case 'carousel':
            newBlock.content = '';
            newBlock.colspan = 2;
            break;
        case 'event':
            newBlock.content = 'Company Offsite';
            newBlock.colspan = 1;
            newBlock.eventDate = 'October 26, 2023';
            newBlock.eventTime = '10:00 AM - 4:00 PM';
            newBlock.eventLocation = 'Virtual Event';
            break;
        case 'form':
            newBlock.content = 'Sign up for our newsletter';
            newBlock.colspan = 1;
            break;
        case 'announcement':
            newBlock.content = 'A new feature is launching next week!';
            newBlock.colspan = 2;
            break;
         case 'footer':
            newBlock.content = 'Contact us at contact@newsgenius.com';
            newBlock.colspan = 2;
            break;
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
            <DropdownMenuItem onSelect={() => handleAddBlock('header')}>
              Header
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddBlock('text')}>
              Text
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => handleAddBlock('image-with-text')}>
              Image with Text
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddBlock('video-with-text')}>
              Video with Text
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddBlock('link-with-text')}>
              Link with Text
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleAddBlock('announcement')}>
              Announcement
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => handleAddBlock('event')}>
              Event
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => handleAddBlock('table')}>
              Table
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddBlock('carousel')}>
              Carousel
            </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem onSelect={() => handleAddBlock('form')}>
              Form
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => handleAddBlock('spacer')}>
              Spacer
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddBlock('footer')}>
              Footer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
