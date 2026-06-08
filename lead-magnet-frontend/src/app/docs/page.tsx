import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation — LeadMagnet AI',
  description: 'Learn how to create AI-generated lead magnets, publish landing pages, and capture leads.',
};

const sections = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'create-lead-magnet', label: 'Create a lead magnet' },
  { id: 'ai-generation', label: 'AI content generation' },
  { id: 'landing-pages', label: 'Landing pages' },
  { id: 'leads', label: 'Leads & capture' },
  { id: 'pdf-delivery', label: 'PDF delivery' },
  { id: 'analytics', label: 'Analytics & UTM' },
  { id: 'webhooks', label: 'Webhooks' },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">LeadMagnet AI</Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium h-9 px-4 hover:bg-primary/90 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">

        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">On this page</p>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-sm text-muted-foreground hover:text-foreground py-1 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 prose-headings:font-bold prose-headings:tracking-tight">

          <div className="mb-10">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Documentation</p>
            <h1 className="text-4xl font-bold tracking-tight mb-3">How to use LeadMagnet AI</h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to go from idea to live lead capture — in under five minutes.
            </p>
          </div>

          {/* Getting started */}
          <section id="getting-started" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">Getting started</h2>
            <p className="text-muted-foreground mb-4">
              LeadMagnet AI lets you create AI-written lead magnets (eBooks, checklists, guides, templates),
              publish a landing page with a lead capture form, and receive every submission automatically.
            </p>
            <ol className="space-y-3 text-sm">
              {[
                { step: 1, text: 'Sign up at /signup — no credit card required.' },
                { step: 2, text: 'Create your first lead magnet using the AI generator.' },
                { step: 3, text: 'Publish a landing page linked to that lead magnet.' },
                { step: 4, text: 'Share the landing page URL and watch leads arrive.' },
              ].map(({ step, text }) => (
                <li key={step} className="flex gap-3 items-start">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">{step}</span>
                  <span className="text-foreground">{text}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Create lead magnet */}
          <section id="create-lead-magnet" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">Create a lead magnet</h2>
            <p className="text-muted-foreground mb-4">
              Go to <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">Lead Magnets → New</span> in the dashboard.
            </p>
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-1">Title</p>
                <p className="text-muted-foreground">The name of your lead magnet. This becomes the headline inside the PDF and on the landing page. Be specific — e.g. <em>"10 Cold Email Templates for SaaS Founders"</em>.</p>
              </div>
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-1">Type</p>
                <p className="text-muted-foreground mb-2">Choose the format that best fits your content:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><span className="font-medium text-foreground">eBook</span> — multi-chapter long-form content with intro and conclusion</li>
                  <li><span className="font-medium text-foreground">Checklist</span> — 10–15 actionable items grouped by section</li>
                  <li><span className="font-medium text-foreground">Guide</span> — step-by-step how-to with numbered instructions</li>
                  <li><span className="font-medium text-foreground">Template</span> — fill-in-the-blank document with placeholder sections</li>
                  <li><span className="font-medium text-foreground">Webinar sign-up</span> — agenda, outcomes, and speaker bio placeholder</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-1">Content</p>
                <p className="text-muted-foreground">Write your own content, paste existing copy, or use the AI panel on the right to generate it automatically. HTML is supported.</p>
              </div>
            </div>
          </section>

          {/* AI generation */}
          <section id="ai-generation" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">AI content generation</h2>
            <p className="text-muted-foreground mb-4">
              The AI panel on the new lead magnet page generates complete, structured content in one click.
              It uses <span className="font-medium text-foreground">NVIDIA gpt-oss-120b</span> — typically returns content in 15–25 seconds.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="shrink-0 font-mono text-xs bg-secondary border border-border px-2 py-0.5 rounded h-fit mt-0.5">Target audience</span>
                <p className="text-muted-foreground">Who this lead magnet is for. Be specific: <em>"B2B SaaS founders raising a seed round"</em> produces better output than <em>"startups"</em>.</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 font-mono text-xs bg-secondary border border-border px-2 py-0.5 rounded h-fit mt-0.5">Tone</span>
                <p className="text-muted-foreground">Professional, Casual, Authoritative, or Friendly. Defaults to Professional.</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
              <p className="font-semibold mb-1">Tip</p>
              <p className="text-muted-foreground">After generating, you can freely edit the content in the text area before saving. The AI output is a starting point, not locked in.</p>
            </div>
          </section>

          {/* Landing pages */}
          <section id="landing-pages" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">Landing pages</h2>
            <p className="text-muted-foreground mb-4">
              Go to <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">Landing Pages → New</span>. Each landing page is linked to one lead magnet.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="shrink-0 font-mono text-xs bg-secondary border border-border px-2 py-0.5 rounded h-fit mt-0.5">Slug</span>
                <p className="text-muted-foreground">The URL path for your page: <span className="font-mono">yourdomain.com/p/your-slug</span>. Use lowercase letters and hyphens only. Must be unique.</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 font-mono text-xs bg-secondary border border-border px-2 py-0.5 rounded h-fit mt-0.5">CTA text</span>
                <p className="text-muted-foreground">The label on the download button. Defaults to "Get free access". Try action-oriented copy like "Download the checklist".</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 font-mono text-xs bg-secondary border border-border px-2 py-0.5 rounded h-fit mt-0.5">Published</span>
                <p className="text-muted-foreground">Unpublished pages return 404 to visitors. Toggle to publish when you're ready to share the link.</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
              <p className="font-semibold mb-2">Public URL format</p>
              <p className="font-mono text-xs text-muted-foreground">http://your-server/p/&lt;slug&gt;</p>
            </div>
          </section>

          {/* Leads */}
          <section id="leads" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">Leads & capture</h2>
            <p className="text-muted-foreground mb-4">
              Every visitor who submits the form on a landing page becomes a lead. The form collects email, optional full name, and GDPR consent.
            </p>
            <p className="text-muted-foreground mb-4">
              View all captured leads under <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">Leads</span> in the sidebar. You can filter by landing page.
            </p>
            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm space-y-2">
              <p className="font-semibold">What is recorded per lead</p>
              <ul className="text-muted-foreground space-y-1">
                <li>Email address and full name</li>
                <li>Which landing page they submitted on</li>
                <li>UTM parameters (source, medium, campaign) from the URL</li>
                <li>GDPR consent checkbox status</li>
                <li>Submission timestamp</li>
              </ul>
            </div>
          </section>

          {/* PDF delivery */}
          <section id="pdf-delivery" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">PDF delivery</h2>
            <p className="text-muted-foreground mb-4">
              When a lead submits the form, the backend automatically generates a styled PDF from the lead magnet content and emails it to the lead's address.
            </p>
            <p className="text-muted-foreground mb-4">
              You can also manually generate and download a PDF for any lead magnet from the lead magnet detail page using the <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">Download PDF</span> button.
            </p>
            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
              <p className="font-semibold mb-1">Email delivery requires Resend</p>
              <p className="text-muted-foreground">
                PDF emails are sent via <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Resend</a>.
                The <span className="font-mono">RESEND_API_KEY</span> environment variable must be set on the backend. Free tier covers 3,000 emails/month.
              </p>
            </div>
          </section>

          {/* Analytics */}
          <section id="analytics" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">Analytics & UTM tracking</h2>
            <p className="text-muted-foreground mb-4">
              The <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">Analytics</span> page shows per-landing-page stats and aggregate totals.
            </p>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-2">Metrics tracked</p>
                <ul className="text-muted-foreground space-y-1">
                  <li><span className="font-medium text-foreground">Page views</span> — every visit to <span className="font-mono text-xs">/p/slug</span> increments the counter</li>
                  <li><span className="font-medium text-foreground">Leads</span> — number of successful form submissions</li>
                  <li><span className="font-medium text-foreground">Conversion rate</span> — leads ÷ views × 100</li>
                  <li><span className="font-medium text-foreground">Top source</span> — the UTM source that drove the most leads</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-2">UTM parameters</p>
                <p className="text-muted-foreground mb-2">Add UTM params to your landing page URLs to track traffic sources:</p>
                <p className="font-mono text-xs text-muted-foreground break-all">/p/my-checklist?utm_source=twitter&utm_medium=social&utm_campaign=launch</p>
              </div>
            </div>
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">Webhooks</h2>
            <p className="text-muted-foreground mb-4">
              Webhooks let you push new lead data to external systems (CRMs, email platforms, Zapier, Make) in real time.
              Configure them under <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">Webhooks</span> in the sidebar.
            </p>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-2">Setup</p>
                <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Click <strong>New webhook</strong> and enter your endpoint URL.</li>
                  <li>Select which events to subscribe to (e.g. <span className="font-mono text-xs">lead.created</span>).</li>
                  <li>Save — the webhook fires on the next matching event.</li>
                </ol>
              </div>
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-2">Payload (lead.created)</p>
                <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre">{`{
  "event": "lead.created",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "landing_page": { "title": "...", "slug": "..." },
    "utm_source": "twitter",
    "created_at": "2026-06-08T..."
  }
}`}</pre>
              </div>
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-1">Security</p>
                <p className="text-muted-foreground text-sm">Each webhook has a secret. The backend signs every request with an <span className="font-mono text-xs">X-Webhook-Secret</span> header — verify it on your endpoint to reject spoofed requests.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center mt-4">
            <h3 className="text-xl font-bold mb-2">Ready to start?</h3>
            <p className="text-muted-foreground text-sm mb-6">Create your first lead magnet in under two minutes.</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium h-10 px-8 hover:bg-primary/90 transition-colors"
            >
              Get started free
            </Link>
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-bold text-sm">LeadMagnet AI</Link>
          <p className="text-xs text-muted-foreground">Built with Next.js + NVIDIA AI</p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors font-medium text-foreground">Docs</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
