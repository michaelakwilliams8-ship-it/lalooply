'use client';

import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-brand-surface border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-fredoka text-2xl font-semibold text-brand-blue">Lalooply</span>
        {profile !== null && (
          <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <span className="text-brand-gold font-semibold text-sm">🪙</span>
            <span className="font-semibold text-brand-gold text-sm">{profile.coins}</span>
          </div>
        )}
      </div>
    </header>
  );
}
