
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { FlaggedIssue } from '@/lib/types';
import { AlertTriangle, Info } from 'lucide-react';

interface PromptingSidebarProps {
  issues: FlaggedIssue[];
  isConfidential: boolean;
}

export function PromptingSidebar({ issues, isConfidential }: PromptingSidebarProps) {
  return (
    <aside className="w-96 h-full border-l bg-card p-4">
      <Card className="h-full rounded-none border-0 overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              Gemini Prompting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>This is the prompting view</AlertTitle>
                <AlertDescription>
                    You can interact with Gemini here.
                </AlertDescription>
            </Alert>
            
            {isConfidential && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Confidential Content Detected!</AlertTitle>
                <AlertDescription>
                  This document contains sensitive information. Please review the flagged issues.
                </AlertDescription>
              </Alert>
            )}

            {issues.length > 0 && (
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
            )}
          </CardContent>
      </Card>
    </aside>
  );
}
