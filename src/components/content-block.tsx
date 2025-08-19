'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ContentBlock } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { ArrowUp, ArrowDown, Trash2, Edit, Save, Ban } from 'lucide-react';

interface ContentBlockProps {
  block: ContentBlock;
  flaggedKeywords: string[];
  onUpdate: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

export function ContentBlockView({
  block,
  flaggedKeywords,
  onUpdate,
  onDelete,
  onMove,
  isFirst,
  isLast,
}: ContentBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(block.content);

  const handleSave = () => {
    onUpdate(block.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(block.content);
    setIsEditing(false);
  };

  const highlightText = (text: string) => {
    if (!flaggedKeywords.length) return text;
    const regex = new RegExp(`(${flaggedKeywords.join('|')})`, 'gi');
    return text.split(regex).map((part, i) =>
      flaggedKeywords.some(kw => kw.toLowerCase() === part.toLowerCase()) ? (
        <mark key={i} className="bg-accent/30 rounded px-1 py-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="flex flex-col gap-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="text-base min-h-[120px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <Ban /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save /> Save
            </Button>
          </div>
        </div>
      );
    }

    const contentWithHighlights = highlightText(block.content);

    switch (block.type) {
      case 'video':
        return (
           <div>
            {block.videoUrl && (
              <video
                src={block.videoUrl}
                controls
                className="rounded-md w-full aspect-video"
              />
            )}
            <p className="text-muted-foreground text-sm mt-2">{contentWithHighlights}</p>
          </div>
        );
      case 'image-with-text':
        return (
          <div className="flex gap-4 items-start">
            {block.imageUrl && (
              <div className="w-1/3 shrink-0">
                <Image
                  src={block.imageUrl}
                  alt="Newsletter image"
                  width={200}
                  height={133}
                  className="rounded-md object-cover aspect-[3/2]"
                  data-ai-hint="teamwork collaboration"
                />
              </div>
            )}
            <p className="text-muted-foreground whitespace-pre-wrap">{contentWithHighlights}</p>
          </div>
        );
      case 'text':
      default:
        return <p className="text-muted-foreground whitespace-pre-wrap">{contentWithHighlights}</p>;
    }
  };

  return (
    <Card className="relative group/block">
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
        {!isEditing && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
            </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMove(block.id, 'up')} disabled={isFirst}>
          <ArrowUp className="h-4 w-4" />
          <span className="sr-only">Move Up</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMove(block.id, 'down')} disabled={isLast}>
          <ArrowDown className="h-4 w-4" />
          <span className="sr-only">Move Down</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(block.id)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </Card>
  );
}
