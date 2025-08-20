
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookText, AlertTriangle, Upload, Link, FileText, Bot, List, Trash2, Edit, Check, ImageIcon } from 'lucide-react';
import type { FlaggedIssue, Source } from '@/lib/types';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { fetchUrlContent } from '@/app/actions';
import { Loader2 } from 'lucide-react';


interface SourcesSidebarProps {
  sources: Omit<Source, 'content'>[];
  issues: FlaggedIssue[];
  isConfidential: boolean;
  onAddNewSource: (source: Source) => void;
  onDeleteSource: (sourceName: string) => void;
  onUpdateSource: (originalName: string, newName: string) => void;
}

interface SourceItemProps {
    source: Omit<Source, 'content'>;
    onDelete: () => void;
    onUpdate: (newName: string) => void;
}

function SourceItem({ source, onDelete, onUpdate }: SourceItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(source.name);

    useEffect(() => {
        setName(source.name);
    }, [source.name]);

    const handleSave = () => {
        if (name.trim() && name.trim() !== source.name) {
            onUpdate(name);
        }
        setIsEditing(false);
    }
    
    return (
        <div className="p-2 rounded-md border text-sm flex items-center justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
                {source.type === 'file' && <FileText className="h-4 w-4 shrink-0 mt-1"/>}
                {source.type === 'image' && <ImageIcon className="h-4 w-4 shrink-0 mt-1"/>}
                {source.type === 'link' && <Link className="h-4 w-4 shrink-0 mt-1"/>}
                {source.type === 'text' && <FileText className="h-4 w-4 shrink-0 mt-1"/>}
                {source.type === 'gdrive' && <Bot className="h-4 w-4 shrink-0 mt-1"/>}
                {isEditing ? (
                    <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        className="h-7 text-sm"
                        autoFocus
                    />
                ) : (
                    <span className="flex-1 break-words py-1" title={source.name} onDoubleClick={() => setIsEditing(true)}>
                        {source.name}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
                {isEditing ? (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave}>
                        <Check className="h-4 w-4" />
                    </Button>
                ) : (
                     <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
                <Button variant="destructive" size="icon" className="h-6 w-6" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete source</span>
                </Button>
            </div>
        </div>
    )
}


export function SourcesSidebar({ sources, issues, isConfidential, onAddNewSource, onDeleteSource, onUpdateSource }: SourcesSidebarProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const [textInput, setTextInput] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            const isImage = file.type.startsWith('image/');

            reader.onload = (event) => {
                const content = event.target?.result as string;
                const newSource: Source = { 
                    name: file.name, 
                    type: isImage ? 'image' : 'file', 
                    content 
                };
                onAddNewSource(newSource);
            };
            reader.onerror = () => {
                toast({
                    title: "File Read Error",
                    description: `Could not read the file: ${file.name}`,
                    variant: 'destructive'
                });
            };
            
            if(isImage) {
              reader.readAsDataURL(file);
            } else {
              reader.readAsText(file);
            }
        });
    }
  };

  const handleAddLink = async () => {
    if (linkUrl.trim() && !isFetchingLink) {
        setIsFetchingLink(true);
        toast({
            title: "Parsing URL...",
            description: "The AI is reading the content from the provided link."
        });
  
        try {
          const result = await fetchUrlContent(linkUrl);
          if (result.content) {
              const newSource: Source = {
                  name: result.title || linkUrl,
                  type: 'link',
                  content: `Source: ${result.title || linkUrl}\n${result.content}`
              }
              onAddNewSource(newSource);
          } else {
              toast({
                  title: "Failed to Parse URL",
                  description: "Could not extract content from the link. Please try another URL.",
                  variant: 'destructive'
              });
          }
        } catch (error) {
           toast({
              title: "Error Fetching Link",
              description: "An unexpected error occurred while fetching the link.",
              variant: 'destructive'
          });
        } finally {
          setIsFetchingLink(false);
          setLinkUrl('');
        }
      }
  }

  const handleAddText = () => {
    if (textInput.trim()) {
        const newSource: Source = { name: 'Pasted Text', type: 'text', content: textInput };
        onAddNewSource(newSource);
        setTextInput('');
    }
  }


  return (
    <aside className="h-full border-r">
        <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
                <div className="flex flex-col h-full p-2">
                     <Card className="flex-1 flex flex-col rounded-none border-0 overflow-hidden">
                        <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BookText />
                            Content Sources
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-2 pt-0 overflow-hidden">
                          <Tabs defaultValue="list" className="w-full flex-1 flex flex-col overflow-hidden">
                            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                              <TabsTrigger value="list" className="text-xs p-1 h-auto"><List className="mr-1 h-3 w-3"/>Sources</TabsTrigger>
                              <TabsTrigger value="file" className="text-xs p-1 h-auto"><Upload className="mr-1 h-3 w-3"/>File</TabsTrigger>
                              <TabsTrigger value="link" className="text-xs p-1 h-auto"><Link className="mr-1 h-3 w-3"/>Link</TabsTrigger>
                              <TabsTrigger value="text" className="text-xs p-1 h-auto"><FileText className="mr-1 h-3 w-3"/>Text</TabsTrigger>
                              <TabsTrigger value="gdrive" className="text-xs p-1 h-auto"><Bot className="mr-1 h-3 w-3"/>Drive</TabsTrigger>
                            </TabsList>
                            <TabsContent value="list" className="mt-4 flex-1 overflow-auto">
                                <div className="space-y-2 pr-2 h-full">
                                    <ScrollArea className="h-full">
                                        {sources.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">No sources for this newsletter.</p>
                                        ) : (
                                            sources.map((source, index) => (
                                                <SourceItem 
                                                    key={`${source.name}-${index}`}
                                                    source={source}
                                                    onDelete={() => {
                                                        onDeleteSource(source.name);
                                                        toast({
                                                            title: "Source Removed",
                                                            description: `"${source.name}" has been removed.`,
                                                        });
                                                    }}
                                                    onUpdate={(newName) => {
                                                        onUpdateSource(source.name, newName);
                                                         toast({
                                                            title: "Source Renamed",
                                                            description: `Source renamed to "${newName}".`,
                                                        });
                                                    }}
                                                />
                                            ))
                                        )}
                                    </ScrollArea>
                                </div>
                            </TabsContent>
                            <TabsContent value="file" className="mt-4 flex-1 overflow-hidden">
                              <ScrollArea className="h-full pr-2">
                                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center">
                                  <Upload className="h-10 w-10 text-muted-foreground" />
                                  <p className="mt-2 text-sm text-muted-foreground">Drag & drop or click to upload</p>
                                  <p className="mt-1 text-xs text-muted-foreground/80">PDF, TXT, MD, PNG, JPG, GIF</p>
                                  <Input type="file" multiple className="mt-4" onChange={handleFileChange} accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.gif" />
                                </div>
                              </ScrollArea>
                            </TabsContent>
                            <TabsContent value="link" className="mt-4 flex-1 overflow-hidden">
                               <ScrollArea className="h-full pr-2">
                                <div className="space-y-3">
                                  <Label htmlFor="link-url">Add a web link</Label>
                                  <div className="flex gap-2">
                                    <Input id="link-url" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} disabled={isFetchingLink}/>
                                    <Button onClick={handleAddLink} disabled={isFetchingLink || !linkUrl.trim()}>
                                        {isFetchingLink ? <Loader2 className="animate-spin" /> : 'Add'}
                                    </Button>
                                  </div>
                                </div>
                              </ScrollArea>
                            </TabsContent>
                            <TabsContent value="text" className="mt-4 flex-1 overflow-hidden">
                               <ScrollArea className="h-full pr-2">
                                <div className="space-y-3">
                                  <Label htmlFor="text-input">Paste your text</Label>
                                  <div className="flex flex-col gap-2">
                                    <Textarea id="text-input" placeholder="Paste any text content here..." rows={6} value={textInput} onChange={(e) => setTextInput(e.target.value)} />
                                    <Button onClick={handleAddText} className="self-end" disabled={!textInput.trim()}>Add Text</Button>
                                  </div>
                                </div>
                              </ScrollArea>
                            </TabsContent>
                            <TabsContent value="gdrive" className="mt-4 flex-1 overflow-hidden">
                                <ScrollArea className="h-full pr-2">
                                  <div className="flex flex-col items-center justify-center rounded-lg border border-muted/50 p-8 text-center">
                                      <Bot className="h-10 w-10 text-muted-foreground"/>
                                      <p className="mt-2 font-semibold">Sync with Google Drive</p>
                                      <p className="mt-1 text-sm text-muted-foreground">Import documents directly.</p>
                                      <Button className="mt-4" onClick={() => toast({ title: 'Coming Soon!', description: 'Google Drive integration is not yet available.'})}>Connect Google Drive</Button>
                                  </div>
                                </ScrollArea>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={25}>
                 <div className="flex flex-col h-full p-2">
                     <Card className="flex-1 flex flex-col rounded-none border-0 overflow-hidden">
                        <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="text-destructive" />
                            Issues
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-2 overflow-y-auto p-2 pt-0">
                          <ScrollArea className="h-full">
                            <div className="space-y-2 pr-4">
                              {isConfidential && (
                                  <Alert variant="destructive">
                                      <AlertTriangle className="h-4 w-4" />
                                      <AlertTitle>Confidential Content Detected!</AlertTitle>
                                      <AlertDescription>
                                      This document contains sensitive information. Please review the flagged issues.
                                      </AlertDescription>
                                  </Alert>
                                  )}

                                  {issues.length > 0 ? (
                                  <div className="space-y-2">
                                      {issues.map((issue, index) => (
                                      <Alert key={index}>
                                          <AlertTriangle className="h-4 w-4" />
                                          <AlertTitle>Keyword: "{issue.keyword}"</AlertTitle>
                                          <AlertDescription>
                                              Found in block: "{issue.blockTitle || 'Untitled'}"
                                          </AlertDescription>
                                      </Alert>
                                      ))}
                                  </div>
                                  ) : (
                                      <Alert>
                                          <AlertTitle>No issues found</AlertTitle>
                                          <AlertDescription>
                                              The content seems to be clear of any sensitive keywords.
                                          </AlertDescription>
                                      </Alert>
                                  )}
                              </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    </aside>
  );
}
