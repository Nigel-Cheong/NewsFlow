
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookText, AlertTriangle, GripVertical } from 'lucide-react';
import type { FlaggedIssue } from '@/lib/types';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

interface SourcesSidebarProps {
  issues: FlaggedIssue[];
  isConfidential: boolean;
}

export function SourcesSidebar({ issues, isConfidential }: SourcesSidebarProps) {
  return (
    <aside className="w-96 h-full border-r p-0">
        <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={50} minSize={25}>
                <div className="flex h-full items-start justify-center p-4">
                     <Card className="w-full h-full rounded-none border-0 overflow-y-auto">
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookText />
                            Sources
                        </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <Alert>
                            <AlertTitle>Content Sources</AlertTitle>
                            <AlertDescription>
                                This is where you can manage your content sources. This feature is coming soon.
                            </AlertDescription>
                        </Alert>
                        </CardContent>
                    </Card>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={25}>
                 <div className="flex h-full items-start justify-center p-4">
                     <Card className="w-full h-full rounded-none border-0 overflow-y-auto">
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-destructive" />
                            Issues
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
