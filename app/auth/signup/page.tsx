'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const displayName = name.trim() || 'Anon';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: displayName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace('/auth/verify');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-fredoka text-4xl font-semibold text-brand-blue mb-2">Lalooply</h1>
          <p className="text-brand-textSecondary text-sm">Human-led data to sink your teeth into.</p>
        </div>

        <div className="bg-brand-surface rounded-2xl shadow-sm p-6">
          <h2 className="font-fredoka text-2xl font-semibold mb-6 text-center">Create account ✨</h2>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                Name <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
                placeholder="Your name (or leave blank for Anon)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-textSecondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-textSecondary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
                placeholder="Min 6 characters"
              />
            </div>

            {error && (
              <p className="text-brand-error text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account — 60 coins 🪙'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-brand-textSecondary mt-6">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-brand-blue font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
