'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, type Survey } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AnswerScreenProps {
  survey: Survey;
  user: User;
  userName: string;
  onBack: () => void;
  onSubmitted: (newCoins: number) => void;
}

export default function AnswerScreen({
  survey,
  user,
  userName,
  onBack,
  onSubmitted,
}: AnswerScreenProps) {
  const [responses, setResponses] = useState<string[]>(
    survey.questions.map(() => '')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!supabase) return;
    if (responses.some((r) => !r.trim())) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setLoading(true);
    setError('');

    // Record the answer
    const { error: answerErr } = await supabase.from('answers').insert({
      survey_id: survey.id,
      responder_id: user.id,
      responder_name: userName,
      responses,
    });

    if (answerErr) {
      setError(answerErr.message);
      setLoading(false);
      return;
    }

    // Earn +1 coin via RPC, with direct-update fallback
    let newCoins = 0;
    try {
      const { data } = await supabase.rpc('adjust_coins', {
        user_id: user.id,
        amount: 1,
      });
      newCoins = data as number;
    } catch {
      // Fallback: direct update
      const { data: profile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();
      if (profile) {
        const { data: updated } = await supabase
          .from('profiles')
          .update({ coins: profile.coins + 1 })
          .eq('id', user.id)
          .select('coins')
          .single();
        newCoins = updated?.coins ?? profile.coins + 1;
      }
    }

    setLoading(false);
    onSubmitted(newCoins);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex flex-col"
      style={{ minHeight: 'calc(100vh - 144px)' }}
    >
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 text-lg"
          style={{ color: '#1A1A1A' }}
          aria-label="Back"
        >
          ←
        </button>
        <h2
          className="text-lg font-bold"
          style={{ color: '#1A1A1A', fontFamily: 'Fredoka, sans-serif' }}
        >
          Answer Survey
        </h2>
      </div>

      {/* Survey meta */}
      <div className="mb-5">
        <span
          className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
          style={{ backgroundColor: '#EEF3FF', color: '#0057FF' }}
        >
          {survey.area}
        </span>
        <p className="text-xs mt-1" style={{ color: '#666666' }}>
          by {survey.asker_name}
        </p>
      </div>

      {/* Questions */}
      <div className="flex-1 space-y-6 overflow-y-auto pb-4">
        {survey.questions.map((question, i) => (
          <div key={i}>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#1A1A1A' }}
            >
              Q{i + 1}. {question}
            </label>
            <textarea
              value={responses[i]}
              onChange={(e) => {
                const updated = [...responses];
                updated[i] = e.target.value;
                setResponses(updated);
              }}
              rows={3}
              placeholder="Your answer…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-sm resize-none"
              style={{ color: '#1A1A1A' }}
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm mt-2" style={{ color: '#D42B2B' }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="pt-4 border-t border-gray-100 mt-2">
        <p className="text-xs text-center mb-3" style={{ color: '#666666' }}>
          Your answers are de-identified. Submitting earns you +1 🪙
        </p>
        <button
          onClick={handleSubmit}
          disabled={loading || responses.some((r) => !r.trim())}
          className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: '#00913C' }}
        >
          {loading ? 'Submitting…' : 'Submit & Earn Coin 🪙'}
        </button>
      </div>
    </motion.div>
  );
}
