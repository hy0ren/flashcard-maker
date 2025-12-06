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
    <nav className="sticky top-0 z-50 bg-[var(--background)]/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo - Left */}
          <Logo showWordmark />
          
          {/* Navigation Links - Right */}
          <div className="flex items-center gap-1">
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
                      ? 'bg-[var(--primary-light)] text-[var(--primary)]' 
                      : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
