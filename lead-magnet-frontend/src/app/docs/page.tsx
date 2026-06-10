'use client';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function DocsPage() {
  const { t } = useLanguage();
  const d = t.docs;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">LeadMagnet AI</Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.signIn}
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium h-9 px-4 hover:bg-primary/90 transition-colors">
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">

        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{d.nav}</p>
            <nav className="space-y-1">
              {d.sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="block text-sm text-muted-foreground hover:text-foreground py-1 transition-colors">
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">

          <div className="mb-10">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{d.tag}</p>
            <h1 className="text-4xl font-bold tracking-tight mb-3">{d.heading}</h1>
            <p className="text-muted-foreground text-lg">{d.sub}</p>
          </div>

          {/* Getting started */}
          <section id="getting-started" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">{d.gettingStarted.heading}</h2>
            <p className="text-muted-foreground mb-4">{d.gettingStarted.body}</p>
            <ol className="space-y-3 text-sm">
              {d.gettingStarted.steps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Create lead magnet */}
          <section id="create-lead-magnet" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">{d.createMagnet.heading}</h2>
            <p className="text-muted-foreground mb-4">{d.createMagnet.body}</p>
            <div className="space-y-4 text-sm">
              {d.createMagnet.fields.map((field) => (
                <div key={field.name} className="rounded-lg border border-border p-4 bg-secondary/30">
                  <p className="font-semibold mb-1">{field.name}</p>
                  <p className="text-muted-foreground mb-2">{field.desc}</p>
                  {'types' in field && (
                    <ul className="space-y-1 text-muted-foreground">
                      {field.types.map((type) => (
                        <li key={type.name}><span className="font-medium text-foreground">{type.name}</span> — {type.desc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* AI generation */}
          <section id="ai-generation" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">{d.aiGeneration.heading}</h2>
            <p className="text-muted-foreground mb-4">{d.aiGeneration.body}</p>
            <div className="space-y-3 text-sm">
              {d.aiGeneration.fields.map((f) => (
                <div key={f.name} className="flex gap-3">
                  <span className="shrink-0 font-mono text-xs bg-secondary border border-border px-2 py-0.5 rounded h-fit mt-0.5">{f.name}</span>
                  <p className="text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
              <p className="font-semibold mb-1">{d.aiGeneration.tip.heading}</p>
              <p className="text-muted-foreground">{d.aiGeneration.tip.body}</p>
            </div>
          </section>

          {/* Landing pages */}
          <section id="landing-pages" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">{d.landingPages.heading}</h2>
            <p className="text-muted-foreground mb-4">{d.landingPages.body}</p>
            <div className="space-y-3 text-sm">
              {d.landingPages.fields.map((f) => (
                <div key={f.name} className="flex gap-3">
                  <span className="shrink-0 font-mono text-xs bg-secondary border border-border px-2 py-0.5 rounded h-fit mt-0.5">{f.name}</span>
                  <p className="text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
              <p className="font-semibold mb-2">{d.landingPages.urlLabel}</p>
              <p className="font-mono text-xs text-muted-foreground">http://your-server/p/&lt;slug&gt;</p>
            </div>
          </section>

          {/* A/B testing */}
          <section id="ab-testing" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">{d.abTesting.heading}</h2>
            <p className="text-muted-foreground mb-4">{d.abTesting.body}</p>
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-2">{d.abTesting.enableHeading}</p>
                <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                  {d.abTesting.enableSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-1">{d.abTesting.resultsHeading}</p>
                <p className="text-muted-foreground">{d.abTesting.resultsBody}</p>
              </div>
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-1">{d.abTesting.winnerHeading}</p>
                <p className="text-muted-foreground">{d.abTesting.winnerBody}</p>
              </div>
              <p className="text-sm text-muted-foreground italic">{d.abTesting.resetNote}</p>
            </div>
          </section>

          {/* Leads */}
          <section id="leads" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">{d.leadsSection.heading}</h2>
            <p className="text-muted-foreground mb-4">{d.leadsSection.body1}</p>
            <p className="text-muted-foreground mb-4">{d.leadsSection.body2}</p>
            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm space-y-2">
              <p className="font-semibold">{d.leadsSection.recorded}</p>
              <ul className="text-muted-foreground space-y-1">
                {d.leadsSection.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </section>

          {/* PDF delivery */}
          <section id="pdf-delivery" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">{d.pdfDelivery.heading}</h2>
            <p className="text-muted-foreground mb-4">{d.pdfDelivery.body1}</p>
            <p className="text-muted-foreground mb-4">{d.pdfDelivery.body2}</p>
            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
              <p className="font-semibold mb-1">{d.pdfDelivery.noteHeading}</p>
              <p className="text-muted-foreground">{d.pdfDelivery.noteBody}</p>
            </div>
          </section>

          {/* Analytics */}
          <section id="analytics" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">{d.analytics.heading}</h2>
            <p className="text-muted-foreground mb-4">{d.analytics.body}</p>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-2">{d.analytics.metricsHeading}</p>
                <ul className="text-muted-foreground space-y-1">
                  {d.analytics.metrics.map((m) => (
                    <li key={m.name}><span className="font-medium text-foreground">{m.name}</span> — {m.desc}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-2">{d.analytics.utmHeading}</p>
                <p className="text-muted-foreground mb-2">{d.analytics.utmBody}</p>
                <p className="font-mono text-xs text-muted-foreground break-all">/p/my-checklist?utm_source=twitter&utm_medium=social&utm_campaign=launch</p>
              </div>
            </div>
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">{d.webhooks.heading}</h2>
            <p className="text-muted-foreground mb-4">{d.webhooks.body}</p>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-2">{d.webhooks.setupHeading}</p>
                <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                  {d.webhooks.setupSteps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </div>
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <p className="font-semibold mb-2">{d.webhooks.payloadHeading}</p>
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
                <p className="font-semibold mb-1">{d.webhooks.securityHeading}</p>
                <p className="text-muted-foreground text-sm">{d.webhooks.securityBody}</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center mt-4">
            <h3 className="text-xl font-bold mb-2">{d.docsCta.heading}</h3>
            <p className="text-muted-foreground text-sm mb-6">{d.docsCta.sub}</p>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium h-10 px-8 hover:bg-primary/90 transition-colors">
              {d.docsCta.button}
            </Link>
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-bold text-sm">LeadMagnet AI</Link>
          <p className="text-xs text-muted-foreground">{t.footer.built}</p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">{t.footer.home}</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors font-medium text-foreground">{t.footer.docs}</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">{t.footer.signIn}</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">{t.footer.signUp}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
