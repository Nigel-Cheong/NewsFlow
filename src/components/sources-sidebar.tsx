
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookText, AlertTriangle, GripVertical, Upload, Link, FileText, Bot } from 'lucide-react';
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

export function SourcesSidebar({ issues, isConfidential }: SourcesSidebarProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [textInput, setTextInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        // TODO: Handle file uploads
      console.log('Files selected:', e.target.files);
    }
  };

  const handleAddLink = () => {
    if (linkUrl) {
      console.log('Link added:', linkUrl);
      setLinkUrl('');
    }
  }

  const handleAddText = () => {
    if (textInput) {
        console.log('Text added:', textInput);
        setTextInput('');
    }
  }

  return (
    <aside className="h-full border-r">
        <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={50} minSize={25}>
                <div className="flex flex-col h-full p-4">
                     <Card className="flex-1 flex flex-col rounded-none border-0 overflow-hidden">
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookText />
                            Sources
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                          <Tabs defaultValue="file" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="file"><Upload className="mr-1 h-4 w-4"/> File</TabsTrigger>
                              <TabsTrigger value="link"><Link className="mr-1 h-4 w-4"/> Link</TabsTrigger>
                              <TabsTrigger value="text"><FileText className="mr-1 h-4 w-4"/> Text</TabsTrigger>
                              <TabsTrigger value="gdrive"><Bot className="mr-1 h-4 w-4"/> Drive</TabsTrigger>
                            </TabsList>
                            <TabsContent value="file" className="mt-4">
                              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center">
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Drag & drop files or click to upload</p>
                                <p className="mt-1 text-xs text-muted-foreground/80">Supports PDF, TXT, and Markdown</p>
                                <Input type="file" multiple className="mt-4" onChange={handleFileChange} accept=".pdf,.txt,.md" />
                              </div>
                            </TabsContent>
                            <TabsContent value="link" className="mt-4 space-y-3">
                              <Label htmlFor="link-url">Add a web link</Label>
                              <div className="flex gap-2">
                                <Input id="link-url" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                                <Button onClick={handleAddLink}>Add Link</Button>
                              </div>
                            </TabsContent>
                            <TabsContent value="text" className="mt-4 space-y-3">
                              <Label htmlFor="text-input">Paste your text</Label>
                              <div className="flex flex-col gap-2">
                                <Textarea id="text-input" placeholder="Paste any text content here..." rows={6} value={textInput} onChange={(e) => setTextInput(e.target.value)} />
                                <Button onClick={handleAddText} className="self-end">Add Text</Button>
                              </div>
                            </TabsContent>
                            <TabsContent value="gdrive" className="mt-4">
                                <div className="flex flex-col items-center justify-center rounded-lg border border-muted/50 p-8 text-center">
                                    <Bot className="h-10 w-10 text-muted-foreground"/>
                                    <p className="mt-2 font-semibold">Sync with Google Drive</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Import documents directly from your Google Drive account.</p>
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
                 <div className="flex flex-col h-full p-4">
                     <Card className="flex-1 flex flex-col rounded-none border-0 overflow-hidden">
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-destructive" />
                            Issues
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4 overflow-y-auto">
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
                        </CardContent>
                    </Card>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    </aside>
  );
}
