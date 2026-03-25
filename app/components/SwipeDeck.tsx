'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, type Survey } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import SurveyCard from './SurveyCard';

interface SwipeDeckProps {
  user: User;
  onAnswer: (survey: Survey) => void;
}

export default function SwipeDeck({ user, onAnswer }: SwipeDeckProps) {
  const [deck, setDeck] = useState<Survey[]>([]);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadDeck = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    // Get IDs of surveys the user has already answered
    const { data: answeredData } = await supabase
      .from('answers')
      .select('survey_id')
      .eq('responder_id', user.id);

    const answeredIds = (answeredData ?? []).map((a: { survey_id: string }) => a.survey_id);

    // Fetch surveys not created by this user
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .neq('asker_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) {
      const filtered = (data as Survey[]).filter((s) => !answeredIds.includes(s.id));
      // Shuffle for variety
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setGone(new Set());
    }

    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  const visibleDeck = deck.filter((s) => !gone.has(s.id));

  function handleSwipeRight(survey: Survey) {
    setGone((prev) => new Set(prev).add(survey.id));
    onAnswer(survey);
  }

  function handleSwipeLeft(survey: Survey) {
    setGone((prev) => new Set(prev).add(survey.id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-t-transparent rounded-full"
          style={{ borderColor: '#0057FF', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (visibleDeck.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center text-center px-6 gap-5"
        style={{ minHeight: '60vh' }}
      >
        <span className="text-6xl">🎉</span>
        <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
          You&apos;re all caught up!
        </h2>
        <p className="text-sm max-w-xs" style={{ color: '#666666' }}>
          No more surveys to answer right now. Post your own on the Ask tab or come
          back later.
        </p>
        <button
          onClick={loadDeck}
          className="px-6 py-2.5 rounded-xl font-medium text-white"
          style={{ backgroundColor: '#0057FF' }}
        >
          Refresh 🔄
        </button>
        <button
          onClick={() => {
            const text =
              "I'm answering surveys on Lalooply! Ask. Answer. Repeat! 🪙 — lalooply.app";
            if (typeof navigator !== 'undefined' && navigator.share) {
              navigator.share({ title: 'Lalooply', text, url: window.location.href });
            } else if (typeof navigator !== 'undefined') {
              navigator.clipboard.writeText(text);
              alert('Link copied to clipboard!');
            }
          }}
          className="px-6 py-2.5 rounded-xl border font-medium"
          style={{ borderColor: '#0057FF', color: '#0057FF' }}
        >
          Share Lalooply 🔗
        </button>
      </motion.div>
    );
  }

  // Show up to 3 cards in a stack
  const stackCards = visibleDeck.slice(0, 3);

  return (
    <div className="flex flex-col items-center px-4" style={{ paddingTop: '16px', paddingBottom: '24px' }}>
      <p className="text-sm mb-6 font-medium" style={{ color: '#666666' }}>
        {visibleDeck.length} survey{visibleDeck.length !== 1 ? 's' : ''} waiting
      </p>
      <div className="relative w-full max-w-sm" style={{ height: 460 }}>
        <AnimatePresence>
          {[...stackCards].reverse().map((survey, i) => {
            const isTop = i === stackCards.length - 1;
            const offset = (stackCards.length - 1 - i) * 10;
            return (
              <SurveyCard
                key={survey.id}
                survey={survey}
                onSwipeRight={() => handleSwipeRight(survey)}
                onSwipeLeft={() => handleSwipeLeft(survey)}
                isTop={isTop}
                stackOffset={isTop ? 0 : offset}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Swipe hint */}
      <div className="mt-8 flex items-center gap-8 text-sm" style={{ color: '#666666' }}>
        <span>← Pass</span>
        <span style={{ color: '#999' }}>drag to swipe</span>
        <span>Answer →</span>
      </div>
    </div>
  );
}
