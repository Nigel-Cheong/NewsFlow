
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Link, FileText, Bot } from 'lucide-react';

interface NewNewsletterDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (title: string, sources: any[]) => void;
}

export function NewNewsletterDialog({ isOpen, onOpenChange, onCreate }: NewNewsletterDialogProps) {
  const [title, setTitle] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [textInput, setTextInput] = useState('');

  const handleCreate = () => {
    onCreate(title, sources);
    onOpenChange(false);
    // Reset state for next time
    setTitle('');
    setSources([]);
  };
  
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Newsletter</DialogTitle>
          <DialogDescription>
            Give your newsletter a title and add content sources to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="e.g. 'Q3 Company Updates'"
            />
          </div>
          
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

        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleCreate} disabled={!title}>Create Newsletter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
