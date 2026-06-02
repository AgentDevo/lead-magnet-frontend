'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const nav = [
  { href: '/lead-magnets', label: 'Lead Magnets', icon: '⚡' },
  { href: '/lead-magnets/templates', label: 'Templates', icon: '📋' },
  { href: '/landing-pages', label: 'Landing Pages', icon: '🌐' },
  { href: '/leads', label: 'Leads', icon: '👥' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/webhooks', label: 'Webhooks', icon: '🔗' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 shrink-0 border-r bg-card h-screen flex flex-col">
      <div className="px-4 py-5 border-b">
        <span className="font-bold text-sm tracking-wide">Lead Magnet</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-accent/10 text-accent'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t">
        <p className="text-xs text-muted-foreground truncate mb-2">{user?.email}</p>
        <button
          onClick={logout}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
