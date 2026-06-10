'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { landingPageApi, aiApi, LandingPage } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.241:3002';

interface AbStats {
  views: number;
  leads: number;
  cvr: number;
}

interface AbResults {
  enabled: boolean;
  stats: { a: AbStats; b: AbStats } | null;
  winner: 'a' | 'b' | null;
  total: number;
  minReached: boolean;
  splitPct: number;
}

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
  const [regenerating, setRegenerating] = useState(false);

  // A/B test state
  const [abEnabled, setAbEnabled] = useState(false);
  const [abSplitPct, setAbSplitPct] = useState(50);
  const [abForm, setAbForm] = useState({ title: '', description: '', ctaText: '' });
  const [savingAb, setSavingAb] = useState(false);
  const [generatingAb, setGeneratingAb] = useState(false);
  const [abResults, setAbResults] = useState<AbResults | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const fetchAbResults = useCallback(async () => {
    setLoadingResults(true);
    try {
      const res = await axios.get(`/api/landing-pages/${id}/ab-results`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAbResults(res.data.data);
    } catch { /* non-fatal */ }
    finally { setLoadingResults(false); }
  }, [id]);

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
      const ab = (p as unknown as { page_config?: { abTest?: { enabled?: boolean; splitPct?: number; variantB?: { title?: string; description?: string; ctaText?: string } } } }).page_config?.abTest;
      if (ab) {
        setAbEnabled(ab.enabled ?? false);
        setAbSplitPct(ab.splitPct ?? 50);
        setAbForm({
          title: ab.variantB?.title ?? '',
          description: ab.variantB?.description ?? '',
          ctaText: ab.variantB?.ctaText ?? '',
        });
      }
    }).catch(() => {
      toast({ type: 'error', title: 'Not found' });
      router.push('/landing-pages');
    }).finally(() => setLoading(false));
  }, [id, router, toast]);

  useEffect(() => {
    if (!loading) fetchAbResults();
  }, [loading, fetchAbResults]);

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

  const handleRegenerate = async () => {
    if (!page?.lead_magnets) return;
    setRegenerating(true);
    try {
      const res = await aiApi.generatePageCopy({ title: page.lead_magnets.title, type: page.lead_magnets.type });
      const { headline, subheadline, ctaText } = res.data.data;
      setForm((prev) => ({ ...prev, title: headline, description: subheadline, ctaText }));
    } catch {
      toast({ type: 'error', title: 'Regeneration failed' });
    } finally {
      setRegenerating(false);
    }
  };

  const handleGenerateVariantB = async () => {
    if (!page?.lead_magnets) return;
    setGeneratingAb(true);
    try {
      const res = await aiApi.generatePageCopy({ title: page.lead_magnets.title, type: page.lead_magnets.type });
      const { headline, subheadline, ctaText } = res.data.data;
      setAbForm({ title: headline, description: subheadline, ctaText });
    } catch {
      toast({ type: 'error', title: 'AI generation failed' });
    } finally {
      setGeneratingAb(false);
    }
  };

  const handleSaveAbTest = async () => {
    setSavingAb(true);
    try {
      const res = await landingPageApi.update(id, {
        abTestEnabled: abEnabled,
        abTestSplitPct: abSplitPct,
        abTestTitle: abForm.title,
        abTestDescription: abForm.description,
        abTestCtaText: abForm.ctaText,
      } as Parameters<typeof landingPageApi.update>[1]);
      setPage(res.data.data);
      toast({ type: 'success', title: 'A/B test saved' });
      await fetchAbResults();
    } catch {
      toast({ type: 'error', title: 'Save failed' });
    } finally {
      setSavingAb(false);
    }
  };

  const handleResetStats = async () => {
    if (!confirm('Reset A/B test stats? All view and lead counts will be cleared.')) return;
    setSavingAb(true);
    try {
      await landingPageApi.update(id, { abTestResetStats: true } as Parameters<typeof landingPageApi.update>[1]);
      toast({ type: 'success', title: 'Stats reset' });
      await fetchAbResults();
    } catch {
      toast({ type: 'error', title: 'Reset failed' });
    } finally {
      setSavingAb(false);
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

      <div className="flex gap-6 items-start flex-wrap">
        {/* Main edit card */}
        <Card className="flex-1 min-w-[320px] max-w-xl">
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
                <input type="checkbox" checked={form.requireFullName} onChange={(e) => setForm((prev) => ({ ...prev, requireFullName: e.target.checked }))} className="h-4 w-4 rounded border-border" />
                <span className="text-sm">Require full name</span>
              </label>
            </CardContent>
            <CardFooter className="flex-wrap gap-3">
              <Button type="submit" loading={saving}>Save changes</Button>
              <Button type="button" variant={page?.is_published ? 'outline' : 'secondary'} loading={toggling} onClick={handleTogglePublish}>
                {page?.is_published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button type="button" variant="ghost" onClick={copyLink}>Copy link</Button>
              <Button type="button" variant="outline" loading={regenerating} onClick={handleRegenerate} disabled={!page?.lead_magnets}>Regenerate copy</Button>
              <Button type="button" variant="destructive" loading={deleting} onClick={handleDelete}>Delete</Button>
              <Link href="/landing-pages">
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4 w-full max-w-xl xl:max-w-xs">
          {/* Page details */}
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

          {/* A/B Test config */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">A/B Test</CardTitle>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={abEnabled}
                    onChange={(e) => setAbEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm text-muted-foreground">{abEnabled ? 'On' : 'Off'}</span>
                </label>
              </div>
            </CardHeader>
            {abEnabled && (
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Variant B — alternative copy</p>
                  <Button type="button" size="sm" variant="ghost" onClick={handleGenerateVariantB} disabled={generatingAb || !page?.lead_magnets}>
                    {generatingAb ? <Spinner className="h-3 w-3 mr-1" /> : null}
                    AI generate
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ab-title">Headline B</Label>
                  {generatingAb ? (
                    <div className="h-9 rounded-md border border-border bg-secondary/20 animate-pulse" />
                  ) : (
                    <Input id="ab-title" value={abForm.title} onChange={(e) => setAbForm((p) => ({ ...p, title: e.target.value }))} placeholder="Alternative headline" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ab-desc">Subheadline B</Label>
                  {generatingAb ? (
                    <div className="h-[60px] rounded-md border border-border bg-secondary/20 animate-pulse" />
                  ) : (
                    <Textarea id="ab-desc" value={abForm.description} onChange={(e) => setAbForm((p) => ({ ...p, description: e.target.value }))} className="min-h-[60px]" placeholder="Alternative subheadline" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ab-cta">CTA button B</Label>
                  {generatingAb ? (
                    <div className="h-9 rounded-md border border-border bg-secondary/20 animate-pulse" />
                  ) : (
                    <Input id="ab-cta" value={abForm.ctaText} onChange={(e) => setAbForm((p) => ({ ...p, ctaText: e.target.value }))} placeholder="Alternative CTA" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ab-split">Traffic to variant B</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="ab-split"
                      type="range"
                      min={10}
                      max={90}
                      step={5}
                      value={abSplitPct}
                      onChange={(e) => setAbSplitPct(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-10 text-right">{abSplitPct}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">A gets {100 - abSplitPct}% · B gets {abSplitPct}%</p>
                </div>
              </CardContent>
            )}
            <CardFooter className="gap-2 pt-3">
              <Button type="button" size="sm" loading={savingAb} onClick={handleSaveAbTest}>Save test</Button>
              {abEnabled && (
                <Button type="button" size="sm" variant="ghost" onClick={handleResetStats} disabled={savingAb}>Reset stats</Button>
              )}
            </CardFooter>
          </Card>

          {/* A/B Results */}
          {abEnabled && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Results</CardTitle>
                  <Button type="button" size="sm" variant="ghost" onClick={fetchAbResults} disabled={loadingResults}>
                    {loadingResults ? <Spinner className="h-3 w-3" /> : 'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {abResults?.stats ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 text-xs text-muted-foreground font-medium pb-1 border-b border-border">
                      <span></span>
                      <span className="text-center">Views</span>
                      <span className="text-center">Leads</span>
                      <span className="text-center">CVR</span>
                    </div>
                    {(['a', 'b'] as const).map((v) => {
                      const s = abResults.stats![v];
                      const isWinner = abResults.winner === v;
                      return (
                        <div key={v} className={`grid grid-cols-4 text-sm items-center rounded-md px-2 py-1.5 ${isWinner ? 'bg-green-500/10 text-green-600' : ''}`}>
                          <span className="font-medium flex items-center gap-1">
                            {v === 'a' ? 'A (original)' : 'B (variant)'}
                            {isWinner && <span className="text-xs">🏆</span>}
                          </span>
                          <span className="text-center">{s.views}</span>
                          <span className="text-center">{s.leads}</span>
                          <span className={`text-center font-medium ${isWinner ? 'text-green-600' : ''}`}>{s.cvr}%</span>
                        </div>
                      );
                    })}
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                      {abResults.winner
                        ? `Variant ${abResults.winner.toUpperCase()} is the winner with statistical confidence.`
                        : abResults.minReached
                          ? 'Collecting data — no clear winner yet.'
                          : `Need ≥50 views per variant (${abResults.total} total so far).`}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data yet. Publish the page to start collecting results.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
