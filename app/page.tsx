'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase, type Profile, type Survey } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import AuthScreen from './components/AuthScreen';
import SwipeDeck from './components/SwipeDeck';
import AnswerScreen from './components/AnswerScreen';
import AskScreen from './components/AskScreen';
import ResultsDashboard from './components/ResultsDashboard';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

type Tab = 'swipe' | 'ask' | 'results';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>('swipe');
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    if (data) {
      setProfile(data as Profile);
    } else {
      // Create profile if trigger hasn't run yet
      const { data: created } = await supabase
        .from('profiles')
        .insert({ id: uid, name: 'Anon', coins: 60 })
        .select()
        .single();
      if (created) setProfile(created as Profile);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      }
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // Loading spinner
  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F6F4EF' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-t-transparent rounded-full"
          style={{ borderColor: '#0057FF', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  // Supabase not configured
  if (!supabase) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: '#F6F4EF' }}
      >
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-lg">
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: '#0057FF', fontFamily: 'Fredoka, sans-serif' }}
          >
            lalooply
          </h1>
          <p className="text-sm mb-2" style={{ color: '#666666' }}>
            Supabase credentials are not configured.
          </p>
          <p className="text-xs" style={{ color: '#999' }}>
            Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your
            environment.
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !profile) {
    return <AuthScreen onAuth={() => {}} />;
  }

  // Answer screen overlay
  if (activeSurvey) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F6F4EF' }}>
        <Header coins={profile.coins} />
        <main className="pt-16 pb-4 px-4 max-w-lg mx-auto">
          <AnswerScreen
            survey={activeSurvey}
            user={user}
            userName={profile.name}
            onBack={() => setActiveSurvey(null)}
            onSubmitted={(newCoins) => {
              setProfile({ ...profile, coins: newCoins });
              setActiveSurvey(null);
              setTab('swipe');
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F4EF' }}>
      <Header coins={profile.coins} />

      <main className="pt-16 pb-20 px-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {tab === 'swipe' && (
            <motion.div
              key="swipe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SwipeDeck
                user={user}
                onAnswer={(survey) => setActiveSurvey(survey)}
              />
            </motion.div>
          )}

          {tab === 'ask' && (
            <motion.div
              key="ask"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-4"
            >
              <AskScreen
                user={user}
                profile={profile}
                onPosted={(newCoins) => setProfile({ ...profile, coins: newCoins })}
              />
            </motion.div>
          )}

          {tab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-4"
            >
              <ResultsDashboard user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav
        active={tab}
        onSwipe={() => setTab('swipe')}
        onAsk={() => setTab('ask')}
        onResults={() => setTab('results')}
      />
    </div>
  );
}
