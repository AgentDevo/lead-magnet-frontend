import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mission Control — Devo',
  description: 'OpenClaw Agent Mission Control Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen overflow-hidden bg-[#0f0f0f] text-[#ededed]">
        {children}
      </body>
    </html>
  )
}
