'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';

interface AbTest {
  enabled: boolean;
  splitPct?: number;
  variantB?: { title?: string; description?: string; ctaText?: string };
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  form_config: {
    ctaText: string;
    requireFullName: boolean;
    submitLabel: string;
    successMessage: string;
  };
  page_config?: { abTest?: AbTest };
  lead_magnets?: { title: string; type: string };
}

function assignVariant(slug: string, splitPct: number): 'a' | 'b' {
  const key = `ab_variant_${slug}`;
  const stored = sessionStorage.getItem(key);
  if (stored === 'a' || stored === 'b') return stored;
  const variant: 'a' | 'b' = Math.random() * 100 < splitPct ? 'b' : 'a';
  sessionStorage.setItem(key, variant);
  return variant;
}

export default function PublicLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const [page, setPage] = useState<PageData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [variant, setVariant] = useState<'a' | 'b'>('a');
  const [form, setForm] = useState({ email: '', fullName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const viewTracked = useRef(false);

  useEffect(() => {
    axios.get(`/api/p/${slug}`)
      .then((res) => {
        const data: PageData = res.data.data;
        setPage(data);

        const abTest = data.page_config?.abTest;
        if (abTest?.enabled) {
          const v = assignVariant(data.slug, abTest.splitPct ?? 50);
          setVariant(v);
          if (!viewTracked.current) {
            viewTracked.current = true;
            axios.post(`/api/p/${slug}/view`, { variant: v }).catch(() => {});
          }
        }
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const getContent = () => {
    if (!page) return { title: '', description: '', ctaText: '', submitLabel: '', successMessage: '' };
    const ab = page.page_config?.abTest;
    if (ab?.enabled && variant === 'b' && ab.variantB) {
      return {
        title: ab.variantB.title || page.title,
        description: ab.variantB.description ?? page.description,
        ctaText: ab.variantB.ctaText || page.form_config.ctaText,
        submitLabel: page.form_config.submitLabel,
        successMessage: page.form_config.successMessage,
      };
    }
    return {
      title: page.title,
      description: page.description,
      ctaText: page.form_config.ctaText,
      submitLabel: page.form_config.submitLabel,
      successMessage: page.form_config.successMessage,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`/api/p/${slug}`, {
        email: form.email,
        fullName: form.fullName || undefined,
        gdprConsent: true,
        utmSource: searchParams.get('utm_source') ?? undefined,
        utmMedium: searchParams.get('utm_medium') ?? undefined,
        utmCampaign: searchParams.get('utm_campaign') ?? undefined,
        variant: page?.page_config?.abTest?.enabled ? variant : undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-6xl mb-4">404</p>
          <p className="text-muted-foreground">This page does not exist or has been unpublished.</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const content = getContent();

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <p className="text-5xl">🎉</p>
          <h2 className="text-2xl font-bold">{content.successMessage || 'Thank you!'}</h2>
          <p className="text-muted-foreground">We will be in touch soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">{content.ctaText || content.title}</h1>
          {content.description && (
            <p className="text-lg text-muted-foreground">{content.description}</p>
          )}
        </div>

        <div className="bg-card border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            Get instant access
            {page.lead_magnets && (
              <span className="block text-sm font-normal text-muted-foreground mt-1">
                {page.lead_magnets.title}
              </span>
            )}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {page.form_config.requireFullName && (
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-sm font-medium">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Jane Doe"
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-md bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Sending...' : (content.submitLabel || 'Send me the resource')}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              No spam. Unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
