'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { magnetApi, aiApi, LeadMagnet } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const TYPE_OPTIONS = [
  { value: 'ebook', label: 'eBook' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'guide', label: 'Guide' },
  { value: 'template', label: 'Template' },
  { value: 'webinar_signup', label: 'Webinar Sign-up' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'friendly', label: 'Friendly' },
];

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'outline'> = {
  active: 'success',
  draft: 'secondary',
  archived: 'outline',
};

export default function EditLeadMagnetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [magnet, setMagnet] = useState<LeadMagnet | null>(null);
  const [form, setForm] = useState({ title: '', magnetType: 'guide', content: '', status: 'draft' });
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    magnetApi.get(id).then((res) => {
      const m = res.data.data;
      setMagnet(m);
      setForm({ title: m.title, magnetType: m.type, content: m.content, status: m.status });
    }).catch(() => {
      toast({ type: 'error', title: 'Not found' });
      router.push('/lead-magnets');
    }).finally(() => setLoading(false));
  }, [id, router, toast]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleGenerate = async () => {
    if (!form.title.trim()) {
      toast({ type: 'error', title: 'Enter a title first' });
      return;
    }
    setGenerating(true);
    try {
      const res = await aiApi.generate({ title: form.title, magnetType: form.magnetType, audience, tone });
      setForm((prev) => ({ ...prev, content: res.data.data.content }));
      toast({ type: 'success', title: 'Content generated!' });
    } catch {
      toast({ type: 'error', title: 'Generation failed' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await magnetApi.update(id, { ...form, magnetType: form.magnetType });
      setMagnet(res.data.data);
      toast({ type: 'success', title: 'Saved' });
    } catch {
      toast({ type: 'error', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!magnet) return;
    setGeneratingPdf(true);
    try {
      const res = await magnetApi.generatePdf(magnet.id, magnet.title, magnet.content);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${magnet.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ type: 'success', title: 'PDF downloaded' });
    } catch {
      toast({ type: 'error', title: 'PDF generation failed' });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this lead magnet? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await magnetApi.remove(id);
      toast({ type: 'success', title: 'Deleted' });
      router.push('/lead-magnets');
    } catch {
      toast({ type: 'error', title: 'Delete failed' });
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/lead-magnets" className="hover:text-foreground">Lead Magnets</Link>
        <span>/</span>
        <span className="truncate max-w-xs">{magnet?.title}</span>
        {magnet && <Badge variant={STATUS_VARIANT[magnet.status] ?? 'secondary'}>{magnet.status}</Badge>}
      </div>

      <div className="flex gap-6 items-start">
        <Card className="flex-1 max-w-2xl">
          <CardHeader>
            <CardTitle>Edit lead magnet</CardTitle>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={set('title')} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="magnetType">Type</Label>
                  <Select id="magnetType" options={TYPE_OPTIONS} value={form.magnetType} onChange={set('magnetType')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" value={form.content} onChange={set('content')} className="min-h-[280px] font-mono text-xs" required />
              </div>
            </CardContent>
            <CardFooter className="flex-wrap gap-3">
              <Button type="submit" loading={saving}>Save changes</Button>
              <Button type="button" variant="outline" loading={generatingPdf} onClick={handleGeneratePdf}>
                Download PDF
              </Button>
              <Button type="button" variant="destructive" loading={deleting} onClick={handleDelete}>
                Delete
              </Button>
              <Link href="/lead-magnets">
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        <div className="w-64 shrink-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">✨ Generate with AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="audience" className="text-xs">Target audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g. startup founders"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tone" className="text-xs">Tone</Label>
                <Select
                  id="tone"
                  options={TONE_OPTIONS}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <Button
                type="button"
                className="w-full"
                variant="secondary"
                loading={generating}
                onClick={handleGenerate}
              >
                {generating ? 'Generating…' : 'Regenerate content'}
              </Button>
              <p className="text-xs text-muted-foreground">Replaces current content.</p>
            </CardContent>
          </Card>

          {magnet && (
            <Card>
              <CardContent className="pt-4 space-y-3 text-sm">
                <p className="font-medium">Details</p>
                <div className="text-muted-foreground space-y-1">
                  <p>Created</p>
                  <p className="text-foreground">{new Date(magnet.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-muted-foreground space-y-1">
                  <p>Updated</p>
                  <p className="text-foreground">{new Date(magnet.updated_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
