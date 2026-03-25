'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/swipe', icon: '👋', label: 'Swipe' },
  { href: '/ask', icon: '❓', label: 'Ask' },
  { href: '/results', icon: '📊', label: 'Results' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-brand-surface border-t border-gray-100 shadow-lg">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                active
                  ? 'text-brand-blue'
                  : 'text-brand-textSecondary hover:text-brand-textPrimary'
              }`}
            >
              <span className="text-2xl leading-none">{tab.icon}</span>
              <span className={`text-xs mt-1 font-medium ${active ? 'text-brand-blue' : ''}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
