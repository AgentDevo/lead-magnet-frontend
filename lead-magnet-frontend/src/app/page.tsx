'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MeshGradient } from '@paper-design/shaders-react';
import { useLanguage } from '@/lib/i18n';
import DisplayCards from '@/components/ui/display-cards';

const ShaderHero = dynamic(() => import('@/components/ui/shader-hero'), { ssr: false });

const FEATURE_ICONS = [
  <svg key="ai" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
  <svg key="page" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>,
  <svg key="lead" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  <svg key="pdf" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
  <svg key="analytics" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  <svg key="webhook" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
];

const HOW_IT_WORKS_CLASSES = [
  "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
  "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
  "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
];

const SAMPLE_MAGNETS = [
  { title: '10 Ways to Double Your SaaS Revenue', type: 'Guide', status: 'Active' },
  { title: 'The Ultimate Startup Checklist', type: 'Checklist', status: 'Active' },
  { title: 'Email Marketing Playbook', type: 'eBook', status: 'Draft' },
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="bg-black text-white">

      {/* Persistent shader background — fixed so it covers every section */}
      <MeshGradient
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
        colors={['#000000', '#06b6d4', '#0891b2', '#164e63', '#f97316']}
        speed={0.3}
      />

      {/* All page content above the background */}
      <div className="relative" style={{ zIndex: 1 }}>

        {/* Shader Hero — includes nav */}
        <ShaderHero t={t} />

        {/* Dashboard preview */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden shadow-xl">
            <div className="border-b border-white/10 bg-white/5 px-4 py-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60"></div>
              <div className="h-3 w-3 rounded-full bg-white/20"></div>
              <div className="h-3 w-3 rounded-full bg-white/20"></div>
              <span className="ml-3 text-xs text-white/40">Lead Magnet Generator — Dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/50 mb-1">{t.preview.magnets}</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/50 mb-1">{t.preview.leads}</p>
                <p className="text-2xl font-bold text-white">847</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/50 mb-1">{t.preview.cvr}</p>
                <p className="text-2xl font-bold text-white">6.4%</p>
              </div>
              <div className="col-span-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-white">{t.preview.recent}</p>
                  <span className="text-xs text-cyan-400 font-medium">+ New</span>
                </div>
                <div className="space-y-2">
                  {SAMPLE_MAGNETS.map((m) => (
                    <div key={m.title} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <span className="text-sm text-white">{m.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">{m.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === 'Active' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-white/40'}`}>
                          {t.preview.statuses[m.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-4 text-white">{t.features.heading}</h2>
            <p className="text-white/50 text-center mb-16 max-w-xl mx-auto">{t.features.sub}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {t.features.items.map((f, i) => (
                <div key={f.title} className="flex gap-4">
                  <div className="mt-0.5 h-9 w-9 shrink-0 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white">
                    {FEATURE_ICONS[i]}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">{f.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-white/10 bg-white/5">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-4 text-white">{t.howItWorks.heading}</h2>
            <p className="text-white/50 text-center mb-16 max-w-xl mx-auto">{t.howItWorks.sub}</p>
            <div className="flex justify-center">
              <DisplayCards
                cards={t.howItWorks.steps.map((s, i) => ({
                  title: s.title,
                  description: s.desc,
                  date: `Step 0${i + 1}`,
                  className: HOW_IT_WORKS_CLASSES[i],
                }))}
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-white/10">
          <div className="max-w-2xl mx-auto px-6 py-24 text-center">
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">{t.cta.heading}</h2>
            <p className="text-white/50 mb-10">{t.cta.sub}</p>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 text-white text-sm font-semibold h-11 px-10 hover:from-cyan-400 hover:to-orange-400 transition-all shadow-lg hover:shadow-xl">
              {t.cta.button}
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-bold text-sm text-white">LeadMagnet AI</span>
            <p className="text-xs text-white/40">{t.footer.built}</p>
            <div className="flex items-center gap-6 text-xs text-white/50">
              <Link href="/docs" className="hover:text-white transition-colors">{t.footer.docs}</Link>
              <Link href="/login" className="hover:text-white transition-colors">{t.footer.signIn}</Link>
              <Link href="/signup" className="hover:text-white transition-colors">{t.footer.signUp}</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
