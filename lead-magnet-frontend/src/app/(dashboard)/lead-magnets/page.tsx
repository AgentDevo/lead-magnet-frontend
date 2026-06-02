'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { magnetApi, LeadMagnet } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'outline'> = {
  active: 'success',
  draft: 'secondary',
  archived: 'outline',
};

const TYPE_LABELS: Record<string, string> = {
  ebook: 'eBook',
  checklist: 'Checklist',
  guide: 'Guide',
  template: 'Template',
  webinar_signup: 'Webinar',
};

export default function LeadMagnetsPage() {
  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMagnets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await magnetApi.list();
      setMagnets(res.data.data.magnets);
    } catch {
      toast({ type: 'error', title: 'Failed to load lead magnets' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchMagnets(); }, [fetchMagnets]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await magnetApi.remove(id);
      setMagnets((prev) => prev.filter((m) => m.id !== id));
      toast({ type: 'success', title: 'Deleted', description: `"${title}" was removed.` });
    } catch {
      toast({ type: 'error', title: 'Delete failed' });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lead Magnets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {magnets.length} total
          </p>
        </div>
        <Link href="/lead-magnets/new">
          <Button>+ New</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : magnets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-4">⚡</p>
            <h3 className="font-semibold mb-1">No lead magnets yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first one to start collecting leads.</p>
            <Link href="/lead-magnets/new">
              <Button>Create lead magnet</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {magnets.map((m) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{m.title}</h3>
                    <Badge variant={STATUS_VARIANT[m.status] ?? 'secondary'}>{m.status}</Badge>
                    <Badge variant="outline">{TYPE_LABELS[m.type as string] ?? m.type}</Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/lead-magnets/${m.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    loading={deleting === m.id}
                    onClick={() => handleDelete(m.id, m.title)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
