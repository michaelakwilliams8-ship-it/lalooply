'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, type Loop } from '../lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

// ─── Mock data (shown when Supabase is not configured) ───────────────────────

const MOCK_LOOPS: Loop[] = [
  {
    id: '1',
    user_id: 'demo',
    content: '✨ Just launched my first project after months of grinding. Every loop counts — keep going! 🚀',
    tags: ['motivation', 'launch', 'buildinpublic'],
    likes_count: 142,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    author_name: 'Alex Rivera',
    author_avatar: 'AR',
  },
  {
    id: '2',
    user_id: 'demo',
    content: "🎵 There is something magical about the quiet hours of the morning when the whole world feels like it's in a loop of peace.",
    tags: ['morning', 'mindfulness', 'vibes'],
    likes_count: 89,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    author_name: 'Jordan Lee',
    author_avatar: 'JL',
  },
  {
    id: '3',
    user_id: 'demo',
    content: '💡 Hot take: the best ideas always come in loops. You think about them, forget them, and then they circle back stronger than ever.',
    tags: ['ideas', 'creativity', 'hotake'],
    likes_count: 213,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    author_name: 'Morgan Chen',
    author_avatar: 'MC',
  },
  {
    id: '4',
    user_id: 'demo',
    content: "🌊 The ocean doesn't rush. It loops. Back and forth. Back and forth. There's a lesson in that rhythm for all of us.",
    tags: ['nature', 'peace', 'philosophy'],
    likes_count: 178,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    author_name: 'Sam Patel',
    author_avatar: 'SP',
  },
  {
    id: '5',
    user_id: 'demo',
    content: '🔥 Three years ago I had nothing but an idea. Today? Still looping that same energy into bigger and bigger dreams. Never stop.',
    tags: ['entrepreneurship', 'growth', 'hustle'],
    likes_count: 304,
    created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    author_name: 'Taylor Brooks',
    author_avatar: 'TB',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const LOOP_COLORS = [
  'from-purple-900/60 to-pink-900/40',
  'from-indigo-900/60 to-purple-900/40',
  'from-fuchsia-900/60 to-violet-900/40',
  'from-rose-900/60 to-pink-900/40',
  'from-violet-900/60 to-fuchsia-900/40',
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function NavBar({
  user,
  onAuthClick,
  onSignOut,
}: {
  user: User | null;
  onAuthClick: () => void;
  onSignOut: () => void;
}) {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 bg-gray-950/80 backdrop-blur-lg border-b border-white/10"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold"
        >
          ∞
        </motion.div>
        <span className="text-xl font-bold gradient-text">lalooply</span>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden sm:block text-sm text-gray-400 truncate max-w-[140px]">
              {user.email}
            </span>
            <button
              onClick={onSignOut}
              className="px-3 py-1.5 rounded-xl text-sm border border-white/20 hover:bg-white/10 transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={onAuthClick}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-900/40"
          >
            Join the loop
          </button>
        )}
      </div>
    </motion.nav>
  );
}

function HeroSection({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <section className="pt-28 pb-12 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-sm mb-6"
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        New loops every minute
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-4"
      >
        <span className="gradient-text">Loop your</span>
        <br />
        <span className="text-white">thoughts.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-gray-400 text-lg max-w-md mx-auto mb-8"
      >
        Share short bursts of inspiration. Loop them into the world and watch them resonate.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={onCreateClick}
        className="px-8 py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-xl shadow-purple-900/50"
      >
        ✦ Start looping
      </motion.button>
    </section>
  );
}

function LoopCard({
  loop,
  index,
  liked,
  onLike,
}: {
  loop: Loop;
  index: number;
  liked: boolean;
  onLike: (id: string) => void;
}) {
  const colorClass = LOOP_COLORS[index % LOOP_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className={`card-glass bg-gradient-to-br ${colorClass} p-5 flex flex-col gap-3`}
    >
      {/* Author row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0">
          {loop.author_avatar ?? loop.author_name?.slice(0, 2).toUpperCase() ?? '??'}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{loop.author_name ?? 'Anonymous'}</p>
          <p className="text-xs text-gray-400">{timeAgo(loop.created_at)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-100 leading-relaxed text-sm sm:text-base">{loop.content}</p>

      {/* Tags */}
      {loop.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {loop.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-white/10 text-purple-300 text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Like button */}
      <div className="flex items-center gap-2 pt-1">
        <motion.button
          whileTap={{ scale: 1.4 }}
          onClick={() => onLike(loop.id)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-xl transition-colors ${
            liked
              ? 'bg-pink-600/30 text-pink-400'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-pink-400'
          }`}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span className="font-semibold">{loop.likes_count + (liked ? 1 : 0)}</span>
        </motion.button>
        <span className="text-xs text-gray-600">loops</span>
      </div>
    </motion.div>
  );
}

function CreateLoopModal({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void;
  onSubmit: (content: string, tags: string[]) => void;
  loading: boolean;
}) {
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const maxLen = 280;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    const tags = tagsInput
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#/, '').toLowerCase().trim())
      .filter(Boolean);
    onSubmit(content.trim(), tags);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg card-glass p-6 rounded-3xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold gradient-text">New loop</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-gray-400"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500 transition-colors text-sm"
              rows={5}
              placeholder="What's looping in your mind right now? ✨"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxLen))}
              autoFocus
            />
            <span
              className={`absolute bottom-3 right-3 text-xs ${
                content.length > maxLen * 0.85 ? 'text-pink-400' : 'text-gray-600'
              }`}
            >
              {content.length}/{maxLen}
            </span>
          </div>

          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
            placeholder="Tags (e.g. motivation launch vibes)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!content.trim() || loading}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Looping…' : '∞ Drop the loop'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (user: User) => void;
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setInfo('Supabase is not configured. This is a demo – auth is disabled.');
      return;
    }
    setLoading(true);
    setError('');
    setInfo('');

    let result: { data: { user: User | null } | null; error: AuthError | null };
    if (mode === 'signup') {
      result = await supabase.auth.signUp({ email, password });
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      result = { data, error: signInError };
    }

    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else if (result.data?.user) {
      if (mode === 'signup' && !result.data.user.confirmed_at) {
        setInfo('Check your email to confirm your account!');
      } else {
        onSuccess(result.data.user);
      }
    } else if (mode === 'signup') {
      setInfo('Check your email to confirm your account!');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm card-glass p-6 rounded-3xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">
            {mode === 'signin' ? 'Welcome back' : 'Join lalooply'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-gray-400"
          >
            ✕
          </button>
        </div>

        {!supabase && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-900/30 border border-yellow-600/30 text-yellow-300 text-xs">
            ⚠️ Supabase is not configured. Set{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{' '}
            <code className="font-mono">.env.local</code> to enable auth.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}
          {info && <p className="text-green-400 text-xs">{info}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all mt-1"
          >
            {loading ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo(''); }}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loops, setLoops] = useState<Loop[]>(MOCK_LOOPS);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(true);

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load loops from Supabase ───────────────────────────────────────────────
  const loadLoops = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('loops')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) {
      setLoops(data as Loop[]);
      setUsingMockData(false);
    }
  }, []);

  useEffect(() => {
    loadLoops();
  }, [loadLoops]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleLike(id: string) {
    if (likedIds.has(id)) return;
    setLikedIds((prev) => new Set(prev).add(id));

    if (supabase && user) {
      await supabase.rpc('increment_loop_likes', { loop_id: id });
    }
  }

  async function handleCreateLoop(content: string, tags: string[]) {
    setCreateLoading(true);

    if (supabase && user) {
      const { data, error } = await supabase
        .from('loops')
        .insert({
          content,
          tags,
          user_id: user.id,
          likes_count: 0,
          author_name: user.email?.split('@')[0] ?? 'Anonymous',
          author_avatar: (user.email?.slice(0, 2) ?? 'AN').toUpperCase(),
        })
        .select()
        .single();

      if (!error && data) {
        setLoops((prev) => [data as Loop, ...prev]);
      }
    } else {
      // Optimistic update with mock data
      const newLoop: Loop = {
        id: `local-${Date.now()}`,
        user_id: 'local',
        content,
        tags,
        likes_count: 0,
        created_at: new Date().toISOString(),
        author_name: user ? (user.email?.split('@')[0] ?? 'You') : 'You',
        author_avatar: 'YO',
      };
      setLoops((prev) => [newLoop, ...prev]);
    }

    setCreateLoading(false);
    setShowCreate(false);
  }

  async function handleSignOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }

  function handleCreateClick() {
    if (!user && supabase) {
      setShowAuth(true);
    } else {
      setShowCreate(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-pink-900/20 blur-[100px]" />
      </div>

      <NavBar user={user} onAuthClick={() => setShowAuth(true)} onSignOut={handleSignOut} />

      <main className="relative max-w-2xl mx-auto px-4 pb-24">
        <HeroSection onCreateClick={handleCreateClick} />

        {/* Demo badge */}
        {usingMockData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-6 p-3 rounded-xl bg-blue-900/20 border border-blue-500/20 text-blue-300 text-xs text-center"
          >
            📡 Showing demo loops. Connect Supabase to see live data.
          </motion.div>
        )}

        {/* Sticky create button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-300">
            Latest loops
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
          >
            <span className="text-purple-400">+</span> New loop
          </motion.button>
        </div>

        {/* Feed */}
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-4">
            {loops.map((loop, i) => (
              <LoopCard
                key={loop.id}
                loop={loop}
                index={i}
                liked={likedIds.has(loop.id)}
                onLike={handleLike}
              />
            ))}
          </div>
        </AnimatePresence>

        {loops.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-600"
          >
            <div className="text-5xl mb-4">∞</div>
            <p>No loops yet. Be the first to drop one!</p>
          </motion.div>
        )}
      </main>

      {/* Floating action button (mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleCreateClick}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-xl shadow-purple-900/50 flex items-center justify-center text-2xl font-bold z-40"
      >
        +
      </motion.button>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateLoopModal
            key="create"
            onClose={() => setShowCreate(false)}
            onSubmit={handleCreateLoop}
            loading={createLoading}
          />
        )}
        {showAuth && (
          <AuthModal
            key="auth"
            onClose={() => setShowAuth(false)}
            onSuccess={(u) => { setUser(u); setShowAuth(false); setShowCreate(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
