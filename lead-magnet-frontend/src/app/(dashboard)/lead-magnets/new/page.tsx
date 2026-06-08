'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { magnetApi, aiApi } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const TYPE_OPTIONS = [
  { value: 'ebook', label: 'eBook' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'guide', label: 'Guide' },
  { value: 'template', label: 'Template' },
  { value: 'webinar_signup', label: 'Webinar Sign-up' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'friendly', label: 'Friendly' },
];

type Mode = 'generate' | 'url';

export default function NewLeadMagnetPage() {
  const [form, setForm] = useState({ title: '', magnetType: 'guide', content: '' });
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState<Mode>('generate');

  // URL extraction state
  const [url, setUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractType, setExtractType] = useState('guide');
  const [extractTone, setExtractTone] = useState('professional');

  const { toast } = useToast();
  const router = useRouter();

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
      toast({ type: 'error', title: 'Generation failed', description: 'Check that the AI server is reachable.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      toast({ type: 'error', title: 'Enter a URL first' });
      return;
    }
    setExtracting(true);
    try {
      const res = await aiApi.extractFromUrl({ url: url.trim(), magnetType: extractType, tone: extractTone });
      const { title, magnetType, content } = res.data.data;
      setForm({ title, magnetType, content });
      toast({ type: 'success', title: 'Extracted!', description: 'Form pre-filled — review and save.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
        ?? 'Could not extract content from that URL.';
      toast({ type: 'error', title: 'Extraction failed', description: msg });
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast({ type: 'error', title: 'Missing fields', description: 'Title and content are required.' });
      return;
    }
    setLoading(true);
    try {
      const res = await magnetApi.create(form);
      toast({ type: 'success', title: 'Created!', description: `"${res.data.data.title}" is ready.` });
      router.push('/lead-magnets');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to create';
      toast({ type: 'error', title: 'Error', description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/lead-magnets" className="hover:text-foreground">Lead Magnets</Link>
        <span>/</span>
        <span>New</span>
      </div>

      <div className="flex gap-6 items-start">
        {/* Main form */}
        <Card className="flex-1 max-w-2xl">
          <CardHeader>
            <CardTitle>Create lead magnet</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" placeholder="10 Tips to Grow Your Business" value={form.title} onChange={set('title')} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="magnetType">Type</Label>
                <Select id="magnetType" options={TYPE_OPTIONS} value={form.magnetType} onChange={set('magnetType')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your content here, generate with AI, or import from a URL →"
                  value={form.content}
                  onChange={set('content')}
                  className="min-h-[280px] font-mono text-xs"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="gap-3">
              <Button type="submit" loading={loading}>Create</Button>
              <Link href="/lead-magnets">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        {/* AI sidebar */}
        <div className="w-64 shrink-0 space-y-3">

          {/* Mode toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('generate')}
              className={`flex-1 py-2 transition-colors ${mode === 'generate' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              ✨ Generate
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex-1 py-2 transition-colors ${mode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              🔗 From URL
            </button>
          </div>

          {/* Generate panel */}
          {mode === 'generate' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Generate with AI</CardTitle>
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
                  {generating ? 'Generating…' : 'Generate content'}
                </Button>
                <p className="text-xs text-muted-foreground">Fills the content field. You can edit afterwards.</p>
              </CardContent>
            </Card>
          )}

          {/* URL extraction panel */}
          {mode === 'url' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Import from URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="extract-url" className="text-xs">URL</Label>
                  <Input
                    id="extract-url"
                    type="url"
                    placeholder="https://example.com/blog/post"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="extract-type" className="text-xs">Output type</Label>
                  <Select
                    id="extract-type"
                    options={TYPE_OPTIONS}
                    value={extractType}
                    onChange={(e) => setExtractType(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="extract-tone" className="text-xs">Tone</Label>
                  <Select
                    id="extract-tone"
                    options={TONE_OPTIONS}
                    value={extractTone}
                    onChange={(e) => setExtractTone(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  variant="secondary"
                  loading={extracting}
                  onClick={handleExtract}
                >
                  {extracting ? 'Extracting…' : 'Extract & fill form'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Fetches the page, extracts the content with AI, and pre-fills the title and content fields.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
