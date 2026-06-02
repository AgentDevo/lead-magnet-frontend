'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { landingPageApi, LandingPage } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';

const BASE_URL = 'http://192.168.1.241:3002';

export default function LandingPagesPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    landingPageApi.list()
      .then((res) => setPages(res.data.data.pages))
      .catch(() => toast({ type: 'error', title: 'Failed to load landing pages' }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleTogglePublish = async (page: LandingPage) => {
    setToggling(page.id);
    try {
      const res = await landingPageApi.update(page.id, { isPublished: !page.is_published });
      setPages((prev) => prev.map((p) => p.id === page.id ? res.data.data : p));
      toast({ type: 'success', title: page.is_published ? 'Unpublished' : 'Published!' });
    } catch {
      toast({ type: 'error', title: 'Failed to update' });
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (page: LandingPage) => {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    setDeleting(page.id);
    try {
      await landingPageApi.remove(page.id);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      toast({ type: 'success', title: 'Deleted' });
    } catch {
      toast({ type: 'error', title: 'Delete failed' });
    } finally {
      setDeleting(null);
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${BASE_URL}/p/${slug}`);
    toast({ type: 'success', title: 'Link copied!' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Landing Pages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Publish lead capture pages for your magnets</p>
        </div>
        <Link href="/landing-pages/new">
          <Button>New landing page</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-4">🌐</p>
            <p className="font-medium mb-1">No landing pages yet</p>
            <p className="text-sm text-muted-foreground mb-6">Create a landing page to capture leads from your magnets.</p>
            <Link href="/landing-pages/new">
              <Button>Create your first landing page</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium truncate">{page.title}</span>
                    <Badge variant={page.is_published ? 'success' : 'secondary'}>
                      {page.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span>/p/{page.slug}</span>
                    {page.lead_magnets && (
                      <span className="truncate">Magnet: {page.lead_magnets.title}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyLink(page.slug)}
                  >
                    Copy link
                  </Button>
                  {page.is_published && (
                    <a href={`${BASE_URL}/p/${page.slug}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="ghost">Preview</Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    loading={toggling === page.id}
                    onClick={() => handleTogglePublish(page)}
                  >
                    {page.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Link href={`/landing-pages/${page.id}`}>
                    <Button size="sm" variant="secondary">Edit</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    loading={deleting === page.id}
                    onClick={() => handleDelete(page)}
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
