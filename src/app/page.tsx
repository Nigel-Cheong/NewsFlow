
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { mockNewsletters as defaultNewsletters } from '@/lib/mock-data';
import type { Newsletter } from '@/lib/types';
import { FileText, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newsletterToDelete, setNewsletterToDelete] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // On component mount, load all newsletters from localStorage
    const allKeys = Object.keys(window.localStorage);
    const newsletterKeys = allKeys.filter(key => key.startsWith('newsletter-'));
    
    let loadedNewsletters: Newsletter[] = [...defaultNewsletters];

    if (newsletterKeys.length > 0) {
      const storedNewsletters = newsletterKeys.map(key => {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }).filter(Boolean) as Newsletter[];
      
      const storedMap = new Map(storedNewsletters.map(n => [n.id, n]));
      
      loadedNewsletters = defaultNewsletters.map(n => storedMap.get(n.id) || n);

      storedNewsletters.forEach(sn => {
          if (!loadedNewsletters.some(ln => ln.id === sn.id)) {
              loadedNewsletters.push(sn);
          }
      });

    }
    
    setNewsletters(loadedNewsletters);
  }, []);

  const handleNewNewsletter = () => {
    const newId = `newsletter-${Date.now()}`;
    const newNewsletter: Newsletter = {
      id: newId,
      title: 'Untitled Newsletter',
      lastUpdated: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      blocks: [
        {
          id: `block-${Date.now()}`,
          type: 'header',
          content: 'Your New Newsletter',
          subtitle: 'A great start!',
          colspan: 2,
          imageUrl: 'https://placehold.co/1200x400'
        }
      ]
    };

    localStorage.setItem(newId, JSON.stringify(newNewsletter));
    
    router.push(`/newsletters/${newId}`);
  };

  const confirmDeleteNewsletter = (e: React.MouseEvent, newsletterId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setNewsletterToDelete(newsletterId);
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (newsletterToDelete) {
      localStorage.removeItem(newsletterToDelete);
      setNewsletters(newsletters.filter(n => n.id !== newsletterToDelete));
      setNewsletterToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-background text-foreground">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Newsflow</h1>
          </div>
          <Button onClick={handleNewNewsletter}>
            <PlusCircle />
            New Newsletter
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newsletters.map((newsletter) => (
              <Link href={`/newsletters/${newsletter.id}`} key={newsletter.id} className="relative group">
                  <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardHeader>
                      <CardTitle>{newsletter.title}</CardTitle>
                      <CardDescription>
                        Last updated: {newsletter.lastUpdated}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {newsletter.blocks.find(b => b.type === 'text')?.content || newsletter.blocks[0]?.content || 'No content yet.'}
                      </p>
                    </CardContent>
                  </Card>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => confirmDeleteNewsletter(e, newsletter.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
              </Link>
            ))}
          </div>
        </main>
      </div>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              newsletter from your browser's storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewsletterToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
