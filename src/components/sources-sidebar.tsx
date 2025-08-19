
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookText, AlertTriangle, GripVertical, Upload, Link, FileText, Bot, List } from 'lucide-react';
import type { FlaggedIssue } from '@/lib/types';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from './ui/scroll-area';

interface SourcesSidebarProps {
  issues: FlaggedIssue[];
  isConfidential: boolean;
}

type Source = {
    type: 'file' | 'link' | 'text';
    value: string;
    name?: string;
}

export function SourcesSidebar({ issues, isConfidential }: SourcesSidebarProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [textInput, setTextInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newSources = Array.from(e.target.files).map(file => ({
          type: 'file' as const,
          value: file.name,
          name: file.name,
      }));
      setSources(prev => [...prev, ...newSources]);
      console.log('Files selected:', e.target.files);
    }
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      setSources(prev => [...prev, { type: 'link', value: linkUrl.trim() }]);
      setLinkUrl('');
    }
  }

  const handleAddText = () => {
    if (textInput.trim()) {
        setSources(prev => [...prev, { type: 'text', value: textInput.trim() }]);
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
                        <CardContent className="flex-1 flex flex-col overflow-y-auto p-2 pt-0">
                          <Tabs defaultValue="add" className="w-full flex-1 flex flex-col">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="add" className="text-xs p-1 h-auto"><List className="mr-1 h-3 w-3"/>Sources</TabsTrigger>
                              <TabsTrigger value="file" className="text-xs p-1 h-auto"><Upload className="mr-1 h-3 w-3"/> File</TabsTrigger>
                              <TabsTrigger value="link" className="text-xs p-1 h-auto"><Link className="mr-1 h-3 w-3"/> Link</TabsTrigger>
                              <TabsTrigger value="text" className="text-xs p-1 h-auto"><FileText className="mr-1 h-3 w-3"/> Text</TabsTrigger>
                              <TabsTrigger value="gdrive" className="text-xs p-1 h-auto"><Bot className="mr-1 h-3 w-3"/> Drive</TabsTrigger>
                            </TabsList>
                            <TabsContent value="add" className="mt-4 flex-1">
                                <ScrollArea className="h-full">
                                    <div className="space-y-2 pr-4">
                                        {sources.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">No sources added yet.</p>
                                        ) : (
                                            sources.map((source, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 rounded-md border text-sm">
                                                    {source.type === 'file' && <Upload className="h-4 w-4 shrink-0"/>}
                                                    {source.type === 'link' && <Link className="h-4 w-4 shrink-0"/>}
                                                    {source.type === 'text' && <FileText className="h-4 w-4 shrink-0"/>}
                                                    <span className="truncate" title={source.value}>{source.value}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="file" className="mt-4">
                              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center">
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Drag & drop or click to upload</p>
                                <p className="mt-1 text-xs text-muted-foreground/80">PDF, TXT, MD</p>
                                <Input type="file" multiple className="mt-4" onChange={handleFileChange} accept=".pdf,.txt,.md" />
                              </div>
                            </TabsContent>
                            <TabsContent value="link" className="mt-4 space-y-3">
                              <Label htmlFor="link-url">Add a web link</Label>
                              <div className="flex gap-2">
                                <Input id="link-url" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                                <Button onClick={handleAddLink}>Add</Button>
                              </div>
                            </TabsContent>
                            <TabsContent value="text" className="mt-4 space-y-3">
                              <Label htmlFor="text-input">Paste your text</Label>
                              <div className="flex flex-col gap-2">
                                <Textarea id="text-input" placeholder="Paste any text content here..." rows={6} value={textInput} onChange={(e) => setTextInput(e.target.value)} />
                                <Button onClick={handleAddText} className="self-end">Add</Button>
                              </div>
                            </TabsContent>
                            <TabsContent value="gdrive" className="mt-4">
                                <div className="flex flex-col items-center justify-center rounded-lg border border-muted/50 p-8 text-center">
                                    <Bot className="h-10 w-10 text-muted-foreground"/>
                                    <p className="mt-2 font-semibold">Sync with Google Drive</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Import documents directly.</p>
                                    <Button className="mt-4">Connect Google Drive</Button>
                                </div>
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
                                          Found in block {issue.blockId.split('-')[1]}.
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

    