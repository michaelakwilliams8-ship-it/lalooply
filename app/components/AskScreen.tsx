'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, type Profile } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AskScreenProps {
  user: User;
  profile: Profile;
  onPosted: (newCoins: number) => void;
}

const MAX_QUESTIONS = 3;
const MAX_CHARS = 200;
const MAX_AREA_WORDS = 3;

function limitWords(value: string): string {
  const words = value.trimStart().split(/\s+/);
  if (words.length > MAX_AREA_WORDS) {
    return words.slice(0, MAX_AREA_WORDS).join(' ');
  }
  return value;
}

export default function AskScreen({ user, profile, onPosted }: AskScreenProps) {
  const [area, setArea] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [posted, setPosted] = useState(false);

  function addQuestion() {
    if (questions.length < MAX_QUESTIONS) {
      setQuestions((q) => [...q, '']);
    }
  }

  function removeQuestion(i: number) {
    setQuestions((q) => q.filter((_, idx) => idx !== i));
  }

  function updateQuestion(i: number, value: string) {
    setQuestions((q) => q.map((old, idx) => (idx === i ? value.slice(0, MAX_CHARS) : old)));
  }

  async function handlePost() {
    if (!supabase) return;
    const trimmedArea = area.trim();
    if (!trimmedArea) {
      setError('Please enter an AREA label.');
      return;
    }
    if (questions.some((q) => !q.trim())) {
      setError('Please fill in all questions, or remove empty ones.');
      return;
    }
    if (profile.coins < 1) {
      setError('You need at least 1 🪙 to post a survey.');
      return;
    }

    setLoading(true);
    setError('');

    // Deduct 1 coin via RPC, with direct-update fallback
    let newCoins = profile.coins - 1;
    try {
      const { data } = await supabase.rpc('adjust_coins', {
        user_id: user.id,
        amount: -1,
      });
      newCoins = data as number;
    } catch {
      const { data: updated } = await supabase
        .from('profiles')
        .update({ coins: profile.coins - 1 })
        .eq('id', user.id)
        .select('coins')
        .single();
      newCoins = updated?.coins ?? profile.coins - 1;
    }

    // Insert survey
    const { error: surveyErr } = await supabase.from('surveys').insert({
      area: trimmedArea,
      questions: questions.filter((q) => q.trim()),
      asker_id: user.id,
      asker_name: profile.name,
    });

    if (surveyErr) {
      // Refund the coin
      try {
        await supabase.rpc('adjust_coins', { user_id: user.id, amount: 1 });
      } catch {
        await supabase
          .from('profiles')
          .update({ coins: newCoins + 1 })
          .eq('id', user.id);
      }
      setError(surveyErr.message);
      setLoading(false);
      return;
    }

    setPosted(true);
    onPosted(newCoins);
    setLoading(false);
  }

  if (posted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center gap-4"
        style={{ minHeight: '60vh' }}
      >
        <span className="text-6xl">🎉</span>
        <h2
          className="text-xl font-bold"
          style={{ color: '#1A1A1A', fontFamily: 'Fredoka, sans-serif' }}
        >
          Survey Posted!
        </h2>
        <p className="text-sm" style={{ color: '#666666' }}>
          Your survey is live in the deck for others to answer.
        </p>
        <button
          onClick={() => {
            setPosted(false);
            setArea('');
            setQuestions(['']);
          }}
          className="mt-2 px-6 py-2.5 rounded-xl font-medium text-white"
          style={{ backgroundColor: '#0057FF' }}
        >
          Ask Another
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col"
      style={{ minHeight: 'calc(100vh - 144px)' }}
    >
      <div className="mb-1">
        <h2
          className="text-xl font-bold"
          style={{ color: '#1A1A1A', fontFamily: 'Fredoka, sans-serif' }}
        >
          Ask a Question
        </h2>
        <p className="text-sm mt-0.5" style={{ color: '#666666' }}>
          Costs 1 🪙 to post · You have{' '}
          <strong style={{ color: '#C98A00' }}>{profile.coins} 🪙</strong>
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto py-5">
        {/* AREA */}
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: '#1A1A1A' }}>
            AREA{' '}
            <span className="font-normal" style={{ color: '#666666' }}>
              (up to 3 words)
            </span>
          </label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(limitWords(e.target.value))}
            placeholder="e.g. Remote Work"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm"
            style={{ color: '#1A1A1A' }}
          />
        </div>

        {/* Questions */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: '#1A1A1A' }}>
            Questions{' '}
            <span className="font-normal" style={{ color: '#666666' }}>
              ({questions.length}/{MAX_QUESTIONS})
            </span>
          </label>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1">
                  <textarea
                    value={q}
                    onChange={(e) => updateQuestion(i, e.target.value)}
                    rows={2}
                    placeholder={`Question ${i + 1}…`}
                    maxLength={MAX_CHARS}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm resize-none"
                    style={{ color: '#1A1A1A' }}
                  />
                  <p className="text-right text-xs mt-0.5" style={{ color: '#999' }}>
                    {q.length}/{MAX_CHARS}
                  </p>
                </div>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(i)}
                    className="self-start p-2 rounded-lg text-sm transition-colors hover:bg-red-50"
                    style={{ color: '#D42B2B' }}
                    aria-label="Remove question"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {questions.length < MAX_QUESTIONS && (
            <button
              onClick={addQuestion}
              className="mt-3 text-sm font-medium hover:underline"
              style={{ color: '#0057FF' }}
            >
              + Add question
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm mb-2" style={{ color: '#D42B2B' }}>
          {error}
        </p>
      )}

      {/* Post button */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={handlePost}
          disabled={
            loading ||
            !area.trim() ||
            questions.some((q) => !q.trim()) ||
            profile.coins < 1
          }
          className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: '#0057FF' }}
        >
          {loading ? 'Posting…' : 'Post Survey (1 🪙)'}
        </button>
      </div>
    </motion.div>
  );
}
