
'use client';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import type { ContentBlock } from '@/lib/types';
import { PlusCircle, Wrench } from 'lucide-react';

interface ToolsSidebarProps {
  onAddBlock: (type: ContentBlock['type']) => void;
}

export function ToolsSidebar({ onAddBlock }: ToolsSidebarProps) {
  return (
    <Card className="w-full h-full flex flex-col rounded-none border-0 border-l border-b">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench />
          Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full">
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
      </CardContent>
    </Card>
  );
}
