
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
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

interface EditorProps {
  blocks: ContentBlock[];
  flaggedSentences: string[];
  setBlocks: (blocks: ContentBlock[]) => void;
  onAddBlock: (type: ContentBlock['type']) => void;
}

function DraggableContentBlock({ block, flaggedSentences, onUpdate, onDelete, isFirst, isLast }: {
  block: ContentBlock;
  flaggedSentences: string[];
  onUpdate: (id: string, newContent: Partial<ContentBlock>) => void;
  onDelete: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({id: block.id});
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <ContentBlockView
          block={block}
          flaggedSentences={flaggedSentences}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isFirst={isFirst}
          isLast={isLast}
          dragHandleProps={listeners}
        />
      </div>
    );
}


export function Editor({ blocks, flaggedSentences, setBlocks, onAddBlock }: EditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    })
  );

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
  
  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      
      setBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext
          items={blocks.map(b => b.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className={block.colspan === 2 ? 'md:col-span-2' : 'md:col-span-1'}
              >
                <DraggableContentBlock
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
        </SortableContext>
      </DndContext>

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
