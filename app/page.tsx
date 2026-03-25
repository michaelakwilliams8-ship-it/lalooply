'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/swipe');
      } else {
        router.replace('/auth/signin');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg">
      <div className="text-center">
        <h1 className="font-fredoka text-4xl text-brand-blue font-semibold mb-2">Lalooply</h1>
        <p className="text-brand-textSecondary">Loading...</p>
      </div>
    </div>
  );
}
