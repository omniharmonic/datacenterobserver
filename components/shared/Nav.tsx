'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Network, Building2, Calendar, BookOpen, Info } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Map', icon: Map },
  { href: '/graph', label: 'Graph', icon: Network },
  { href: '/organizations', label: 'Companies', icon: Building2 },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/about', label: 'About', icon: Info },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-bg-primary/85 backdrop-blur-md border-b border-border flex items-center px-4 gap-1">
      <Link href="/" className="flex items-center gap-2 mr-6 group">
        <span className="relative inline-flex w-2.5 h-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-50 animate-pulse-soft" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-cyan group-hover:shadow-[0_0_10px_#22D3EE] transition-shadow" />
        </span>
        <span className="font-display text-[15px] font-bold tracking-tight">
          datacenter<span className="text-accent-cyan">.observer</span>
        </span>
      </Link>

      <div className="flex items-center gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                active
                  ? 'text-accent-cyan bg-accent-cyan/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5',
              ].join(' ')}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="ml-auto hidden md:flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-500 font-display">
        <span className="hidden lg:inline">civic intelligence for AI infra</span>
      </div>
    </nav>
  );
}
