'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function AskPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();

  const [area, setArea] = useState('');
  const [questions, setQuestions] = useState(['', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const activeQuestions = questions.filter(q => q.trim().length > 0);
  const canSubmit = area.trim().length > 0 && activeQuestions.length >= 1;
  const areaWords = area.trim().split(/\s+/).filter(Boolean).length;
  const hasEnoughCoins = (profile?.coins ?? 0) >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!canSubmit) {
      setError('Please add an area and at least one question.');
      return;
    }

    if (areaWords > 3) {
      setError('Area must be 3 words or fewer.');
      return;
    }

    if (!hasEnoughCoins) {
      setError('Not enough coins! Answer surveys to earn more.');
      return;
    }

    const trimmedArea = area.trim();
    const finalQuestions = questions.filter(q => q.trim().length > 0).map(q => q.trim());

    setSubmitting(true);
    setError('');

    // Deduct coin via RPC
    const { error: rpcError } = await supabase.rpc('adjust_coins', {
      user_id: user.id,
      amount: -1,
    });

    if (rpcError) {
      setError('Could not deduct coin. Try again.');
      setSubmitting(false);
      return;
    }

    // Insert survey
    const { error: insertError } = await supabase.from('surveys').insert({
      area: trimmedArea,
      questions: finalQuestions,
      asker_id: user.id,
      asker_name: profile.name,
    });

    if (insertError) {
      // Refund coin on failure
      await supabase.rpc('adjust_coins', { user_id: user.id, amount: 1 });
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    await refreshProfile();
    setSubmitted(true);
    setSubmitting(false);

    setTimeout(() => router.push('/results'), 2000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-6xl mb-4"
        >
          ✅
        </motion.div>
        <h2 className="font-fredoka text-2xl font-semibold text-brand-blue mb-2">
          Survey posted!
        </h2>
        <p className="text-brand-textSecondary text-sm">
          -1 coin spent. Answers will roll in soon 🎉
        </p>
        <p className="text-brand-textSecondary text-xs mt-2">Redirecting to Results...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      <div className="mb-6">
        <h1 className="font-fredoka text-3xl font-semibold text-brand-blue">Ask a Question</h1>
        <p className="text-brand-textSecondary text-sm mt-1">
          Post a survey for others to answer. Costs 1 🪙
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-sm font-semibold ${hasEnoughCoins ? 'text-brand-gold' : 'text-brand-error'}`}>
            🪙 {profile?.coins ?? 0} coins
          </span>
          {!hasEnoughCoins && (
            <span className="text-xs text-brand-error">(Not enough — answer more surveys!)</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-brand-surface rounded-2xl shadow-sm p-5">
          <label className="block text-sm font-semibold text-brand-textPrimary mb-2">
            Area <span className="text-xs font-normal text-brand-textSecondary">(up to 3 words)</span>
          </label>
          <input
            type="text"
            value={area}
            onChange={e => setArea(e.target.value)}
            required
            maxLength={50}
            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition ${
              areaWords > 3 ? 'border-brand-error' : 'border-gray-200'
            }`}
            placeholder="e.g. Remote Work, Team Culture"
          />
          {areaWords > 3 && (
            <p className="text-xs text-brand-error mt-1">Max 3 words ({areaWords} used)</p>
          )}
        </div>

        <div className="bg-brand-surface rounded-2xl shadow-sm p-5 space-y-4">
          <p className="text-sm font-semibold text-brand-textPrimary">
            Questions <span className="text-xs font-normal text-brand-textSecondary">(1–3, max 200 chars each)</span>
          </p>
          {questions.map((q, i) => (
            <div key={i}>
              <label className="block text-xs text-brand-textSecondary mb-1 font-medium">
                Question {i + 1}{i === 0 && ' *'}
              </label>
              <textarea
                value={q}
                onChange={e => {
                  const newQs = [...questions];
                  newQs[i] = e.target.value;
                  setQuestions(newQs);
                }}
                required={i === 0}
                rows={2}
                maxLength={200}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
                placeholder={i === 0 ? 'Your first question...' : `Optional question ${i + 1}...`}
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">
                {q.length}/200
              </p>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-brand-error text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !canSubmit || !hasEnoughCoins || areaWords > 3}
          className="w-full bg-brand-blue text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 transition disabled:opacity-60 shadow-sm"
        >
          {submitting ? 'Posting...' : 'Post Survey — Spend 🪙'}
        </button>
      </form>
    </div>
  );
}
