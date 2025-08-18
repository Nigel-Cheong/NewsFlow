'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { FlaggedIssue } from '@/lib/types';
import { AlertTriangle, Info } from 'lucide-react';

interface IssuesSidebarProps {
  issues: FlaggedIssue[];
  isConfidential: boolean;
}

export function IssuesSidebar({ issues, isConfidential }: IssuesSidebarProps) {
  return (
    <aside className="w-full md:w-96 shrink-0 border-l bg-card">
      <Card className="h-full rounded-none border-0 border-l">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive" />
            Confidentiality Issues
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
                <Info className="h-4 w-4" />
                <AlertTitle>No Issues Found</AlertTitle>
                <AlertDescription>
                    The content has been scanned and no sensitive keywords were detected.
                </AlertDescription>
             </Alert>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
