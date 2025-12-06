'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, BarChart3 } from 'lucide-react';
import { Logo } from './Logo';

export default function Navbar() {
  const pathname = usePathname();
  
  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/sets/new', label: 'Create Set', icon: Plus },
    { href: '/stats', label: 'Stats', icon: BarChart3 },
  ];
  
  return (
    <nav className="sticky top-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Logo showWordmark />
          
          {/* Navigation Links */}
          <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)]">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                    ${isActive 
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' 
                      : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : ''}`} />
                  <span className="hidden sm:block">{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[var(--primary)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
