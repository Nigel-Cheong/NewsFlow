
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ContentBlock } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { ArrowUp, ArrowDown, Trash2, Edit, Save, Ban, Calendar, MapPin, Clock } from 'lucide-react';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Label } from './ui/label';

interface ContentBlockProps {
  block: ContentBlock;
  flaggedKeywords: string[];
  onUpdate: (id: string, newContent: Partial<ContentBlock>) => void;
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
  const [editState, setEditState] = useState(block);

  const handleSave = () => {
    onUpdate(block.id, editState);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditState(block);
    setIsEditing(false);
  };
  
  const handleInputChange = (field: keyof ContentBlock, value: string) => {
    setEditState(prevState => ({...prevState, [field]: value}));
  }

  const highlightText = (text: string) => {
    if (!flaggedKeywords.length || !text) return text;
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
      const commonEditFields = (
        <>
           <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <Ban /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save /> Save
              </Button>
            </div>
        </>
      );
      
      switch (block.type) {
        case 'image-with-text':
          return (
             <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor={`imageUrl-${block.id}`}>Image URL</Label>
                  <Input id={`imageUrl-${block.id}`} value={editState.imageUrl} onChange={(e) => handleInputChange('imageUrl', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`content-${block.id}`}>Text</Label>
                  <Textarea id={`content-${block.id}`} value={editState.content} onChange={(e) => handleInputChange('content', e.target.value)} className="text-base min-h-[120px]" />
                </div>
                {commonEditFields}
             </div>
          )
        case 'video-with-text':
          return (
             <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor={`videoUrl-${block.id}`}>Video URL</Label>
                  <Input id={`videoUrl-${block.id}`} value={editState.videoUrl} onChange={(e) => handleInputChange('videoUrl', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`content-${block.id}`}>Text</Label>
                  <Textarea id={`content-${block.id}`} value={editState.content} onChange={(e) => handleInputChange('content', e.target.value)} className="text-base min-h-[120px]" />
                </div>
                {commonEditFields}
             </div>
          )
        case 'event':
          return (
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor={`title-${block.id}`}>Event Title</Label>
                <Input
                  id={`title-${block.id}`}
                  value={editState.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                />
              </div>
              <div>
                 <Label htmlFor={`date-${block.id}`}>Date</Label>
                 <Input
                  id={`date-${block.id}`}
                  value={editState.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                />
              </div>
              <div>
                 <Label htmlFor={`time-${block.id}`}>Time</Label>
                <Input
                  id={`time-${block.id}`}
                  value={editState.eventTime}
                  onChange={(e) => handleInputChange('eventTime', e.target.value)}
                />
              </div>
               <div>
                 <Label htmlFor={`location-${block.id}`}>Location</Label>
                <Input
                  id={`location-${block.id}`}
                  value={editState.eventLocation}
                  onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                />
              </div>
              {commonEditFields}
            </div>
          )
        case 'table':
        case 'carousel':
        case 'footer':
        case 'text':
        default:
           return (
            <div className="flex flex-col gap-2">
              <Textarea
                value={editState.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="text-base min-h-[120px]"
              />
              {commonEditFields}
            </div>
          );
      }
    }

    const contentWithHighlights = highlightText(block.content);

    switch (block.type) {
      case 'video-with-text':
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
      case 'spacer':
        return <div className="h-16 w-full" />;
      case 'table':
        return (
          <div>
             <h3 className="font-semibold text-lg mb-2">{contentWithHighlights}</h3>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Header 1</TableHead>
                  <TableHead>Header 2</TableHead>
                  <TableHead>Header 3</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Row 1, Cell 1</TableCell>
                  <TableCell>Row 1, Cell 2</TableCell>
                  <TableCell>Row 1, Cell 3</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>Row 2, Cell 1</TableCell>
                  <TableCell>Row 2, Cell 2</TableCell>
                  <TableCell>Row 2, Cell 3</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        );
      case 'carousel':
        return (
          <Carousel className="w-full">
            <CarouselContent>
              {Array.from({ length: 3 }).map((_, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="flex aspect-video items-center justify-center p-6 relative">
                       <Image src={`https://placehold.co/600x400?text=Slide+${index+1}`} alt={`Slide ${index+1}`} layout="fill" objectFit="cover" className="rounded-md" />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )
      case 'event':
        return (
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-lg">{contentWithHighlights}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{block.eventDate || 'Date not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{block.eventTime || 'Time not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{block.eventLocation || 'Location not set'}</span>
              </div>
            </CardContent>
          </Card>
        );
      case 'form':
        return (
          <div className="space-y-4">
             <h3 className="font-semibold text-lg">{contentWithHighlights}</h3>
             <div className="flex flex-col gap-2">
                <Input placeholder="Enter your name" />
                <Input type="email" placeholder="Enter your email" />
                <Button>Submit</Button>
             </div>
          </div>
        )
      case 'announcement':
        return (
            <Alert>
              <AlertTitle className="font-bold">Announcement!</AlertTitle>
              <AlertDescription>
                {contentWithHighlights}
              </AlertDescription>
            </Alert>
        )
      case 'footer':
         return (
            <div className="text-center text-xs text-muted-foreground border-t pt-4 mt-4">
              <p>{contentWithHighlights}</p>
              <p>© 2023 NewsGenius. All rights reserved.</p>
            </div>
         )
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
        {!isEditing && !['spacer'].includes(block.type) && (
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
