
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ContentBlock } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { ArrowUp, ArrowDown, Trash2, Edit, Save, Ban, Calendar, MapPin, Clock, Link, Upload, PlusCircle, MinusCircle, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

interface ContentBlockProps {
  block: ContentBlock;
  flaggedSentences: string[];
  onUpdate: (id: string, newContent: Partial<ContentBlock>) => void;
  onDelete: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  dragHandleProps?: any;
}

export function ContentBlockView({
  block,
  flaggedSentences,
  onUpdate,
  onDelete,
  isFirst,
  isLast,
  dragHandleProps,
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
  
  const handleInputChange = (field: keyof ContentBlock, value: any) => {
    setEditState(prevState => ({...prevState, [field]: value}));
  }

  const handleFileChange = (field: 'imageUrl' | 'videoUrl') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(field, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTableChange = (rowIndex: number, colIndex: number, value: string) => {
    const newTableData = [...(editState.tableData || [])];
    newTableData[rowIndex][colIndex] = value;
    handleInputChange('tableData', newTableData);
  }

  const handleAddRow = () => {
    const newTableData = [...(editState.tableData || [])];
    const numCols = newTableData[0]?.length || 1;
    newTableData.push(Array(numCols).fill(''));
    handleInputChange('tableData', newTableData);
  }

  const handleRemoveRow = () => {
    const newTableData = [...(editState.tableData || [])];
    if (newTableData.length > 1) {
      newTableData.pop();
      handleInputChange('tableData', newTableData);
    }
  }

  const handleAddCol = () => {
    const newTableData = (editState.tableData || []).map(row => [...row, '']);
    handleInputChange('tableData', newTableData);
  }

  const handleRemoveCol = () => {
    if ((editState.tableData?.[0]?.length ?? 0) <= 1) return;
    const newTableData = (editState.tableData || []).map(row => {
      const newRow = [...row];
      newRow.pop();
      return newRow;
    });
    handleInputChange('tableData', newTableData);
  }

  const highlightText = (text: string) => {
    if (!flaggedSentences.length || !text) return text;
    // Create a regex that matches any of the flagged sentences.
    const regex = new RegExp(`(${flaggedSentences.map(s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'gi');
    
    return text.split(regex).map((part, i) =>
      flaggedSentences.some(s => s.toLowerCase() === part.toLowerCase()) ? (
        <mark key={i} className="bg-accent/30 rounded px-1 py-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  
  const commonTitleField = (
      <div className="mb-4">
        <Label htmlFor={`title-${block.id}`}>Block Title</Label>
        <Input id={`title-${block.id}`} value={editState.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="e.g., Section Header" />
      </div>
  );

  const renderEditingContent = () => {
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
        case 'header':
          return (
             <div className="flex flex-col gap-4">
                {commonTitleField}
                <div>
                  <Label htmlFor={`content-${block.id}`}>Title</Label>
                  <Input id={`content-${block.id}`} value={editState.content} onChange={(e) => handleInputChange('content', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`subtitle-${block.id}`}>Subtitle</Label>
                  <Input id={`subtitle-${block.id}`} value={editState.subtitle} onChange={(e) => handleInputChange('subtitle', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`imageUrl-${block.id}`}>Image URL</Label>
                  <Input id={`imageUrl-${block.id}`} value={editState.imageUrl} onChange={(e) => handleInputChange('imageUrl', e.target.value)} />
                </div>
                 <div>
                    <Label htmlFor={`headerColor-${block.id}`}>Header Overlay Color</Label>
                    <Input id={`headerColor-${block.id}`} type="color" value={editState.headerColor || '#000000'} onChange={(e) => handleInputChange('headerColor', e.target.value)} className="h-10" />
                </div>
                <div>
                    <Label htmlFor={`headerTextColor-${block.id}`}>Header Text Color</Label>
                    <Input id={`headerTextColor-${block.id}`} type="color" value={editState.headerTextColor || '#FFFFFF'} onChange={(e) => handleInputChange('headerTextColor', e.target.value)} className="h-10" />
                </div>
                <div className='flex items-center gap-2'>
                    <Separator className='flex-1'/>
                    <span className='text-xs text-muted-foreground'>OR</span>
                    <Separator className='flex-1'/>
                </div>
                <div>
                    <Label htmlFor={`imageUpload-${block.id}`}>Upload Image</Label>
                    <Input id={`imageUpload-${block.id}`} type="file" accept="image/*" onChange={handleFileChange('imageUrl')} />
                </div>
                {commonEditFields}
             </div>
          )
        case 'image-with-text':
          return (
             <div className="flex flex-col gap-4">
                {commonTitleField}
                <div>
                  <Label htmlFor={`imageUrl-${block.id}`}>Image URL</Label>
                  <Input id={`imageUrl-${block.id}`} value={editState.imageUrl} onChange={(e) => handleInputChange('imageUrl', e.target.value)} />
                </div>
                <div className='flex items-center gap-2'>
                    <Separator className='flex-1'/>
                    <span className='text-xs text-muted-foreground'>OR</span>
                    <Separator className='flex-1'/>
                </div>
                <div>
                    <Label htmlFor={`imageUpload-${block.id}`}>Upload Image</Label>
                    <Input id={`imageUpload-${block.id}`} type="file" accept="image/*" onChange={handleFileChange('imageUrl')} />
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
                {commonTitleField}
                <div>
                  <Label htmlFor={`videoUrl-${block.id}`}>Video URL</Label>
                  <Input id={`videoUrl-${block.id}`} value={editState.videoUrl} onChange={(e) => handleInputChange('videoUrl', e.target.value)} />
                </div>
                <div className='flex items-center gap-2'>
                    <Separator className='flex-1'/>
                    <span className='text-xs text-muted-foreground'>OR</span>
                    <Separator className='flex-1'/>
                </div>
                <div>
                    <Label htmlFor={`videoUpload-${block.id}`}>Upload Video</Label>
                    <Input id={`videoUpload-${block.id}`} type="file" accept="video/*" onChange={handleFileChange('videoUrl')} />
                </div>
                <div>
                  <Label htmlFor={`content-${block.id}`}>Text</Label>
                  <Textarea id={`content-${block.id}`} value={editState.content} onChange={(e) => handleInputChange('content', e.target.value)} className="text-base min-h-[120px]" />
                </div>
                {commonEditFields}
             </div>
          )
        case 'link-with-text':
          return (
             <div className="flex flex-col gap-4">
                {commonTitleField}
                <div>
                  <Label htmlFor={`linkUrl-${block.id}`}>Link URL</Label>
                  <Input id={`linkUrl-${block.id}`} value={editState.linkUrl} onChange={(e) => handleInputChange('linkUrl', e.target.value)} />
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
              {commonTitleField}
              <div>
                <Label htmlFor={`content-${block.id}`}>Event Title</Label>
                <Input
                  id={`content-${block.id}`}
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
          return (
            <div className="flex flex-col gap-4">
                {commonTitleField}
                <div>
                    <Label htmlFor={`content-${block.id}`}>Table Title</Label>
                    <Input id={`content-${block.id}`} value={editState.content} onChange={(e) => handleInputChange('content', e.target.value)} />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                      <TableBody>
                          {editState.tableData?.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                  {row.map((cell, colIndex) => (
                                      <TableCell key={colIndex}>
                                          <Input value={cell} onChange={(e) => handleTableChange(rowIndex, colIndex, e.target.value)} />
                                      </TableCell>
                                  ))}
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleAddRow}><PlusCircle /> Add Row</Button>
                    <Button variant="outline" size="sm" onClick={handleRemoveRow} disabled={(editState.tableData?.length ?? 0) <= 1}><MinusCircle /> Remove Row</Button>
                    <Button variant="outline" size="sm" onClick={handleAddCol}><PlusCircle /> Add Column</Button>
                    <Button variant="outline" size="sm" onClick={handleRemoveCol} disabled={(editState.tableData?.[0]?.length ?? 0) <= 1}><MinusCircle /> Remove Column</Button>
                </div>
                {commonEditFields}
            </div>
          )
        case 'carousel':
        case 'footer':
        case 'text':
        default:
           return (
            <div className="flex flex-col gap-2">
              {commonTitleField}
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
  
  const blockTitle = block.title && <h4 className="text-sm font-semibold text-foreground mb-2">{block.title}</h4>;

  const renderViewingContent = () => {
    const contentWithHighlights = highlightText(block.content);

    switch (block.type) {
    case 'header':
        const headerStyle = block.headerColor ? { backgroundColor: `${block.headerColor}80` } : {}; // Add 80 for 50% opacity in hex
        const textStyle = { color: block.headerTextColor || '#FFFFFF' };
        return (
        <div className="relative">
            {block.imageUrl && (
            <Image
                src={block.imageUrl}
                alt="Header image"
                width={1200}
                height={400}
                className="w-full h-auto max-h-96 object-cover rounded-md"
                data-ai-hint="abstract background"
            />
            )}
            <div className="absolute inset-0 bg-black/50 rounded-md flex flex-col justify-center items-center text-center p-4" style={headerStyle}>
            <h1 className="text-4xl font-bold" style={textStyle}>{highlightText(block.content)}</h1>
            {block.subtitle && <p className="text-xl mt-2" style={textStyle}>{highlightText(block.subtitle)}</p>}
            </div>
        </div>
        )
    case 'video-with-text':
        return (
        <div>
            {blockTitle}
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
        <div>
          {blockTitle}
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
        </div>
        );
    case 'link-with-text':
        return (
        <div>
          {blockTitle}
          <a href={block.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
              <Link className="h-4 w-4" />
              <p className="whitespace-pre-wrap">{contentWithHighlights}</p>
          </a>
        </div>
        );
    case 'spacer':
        return <div className="h-16 w-full" />;
    case 'table':
        return (
        <div>
            {blockTitle}
            <h3 className="font-semibold text-lg mb-2">{contentWithHighlights}</h3>
            <div className="overflow-x-auto">
                <Table>
                {block.tableData && block.tableData.length > 0 && (
                <>
                    <TableHeader>
                    <TableRow>
                        {block.tableData[0].map((header, index) => (
                        <TableHead key={index}>{header}</TableHead>
                        ))}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {block.tableData.slice(1).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                        </TableRow>
                    ))}
                    </TableBody>
                </>
                )}
            </Table>
            </div>
        </div>
        );
    case 'carousel':
        return (
          <div>
            {blockTitle}
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
          </div>
        )
    case 'event':
        return (
        <div>
          {blockTitle}
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
        </div>
        );
    case 'form':
        return (
        <div>
          {blockTitle}
          <div className="space-y-4">
              <h3 className="font-semibold text-lg">{contentWithHighlights}</h3>
              <div className="flex flex-col gap-2">
                  <Input placeholder="Enter your name" />
                  <Input type="email" placeholder="Enter your email" />
                  <Button>Submit</Button>
              </div>
          </div>
        </div>
        )
    case 'announcement':
        return (
            <div>
              {blockTitle}
              <Alert>
                <AlertTitle className="font-bold">Announcement!</AlertTitle>
                <AlertDescription>
                    {contentWithHighlights}
                </AlertDescription>
              </Alert>
            </div>
        )
    case 'footer':
        return (
            <div className="text-center text-xs text-muted-foreground border-t pt-4 mt-4">
            <p>{contentWithHighlights}</p>
            <p>© 2023 Newsflow. All rights reserved.</p>
            </div>
        )
    case 'text':
    default:
      return (
        <div>
          {blockTitle}
          <p className="text-muted-foreground whitespace-pre-wrap">{contentWithHighlights}</p>
        </div>
      );
    }
  };
    
  return (
      <Card className="relative group/block">
          <CardContent className="p-4">
              {isEditing ? renderEditingContent() : renderViewingContent()}
          </CardContent>
           <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
              <Button {...dragHandleProps} variant="ghost" size="icon" className="h-8 w-8 cursor-grab">
                <GripVertical className="h-4 w-4" />
                <span className="sr-only">Drag to reorder</span>
              </Button>
              {!isEditing && !['spacer'].includes(block.type) && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                  </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(block.id)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
              </Button>
          </div>
      </Card>
  );
}

    