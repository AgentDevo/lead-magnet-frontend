import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">LeadMagnet AI</span>
          <div className="flex items-center gap-3">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
          Powered by NVIDIA gpt-oss-120b
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Generate lead magnets<br />
          <span className="text-accent">in seconds with AI</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Create eBooks, checklists, guides, and templates. Publish a landing page. Capture leads.
          Everything in one place — no designers, no copywriters needed.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium h-11 px-8 hover:bg-primary/90 transition-colors"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background text-sm font-medium h-11 px-8 hover:bg-secondary transition-colors"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No credit card required</p>
      </section>

      {/* Dashboard preview */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-xl border border-border bg-secondary/40 overflow-hidden shadow-lg">
          <div className="border-b border-border bg-secondary/60 px-4 py-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive/50"></div>
            <div className="h-3 w-3 rounded-full bg-muted"></div>
            <div className="h-3 w-3 rounded-full bg-muted"></div>
            <span className="ml-3 text-xs text-muted-foreground">Lead Magnet Generator — Dashboard</span>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Lead magnets</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Total leads</p>
              <p className="text-2xl font-bold">847</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Conversion rate</p>
              <p className="text-2xl font-bold">6.4%</p>
            </div>
            <div className="col-span-3 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Recent lead magnets</p>
                <span className="text-xs text-accent font-medium">+ New</span>
              </div>
              <div className="space-y-2">
                {[
                  { title: '10 Ways to Double Your SaaS Revenue', type: 'Guide', status: 'Active' },
                  { title: 'The Ultimate Startup Checklist', type: 'Checklist', status: 'Active' },
                  { title: 'Email Marketing Playbook', type: 'eBook', status: 'Draft' },
                ].map((m) => (
                  <div key={m.title} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm">{m.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{m.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{m.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-4">Everything you need to capture leads</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            From AI content generation to published landing pages — the full funnel in one tool.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
                title: 'AI content generation',
                desc: 'Describe your audience and tone. Get a fully written eBook, checklist, or guide in under 20 seconds.',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                  </svg>
                ),
                title: 'Instant landing pages',
                desc: 'Publish a conversion-optimised landing page with a custom slug in one click. No design skills needed.',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
                title: 'Lead capture & CRM',
                desc: 'Every form submission is stored, tagged with UTM source, and available for export or webhook delivery.',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                ),
                title: 'Auto PDF delivery',
                desc: 'Generated content is rendered into a styled PDF and automatically emailed to every new lead.',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
                title: 'Analytics & UTM tracking',
                desc: 'See page views, lead counts, conversion rates, and which traffic sources perform best — per landing page.',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                ),
                title: 'Webhooks & integrations',
                desc: 'Push new leads to your CRM, email platform, or Zapier in real-time via configurable webhooks.',
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="mt-0.5 h-9 w-9 shrink-0 rounded-lg border border-border bg-secondary flex items-center justify-center text-foreground">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-4">How it works</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            Three steps from idea to live lead capture.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Describe your lead magnet',
                desc: 'Pick a type (checklist, guide, eBook), enter a title and target audience. The AI writes the full content.',
              },
              {
                step: '02',
                title: 'Publish a landing page',
                desc: 'One click creates a public landing page at your custom slug with a lead capture form already attached.',
              },
              {
                step: '03',
                title: 'Watch leads come in',
                desc: 'Every submission is logged, the PDF is emailed to the lead, and you get notified instantly.',
              },
            ].map((s) => (
              <div key={s.step}>
                <span className="text-5xl font-black text-muted/60 leading-none">{s.step}</span>
                <h3 className="mt-3 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Ready to grow your list?</h2>
          <p className="text-muted-foreground mb-10">
            Create your first AI-generated lead magnet in under two minutes. Free to start.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium h-11 px-10 hover:bg-primary/90 transition-colors"
          >
            Get started for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-sm">LeadMagnet AI</span>
          <p className="text-xs text-muted-foreground">Built with Next.js + NVIDIA AI</p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
