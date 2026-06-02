'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { magnetApi, landingPageApi, LeadMagnet } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function NewLandingPagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [form, setForm] = useState({
    leadMagnetId: '',
    title: '',
    slug: '',
    description: '',
    ctaText: 'Get your free resource',
    requireFullName: false,
  });
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    magnetApi.list({ limit: 100, status: 'active' }).then((res) => {
      const list = res.data.data.magnets;
      setMagnets(list);
      if (list.length > 0) setForm((f) => ({ ...f, leadMagnetId: list[0].id }));
    }).catch(() => toast({ type: 'error', title: 'Could not load lead magnets' }));
  }, [toast]);

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !slugTouched) {
        next.slug = toSlug(value);
      }
      return next;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leadMagnetId) {
      toast({ type: 'error', title: 'Select a lead magnet' });
      return;
    }
    setSaving(true);
    try {
      const res = await landingPageApi.create({
        leadMagnetId: form.leadMagnetId,
        slug: form.slug,
        title: form.title,
        description: form.description || undefined,
        ctaText: form.ctaText || undefined,
        requireFullName: form.requireFullName,
      });
      toast({ type: 'success', title: 'Landing page created' });
      router.push(`/landing-pages/${res.data.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast({ type: 'error', title: msg ?? 'Create failed' });
    } finally {
      setSaving(false);
    }
  };

  const magnetOptions = magnets.map((m) => ({ value: m.id, label: m.title }));

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/landing-pages" className="hover:text-foreground">Landing Pages</Link>
        <span>/</span>
        <span>New</span>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Create landing page</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="leadMagnetId">Lead magnet</Label>
              {magnets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active lead magnets found.{' '}
                  <Link href="/lead-magnets" className="underline">Create one first.</Link>
                </p>
              ) : (
                <Select id="leadMagnetId" options={magnetOptions} value={form.leadMagnetId} onChange={setField('leadMagnetId')} />
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Page title</Label>
              <Input id="title" value={form.title} onChange={setField('title')} required placeholder="e.g. Get your free startup guide" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">URL slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">/p/</span>
                <Input id="slug" value={form.slug} onChange={handleSlugChange} required pattern="[a-z0-9-]+" placeholder="my-landing-page" />
              </div>
              <p className="text-xs text-muted-foreground">Lowercase letters, numbers, hyphens only.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={setField('description')} placeholder="Brief description shown on the page" className="min-h-[80px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ctaText">CTA headline</Label>
              <Input id="ctaText" value={form.ctaText} onChange={setField('ctaText')} placeholder="Get your free resource" />
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
          <CardFooter className="gap-3">
            <Button type="submit" loading={saving} disabled={magnets.length === 0}>Create page</Button>
            <Link href="/landing-pages">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
