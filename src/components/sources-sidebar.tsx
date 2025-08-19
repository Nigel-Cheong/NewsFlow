
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookText, AlertTriangle } from 'lucide-react';
import type { FlaggedIssue } from '@/lib/types';
import { Separator } from './ui/separator';

interface SourcesSidebarProps {
  issues: FlaggedIssue[];
  isConfidential: boolean;
}

export function SourcesSidebar({ issues, isConfidential }: SourcesSidebarProps) {
  return (
    <aside className="w-96 h-full border-r bg-card p-4 flex flex-col gap-4">
      <Card className="flex-1 rounded-none border-0 overflow-y-auto">
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
      
      <Separator />

      <Card className="flex-1 rounded-none border-0 overflow-y-auto">
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
    </aside>
  );
}
