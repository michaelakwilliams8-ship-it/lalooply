'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/signin');
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-surface border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-fredoka text-2xl font-semibold text-brand-blue">Lalooply</span>
        <div className="flex items-center gap-3">
          {profile !== null && (
            <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
              <span className="text-brand-gold font-semibold text-sm">🪙</span>
              <span className="font-semibold text-brand-gold text-sm">{profile.coins}</span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="text-xs text-brand-textSecondary hover:text-brand-textPrimary transition px-2 py-1 rounded-lg hover:bg-gray-100"
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
