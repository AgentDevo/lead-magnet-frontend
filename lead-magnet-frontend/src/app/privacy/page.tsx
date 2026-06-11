import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy – LeadMagnet AI',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="font-bold text-lg tracking-tight">LeadMagnet AI</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-14 space-y-10 text-sm leading-relaxed">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: June 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Data controller</h2>
          <p className="text-muted-foreground">
            This service is operated by the account holder who published the landing page you submitted your information on
            (the <strong>controller</strong>). If you reached this policy from a specific landing page, the controller is the
            business or individual who created that page. For questions about your data, contact them directly via the email
            address they have made available.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. What data we collect</h2>
          <p className="text-muted-foreground">When you submit a lead capture form we collect:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
            <li>Email address (required)</li>
            <li>Full name (optional, only if the form requests it)</li>
            <li>UTM marketing parameters (utm_source, utm_medium, utm_campaign) — derived from the URL you arrived on, if present</li>
            <li>Date and time of submission</li>
            <li>A record that you gave explicit consent</li>
          </ul>
          <p className="text-muted-foreground">We do <strong>not</strong> collect IP addresses, device fingerprints, or browser cookies from lead capture forms.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Legal basis and purpose</h2>
          <p className="text-muted-foreground">
            Your data is processed on the basis of your explicit consent (GDPR Art. 6(1)(a)). You provided consent by
            ticking the checkbox on the form. The purpose is to deliver the requested lead magnet (e.g. eBook, checklist,
            guide) and for the controller to follow up with related communications you agreed to receive.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Data retention</h2>
          <p className="text-muted-foreground">
            Your personal data is retained for as long as the controller maintains their account, or until you request
            deletion (see section 6). Controllers are encouraged to apply a maximum retention period appropriate to their
            use case (typically 24 months for inactive contacts).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Data sharing</h2>
          <p className="text-muted-foreground">
            Your data is stored in Supabase (EU or US region depending on controller configuration). It may be transmitted
            to third-party services the controller has connected via webhooks (e.g. CRM, email marketing platforms) — only
            where you have consented. We do not sell personal data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Your rights (GDPR)</h2>
          <p className="text-muted-foreground">Under the GDPR you have the right to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
            <li><strong>Access</strong> — request a copy of the personal data held about you</li>
            <li><strong>Rectification</strong> — correct inaccurate data</li>
            <li><strong>Erasure</strong> — request deletion of your data (&quot;right to be forgotten&quot;)</li>
            <li><strong>Restriction</strong> — ask us to limit processing of your data</li>
            <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
            <li><strong>Withdraw consent</strong> — you may withdraw consent at any time without affecting the lawfulness of prior processing</li>
            <li><strong>Lodge a complaint</strong> — with your national supervisory authority (e.g. the ICO in the UK, CNIL in France, or the relevant EU DPA)</li>
          </ul>
          <p className="text-muted-foreground">
            To exercise any of these rights, contact the controller who published the landing page, or email the address
            provided in their communications to you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Cookies</h2>
          <p className="text-muted-foreground">
            Lead capture pages use <strong>sessionStorage</strong> (not cookies) to persist A/B test variant assignment
            within a single browser session. This data is never transmitted to our servers and is cleared when you close
            the browser tab. No tracking cookies are set.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. Changes to this policy</h2>
          <p className="text-muted-foreground">
            We may update this policy from time to time. The &quot;Last updated&quot; date at the top reflects the most
            recent revision. Continued use of the service after changes constitutes acceptance.
          </p>
        </section>

        <div className="pt-4 border-t border-border">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to LeadMagnet AI
          </Link>
        </div>
      </main>
    </div>
  );
}
