'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface AuthScreenProps {
  onAuth: () => void;
}

type Mode = 'signin' | 'signup' | 'verify';

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');

  async function handleSignUp() {
    if (!supabase) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() || 'Anon' },
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (err) {
      setError(err.message);
    } else {
      setVerifyEmail(email);
      setMode('verify');
    }
    setLoading(false);
  }

  async function handleSignIn() {
    if (!supabase) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
    } else {
      onAuth();
    }
    setLoading(false);
  }

  if (mode === 'verify') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: '#F6F4EF' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-lg"
        >
          <div className="text-5xl mb-4">✉️</div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: '#1A1A1A', fontFamily: 'Fredoka, sans-serif' }}
          >
            Check your email
          </h2>
          <p className="text-sm mb-6" style={{ color: '#666666' }}>
            We sent a verification link to{' '}
            <strong style={{ color: '#1A1A1A' }}>{verifyEmail}</strong>. Click it
            to activate your account, then sign in.
          </p>
          <button
            onClick={() => setMode('signin')}
            className="text-sm font-medium hover:underline"
            style={{ color: '#0057FF' }}
          >
            Back to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: '#F6F4EF' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo + tagline */}
        <div className="text-center mb-8">
          <h1
            className="text-5xl font-bold mb-2"
            style={{ color: '#0057FF', fontFamily: 'Fredoka, sans-serif' }}
          >
            lalooply
          </h1>
          <p className="text-sm" style={{ color: '#666666' }}>
            Ask. Answer. Repeat!
            <br />
            Human-led data to sink your teeth into.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {/* Tab switcher */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ backgroundColor: '#F6F4EF' }}
          >
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: mode === m ? '#FFFFFF' : 'transparent',
                  color: mode === m ? '#1A1A1A' : '#666666',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm mb-1" style={{ color: '#666666' }}>
                  Name <span style={{ color: '#999' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anon"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm"
                  style={{ color: '#1A1A1A' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-1" style={{ color: '#666666' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm"
                style={{ color: '#1A1A1A' }}
                onKeyDown={(e) => e.key === 'Enter' && (mode === 'signin' ? handleSignIn() : handleSignUp())}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: '#666666' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm"
                style={{ color: '#1A1A1A' }}
                onKeyDown={(e) => e.key === 'Enter' && (mode === 'signin' ? handleSignIn() : handleSignUp())}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: '#D42B2B' }}>
                {error}
              </p>
            )}

            <button
              onClick={mode === 'signin' ? handleSignIn : handleSignUp}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#0057FF' }}
            >
              {loading
                ? 'Loading…'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
