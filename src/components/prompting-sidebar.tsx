
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';
import { runChat } from '@/app/actions';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function PromptingSidebar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await runChat(input);
      const modelMessage: Message = { role: 'model', text: result.response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'model', text: 'Sorry, something went wrong.' };
      setMessages(prev => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-96 h-full border-l bg-card p-4">
      <Card className="h-full flex flex-col rounded-none border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Gemini Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                   {message.role === 'model' && (
                     <Avatar className="h-8 w-8">
                       <AvatarFallback><Sparkles /></AvatarFallback>
                     </Avatar>
                   )}
                  <div className={`rounded-lg px-3 py-2 max-w-xs ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Loader2 className="animate-spin" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 bg-muted">
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>
          <div className="relative">
            <Textarea
              placeholder="Ask Gemini anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="pr-16"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute top-1/2 right-3 -translate-y-1/2"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
