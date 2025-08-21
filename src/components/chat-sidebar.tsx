
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, Wand, LayoutTemplate } from 'lucide-react';
import { marked } from 'marked';
import type { ContentBlock } from '@/lib/types';
import type { ChatOutput } from '@/ai/flows/chat-flow';

interface Message {
  role: 'user' | 'bot';
  content: string;
  replacement?: ChatOutput['replacement'];
  layoutSuggestion?: ChatOutput['layoutSuggestion'];
}

interface ChatSidebarProps {
    newsletterContent: ContentBlock[];
    onApplySuggestion: (blockId: string, newContent: string) => void;
    onApplyLayoutSuggestion: (suggestions: ChatOutput['layoutSuggestion']) => void;
}

export function ChatSidebar({ newsletterContent, onApplySuggestion, onApplyLayoutSuggestion }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const context = newsletterContent.map(block => `blockId: ${block.id}\nBlock Type: ${block.type}\nTitle: ${block.title || 'N/A'}\nColspan: ${block.colspan || 2}\nContent: ${block.content}`).join('\n\n---\n\n');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input, context }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ChatOutput = await response.json();
      
      const botMessage: Message = {
        role: 'bot',
        content: result.response,
        replacement: result.replacement,
        layoutSuggestion: result.layoutSuggestion,
      };
      
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Error fetching chat response:', error);
      const errorMessage: Message = {
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-scroll to the bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);
  
  const handleApplyContentSuggestion = (blockId?: string, newContent?: string) => {
    if (blockId && newContent) {
        onApplySuggestion(blockId, newContent);
    }
  }
  
  const handleApplyLayoutSuggestion = (suggestions?: ChatOutput['layoutSuggestion']) => {
    if (suggestions) {
        onApplyLayoutSuggestion(suggestions);
    }
  }

  const renderMessageContent = (message: Message) => {
    const htmlContent = marked.parse(message.content);
    return (
        <div>
            <div dangerouslySetInnerHTML={{ __html: htmlContent as string }} className="prose prose-sm dark:prose-invert max-w-none" />
            {message.replacement?.newContent && message.replacement?.blockId && (
                <div className="mt-4">
                    <blockquote className="border-l-4 border-primary pl-4 my-2">
                        <p className="font-semibold">Suggested change:</p>
                        <p className="text-sm italic">{message.replacement.newContent}</p>
                    </blockquote>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleApplyContentSuggestion(message.replacement?.blockId, message.replacement?.newContent)}
                    >
                        <Wand /> Replace text with suggestion
                    </Button>
                </div>
            )}
             {message.layoutSuggestion && (
                <div className="mt-4">
                    <blockquote className="border-l-4 border-primary pl-4 my-2">
                        <p className="font-semibold">Suggested layout change applied.</p>
                    </blockquote>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleApplyLayoutSuggestion(message.layoutSuggestion)}
                    >
                        <LayoutTemplate /> Apply Layout
                    </Button>
                </div>
            )}
        </div>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col rounded-none border-0 border-l">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot />
          Gemini Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'bot' && (
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Bot size={20} />
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {renderMessageContent(message)}
                </div>
                {message.role === 'user' && (
                  <div className="p-2 rounded-full bg-muted/80">
                    <User size={20} />
                  </div>
                )}
              </div>
            ))}
             {isLoading &&(
              <div className="flex items-start gap-3">
                 <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Bot size={20} />
                  </div>
                <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16}/>
                    <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me about this newsletter..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
