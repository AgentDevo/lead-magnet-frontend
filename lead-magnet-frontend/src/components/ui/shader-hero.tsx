'use client';
import { useRef } from 'react';
import { MeshGradient, PulsingBorder } from '@paper-design/shaders-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

interface T {
  nav: { docs: string; signIn: string; getStarted: string };
  hero: { badge: string; h1a: string; h1b: string; sub: string; cta1: string; cta2: string; noCard: string };
}

export default function ShaderHero({ t }: { t: T }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix type="matrix" values="1 0 0 0 0.02 0 1 0 0 0.02 0 0 1 0 0.05 0 0 0 0.9 0" result="tint" />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={['#000000', '#06b6d4', '#0891b2', '#164e63', '#f97316']}
        speed={0.3}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={['#000000', '#ffffff', '#06b6d4', '#f97316']}
        speed={0.2}
      />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6">
        <motion.div
          className="flex items-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <span className="font-bold text-xl tracking-tight text-white" style={{ filter: 'url(#logo-glow)' }}>
            LeadMagnet AI
          </span>
        </motion.div>

        <nav className="flex items-center space-x-1">
          <LanguageSwitcher />
          <Link href="/docs" className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            {t.nav.docs}
          </Link>
          <Link href="/login" className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            {t.nav.signIn}
          </Link>
        </nav>

        <div className="relative flex items-center group" style={{ filter: 'url(#gooey-filter)' }}>
          <Link href="/signup" className="absolute right-0 px-2.5 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 h-8 flex items-center justify-center -translate-x-10 group-hover:-translate-x-[76px] z-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
          <Link href="/signup" className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 h-8 flex items-center z-10">
            {t.nav.getStarted}
          </Link>
        </div>
      </header>

      {/* Hero content */}
      <main className="absolute bottom-8 left-8 z-20 max-w-2xl">
        <div className="text-left">
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative border border-white/10"
            style={{ filter: 'url(#glass-effect)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent rounded-full" />
            <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">✨ {t.hero.badge}</span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl font-bold text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              className="block font-light text-4xl md:text-5xl mb-2 tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 30%, #f97316 70%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                filter: 'url(#text-glow)',
              } as React.CSSProperties}
            >
              {t.hero.h1a}
            </motion.span>
            <span className="block font-black text-white drop-shadow-2xl">{t.hero.h1b}</span>
          </motion.h1>

          <motion.p
            className="text-lg font-light text-white/70 mb-8 leading-relaxed max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            className="flex items-center gap-6 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Link href="/login">
              <motion.button
                className="px-10 py-4 rounded-full bg-transparent border-2 border-white/30 text-white font-medium text-sm hover:bg-white/10 hover:border-cyan-400/50 hover:text-cyan-100 cursor-pointer backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.hero.cta2}
              </motion.button>
            </Link>
            <Link href="/signup">
              <motion.button
                className="px-10 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 text-white font-semibold text-sm hover:from-cyan-400 hover:to-orange-400 cursor-pointer shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.hero.cta1}
              </motion.button>
            </Link>
          </motion.div>
          <p className="mt-4 text-xs text-white/40">{t.hero.noCard}</p>
        </div>
      </main>

      {/* Rotating badge */}
      <div className="absolute bottom-8 right-8 z-30">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <PulsingBorder
            colors={['#06b6d4', '#0891b2', '#f97316', '#FFD700', '#ffffff']}
            colorBack="#00000000"
            speed={1.5}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={5}
            spots={5}
            spotSize={0.1}
            pulse={0.1}
            smoke={0.5}
            smokeSize={4}
            scale={0.65}
            rotation={0}
            frame={9161408}
            style={{ width: '60px', height: '60px', borderRadius: '50%' }}
          />
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ scale: 1.6 } as React.CSSProperties}
          >
            <defs>
              <path id="hero-badge-path" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
            </defs>
            <text fontSize="7" fill="rgba(255,255,255,0.8)">
              <textPath href="#hero-badge-path" startOffset="0%">
                LeadMagnet AI • AI-Powered • Lead Generation • LeadMagnet AI •
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>
    </div>
  );
}
