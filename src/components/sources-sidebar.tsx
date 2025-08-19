
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookText } from 'lucide-react';

export function SourcesSidebar() {
  return (
    <aside className="w-96 h-full border-r bg-card p-4">
      <Card className="h-full rounded-none border-0 overflow-y-auto">
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
    </aside>
  );
}
