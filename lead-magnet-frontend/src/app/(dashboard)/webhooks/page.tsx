'use client';
import { useState, useEffect, useCallback } from 'react';
import { webhookApi, Webhook } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WebhooksPage() {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    webhookApi.list()
      .then((res) => setWebhooks(res.data.data.webhooks))
      .catch(() => toast({ type: 'error', title: 'Failed to load webhooks' }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setAdding(true);
    try {
      const res = await webhookApi.create({ url: url.trim(), events: ['lead.created'] });
      setWebhooks((prev) => [res.data.data, ...prev]);
      setUrl('');
      toast({ type: 'success', title: 'Webhook added' });
    } catch {
      toast({ type: 'error', title: 'Failed to add webhook' });
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (hook: Webhook) => {
    setToggling(hook.id);
    try {
      const res = await webhookApi.update(hook.id, { isActive: !hook.is_active });
      setWebhooks((prev) => prev.map((h) => h.id === hook.id ? res.data.data : h));
    } catch {
      toast({ type: 'error', title: 'Failed to update' });
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (hook: Webhook) => {
    if (!confirm(`Delete webhook for ${hook.url}?`)) return;
    setDeleting(hook.id);
    try {
      await webhookApi.remove(hook.id);
      setWebhooks((prev) => prev.filter((h) => h.id !== hook.id));
      toast({ type: 'success', title: 'Deleted' });
    } catch {
      toast({ type: 'error', title: 'Delete failed' });
    } finally {
      setDeleting(null);
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast({ type: 'success', title: 'Secret copied' });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Webhooks</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          POST requests sent to your URL whenever a new lead is captured.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Add webhook</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="url" className="sr-only">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://your-server.com/webhook"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" loading={adding}>Add</Button>
              </form>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
          ) : webhooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-3xl mb-3">🔗</p>
                <p className="font-medium mb-1">No webhooks yet</p>
                <p className="text-sm text-muted-foreground">Add a URL above to start receiving lead events.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {webhooks.map((hook) => (
                <Card key={hook.id}>
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-1 font-mono text-sm truncate">{hook.url}</span>
                      <Badge variant={hook.is_active ? 'success' : 'secondary'}>
                        {hook.is_active ? 'Active' : 'Paused'}
                      </Badge>
                      <Button size="sm" variant="outline" loading={toggling === hook.id} onClick={() => handleToggle(hook)}>
                        {hook.is_active ? 'Pause' : 'Resume'}
                      </Button>
                      <Button size="sm" variant="destructive" loading={deleting === hook.id} onClick={() => handleDelete(hook)}>
                        Delete
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Events:</span>
                      {hook.events.map((e) => (
                        <span key={e} className="font-mono bg-secondary px-1.5 py-0.5 rounded">{e}</span>
                      ))}
                      <span className="ml-auto">Secret:</span>
                      {revealed === hook.id ? (
                        <span className="font-mono text-foreground">{hook.secret}</span>
                      ) : (
                        <span className="font-mono">••••••••</span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-1.5 text-xs"
                        onClick={() => setRevealed(revealed === hook.id ? null : hook.id)}
                      >
                        {revealed === hook.id ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-1.5 text-xs"
                        onClick={() => copySecret(hook.secret)}
                      >
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="w-64 shrink-0">
          <Card>
            <CardContent className="pt-4 space-y-3 text-sm">
              <p className="font-medium">Payload format</p>
              <pre className="text-xs bg-secondary rounded p-3 overflow-auto leading-relaxed">{`{
  "event": "lead.created",
  "timestamp": "2026-...",
  "data": {
    "lead": {
      "id": "...",
      "email": "...",
      "full_name": "...",
      "created_at": "..."
    },
    "landing_page": {
      "id": "...",
      "title": "...",
      "slug": "..."
    }
  }
}`}</pre>
              <p className="font-medium">Signature</p>
              <p className="text-xs text-muted-foreground">
                Each request includes an{' '}
                <span className="font-mono text-foreground">X-Webhook-Signature</span>{' '}
                header: <span className="font-mono text-foreground">sha256=&lt;hmac&gt;</span> using your secret.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
