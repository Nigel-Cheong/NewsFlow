
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
import { NewNewsletterDialog } from '@/components/new-newsletter-dialog';
import { mockNewsletters as defaultNewsletters } from '@/lib/mock-data';
import type { Newsletter, Source } from '@/lib/types';
import { Newspaper, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { runGenerateBlocks } from './actions';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newsletterToDelete, setNewsletterToDelete] = useState<string | null>(null);
  const [isNewNewsletterDialogOpen, setIsNewNewsletterDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const allKeys = Object.keys(window.localStorage);
    const newsletterKeys = allKeys.filter(key => key.startsWith('newsletter-'));
    
    let loadedNewsletters: Newsletter[] = [...defaultNewsletters];

    if (newsletterKeys.length > 0) {
      const storedNewsletters = newsletterKeys.map(key => {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }).filter(Boolean) as Newsletter[];
      
      const storedMap = new Map(storedNewsletters.map(n => [n.id, n]));
      
      // Update default newsletters with any stored versions
      loadedNewsletters = defaultNewsletters.map(n => storedMap.get(n.id) || n);
      // Remove the ones we just updated from the map
      defaultNewsletters.forEach(n => storedMap.delete(n.id));
      // Add any remaining stored newsletters that weren't in the defaults
      loadedNewsletters.push(...Array.from(storedMap.values()));

    }
    
    setNewsletters(loadedNewsletters);
  }, []);

  const handleNewNewsletter = async (title: string, sources: Source[]) => {
    setIsCreating(true);
    toast({
        title: "Generating Newsletter...",
        description: "The AI is crafting your newsletter from the sources provided. Please wait."
    });

    const newId = `newsletter-${Date.now()}`;
    const combinedText = sources.map(s => `Source: ${s.name}\n${s.content}`).join('\n\n---\n\n');
    
    let generatedBlocks = [];
    if (combinedText.trim()) {
        try {
            const result = await runGenerateBlocks(combinedText);
            if (result.blocks) {
                generatedBlocks = result.blocks.map((block, index) => ({...block, id: `block-${Date.now()}-${index}`, colspan: 2}));
            }
        } catch(error) {
            console.error("Failed to generate blocks from text", error);
            toast({
                title: "AI Generation Failed",
                description: "Could not generate content from the sources. A blank newsletter will be created.",
                variant: "destructive"
            });
        }
    }

    const newNewsletter: Newsletter = {
      id: newId,
      title: title || 'Untitled Newsletter',
      lastUpdated: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      sources: sources.map(({ name, type }) => ({ name, type })),
      blocks: [
        {
          id: `block-header-${Date.now()}`,
          type: 'header',
          title: 'Header',
          content: title || 'Your New Newsletter',
          subtitle: 'A great start!',
          colspan: 2,
          imageUrl: 'https://placehold.co/1200x400'
        },
        ...generatedBlocks,
        {
            id: `block-footer-${Date.now()}`,
            type: 'footer',
            title: 'Footer',
            content: '© 2024 Newsflow. All rights reserved. | Contact us at contact@newsflow.com',
            colspan: 2
        }
      ]
    };

    localStorage.setItem(newId, JSON.stringify(newNewsletter));
    setIsCreating(false);
    toast({
        title: "Newsletter Created!",
        description: "Your new newsletter is ready.",
    });
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
            <Newspaper className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Newsflow</h1>
          </div>
          <Button onClick={() => setIsNewNewsletterDialogOpen(true)}>
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
      <NewNewsletterDialog 
        isOpen={isNewNewsletterDialogOpen}
        onOpenChange={setIsNewNewsletterDialogOpen}
        onCreate={handleNewNewsletter}
        isCreating={isCreating}
      />
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
