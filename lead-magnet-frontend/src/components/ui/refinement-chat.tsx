'use client';
import { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  content: string;
  onContentChange: (content: string) => void;
}

export function RefinementChat({ content, onContentChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const instruction = input.trim();
    if (!instruction || loading) return;
    if (!content.trim()) {
      toast({ type: 'error', title: 'No content to refine', description: 'Generate or write content first.' });
      return;
    }

    const userMsg: Message = { role: 'user', text: instruction };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build compact history for the API (summaries only, no full HTML)
    const history = messages.map((m) => ({ role: m.role, content: m.text }));

    try {
      const res = await aiApi.refine({ content, instruction, history });
      const { content: refined, summary } = res.data.data;
      onContentChange(refined);
      setMessages((prev) => [...prev, { role: 'assistant', text: summary }]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Refinement failed.';
      toast({ type: 'error', title: 'Error', description: msg });
      // Remove the user message we optimistically added
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = [
    'Make it shorter',
    'Add a pricing section',
    'Make the tone more casual',
    'Add actionable examples',
    'Expand the introduction',
    'Add a FAQ section',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-[180px] max-h-[340px] pr-1">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Refine the content with natural instructions. Try:</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs px-2 py-1 rounded-md border border-border bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg px-3 py-2 text-xs leading-relaxed max-w-[90%]',
                m.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground'
              )}
            >
              {m.text}
            </div>
          ))
        )}
        {loading && (
          <div className="bg-secondary rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
            <span className="inline-flex gap-1">
              <span className="animate-bounce [animation-delay:0ms]">·</span>
              <span className="animate-bounce [animation-delay:150ms]">·</span>
              <span className="animate-bounce [animation-delay:300ms]">·</span>
            </span>
            Refining…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. Make it shorter, add a FAQ…"
          rows={2}
          disabled={loading}
          className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 placeholder:text-muted-foreground"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleSend}
          loading={loading}
          disabled={!input.trim()}
          className="h-[52px] px-3"
        >
          Send
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5">Enter to send · Shift+Enter for newline</p>
    </div>
  );
}
