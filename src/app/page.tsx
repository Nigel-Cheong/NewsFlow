import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { mockNewsletters } from '@/lib/mock-data';
import { FileText, PlusCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-4">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">NewsGenius</h1>
        </div>
        <Button>
          <PlusCircle />
          New Newsletter
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockNewsletters.map((newsletter) => (
            <Link href={`/newsletters/${newsletter.id}`} key={newsletter.id}>
                <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{newsletter.title}</CardTitle>
                    <CardDescription>
                      Last updated: {newsletter.lastUpdated}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {newsletter.blocks[0]?.content || 'No content yet.'}
                    </p>
                  </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
