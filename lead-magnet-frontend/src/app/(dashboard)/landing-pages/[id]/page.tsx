'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { landingPageApi, LandingPage } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const BASE_URL = 'http://192.168.1.241:3002';

export default function EditLandingPagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [page, setPage] = useState<LandingPage | null>(null);
  const [form, setForm] = useState({ title: '', description: '', ctaText: '', requireFullName: false, successMessage: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    landingPageApi.get(id).then((res) => {
      const p = res.data.data;
      setPage(p);
      setForm({
        title: p.title,
        description: p.description ?? '',
        ctaText: p.form_config.ctaText,
        requireFullName: p.form_config.requireFullName,
        successMessage: p.form_config.successMessage,
      });
    }).catch(() => {
      toast({ type: 'error', title: 'Not found' });
      router.push('/landing-pages');
    }).finally(() => setLoading(false));
  }, [id, router, toast]);

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await landingPageApi.update(id, { ...form });
      setPage(res.data.data);
      toast({ type: 'success', title: 'Saved' });
    } catch {
      toast({ type: 'error', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!page) return;
    setToggling(true);
    try {
      const res = await landingPageApi.update(id, { isPublished: !page.is_published });
      setPage(res.data.data);
      toast({ type: 'success', title: page.is_published ? 'Unpublished' : 'Published!' });
    } catch {
      toast({ type: 'error', title: 'Failed to update' });
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this landing page? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await landingPageApi.remove(id);
      toast({ type: 'success', title: 'Deleted' });
      router.push('/landing-pages');
    } catch {
      toast({ type: 'error', title: 'Delete failed' });
      setDeleting(false);
    }
  };

  const copyLink = () => {
    if (!page) return;
    navigator.clipboard.writeText(`${BASE_URL}/p/${page.slug}`);
    toast({ type: 'success', title: 'Link copied!' });
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/landing-pages" className="hover:text-foreground">Landing Pages</Link>
        <span>/</span>
        <span className="truncate max-w-xs">{page?.title}</span>
        {page && (
          <Badge variant={page.is_published ? 'success' : 'secondary'}>
            {page.is_published ? 'Published' : 'Draft'}
          </Badge>
        )}
      </div>

      <div className="flex gap-6 items-start">
        <Card className="flex-1 max-w-xl">
          <CardHeader>
            <CardTitle>Edit landing page</CardTitle>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Page title</Label>
                <Input id="title" value={form.title} onChange={setField('title')} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={setField('description')} className="min-h-[80px]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ctaText">CTA headline</Label>
                <Input id="ctaText" value={form.ctaText} onChange={setField('ctaText')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="successMessage">Success message</Label>
                <Input id="successMessage" value={form.successMessage} onChange={setField('successMessage')} placeholder="Thank you! Check your email." />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requireFullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, requireFullName: e.target.checked }))}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm">Require full name</span>
              </label>
            </CardContent>
            <CardFooter className="flex-wrap gap-3">
              <Button type="submit" loading={saving}>Save changes</Button>
              <Button type="button" variant={page?.is_published ? 'outline' : 'secondary'} loading={toggling} onClick={handleTogglePublish}>
                {page?.is_published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button type="button" variant="ghost" onClick={copyLink}>Copy link</Button>
              <Button type="button" variant="destructive" loading={deleting} onClick={handleDelete}>Delete</Button>
              <Link href="/landing-pages">
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        <div className="w-60 shrink-0 space-y-4">
          {page && (
            <Card>
              <CardContent className="pt-4 space-y-3 text-sm">
                <p className="font-medium">Details</p>
                <div className="text-muted-foreground space-y-1">
                  <p>URL</p>
                  <p className="text-foreground font-mono text-xs break-all">/p/{page.slug}</p>
                </div>
                {page.lead_magnets && (
                  <div className="text-muted-foreground space-y-1">
                    <p>Lead magnet</p>
                    <p className="text-foreground">{page.lead_magnets.title}</p>
                  </div>
                )}
                <div className="text-muted-foreground space-y-1">
                  <p>Created</p>
                  <p className="text-foreground">{new Date(page.created_at).toLocaleDateString()}</p>
                </div>
                {page.is_published && page.published_at && (
                  <div className="text-muted-foreground space-y-1">
                    <p>Published</p>
                    <p className="text-foreground">{new Date(page.published_at).toLocaleDateString()}</p>
                  </div>
                )}
                {page.is_published && (
                  <a href={`${BASE_URL}/p/${page.slug}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="w-full mt-2">Open page</Button>
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
