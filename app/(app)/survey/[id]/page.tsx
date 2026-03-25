'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase, Survey } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function SurveyAnswerPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      const { data } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();
      if (data) {
        setSurvey(data as Survey);
        setResponses(new Array((data as Survey).questions.length).fill(''));
      }
      setLoading(false);
    };
    fetchSurvey();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !survey || !profile) return;

    const allAnswered = responses.every(r => r.trim().length > 0);
    if (!allAnswered) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    // Insert answer
    const { error: insertError } = await supabase.from('answers').insert({
      survey_id: survey.id,
      responder_id: user.id,
      responder_name: profile.name,
      responses,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    // Award coin via RPC
    const { error: rpcError } = await supabase.rpc('adjust_coins', {
      user_id: user.id,
      amount: 1,
    });

    if (rpcError) {
      // Coin award failed but answer was saved — show success anyway
      console.error('Coin RPC error:', rpcError);
    }

    await refreshProfile();
    setSubmitted(true);
    setSubmitting(false);

    setTimeout(() => router.push('/swipe'), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-brand-textSecondary">Loading survey...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-brand-textSecondary">Survey not found.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-6xl mb-4"
        >
          🪙
        </motion.div>
        <h2 className="font-fredoka text-2xl font-semibold text-brand-success mb-2">
          +1 coin earned!
        </h2>
        <p className="text-brand-textSecondary text-sm">Thanks for your answers 🙌</p>
        <p className="text-brand-textSecondary text-xs mt-2">Returning to deck...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      <button
        onClick={() => router.back()}
        className="text-brand-textSecondary text-sm mb-4 hover:text-brand-textPrimary transition flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="bg-brand-surface rounded-2xl shadow-sm p-5 mb-4">
        <p className="text-xs font-medium text-brand-textSecondary uppercase tracking-widest mb-1">Area</p>
        <h1 className="font-fredoka text-3xl font-semibold text-brand-blue mb-1">{survey.area}</h1>
        <p className="text-xs text-brand-textSecondary">by {survey.asker_name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {survey.questions.map((question, index) => (
          <div key={index} className="bg-brand-surface rounded-2xl shadow-sm p-5">
            <label className="block text-sm font-semibold text-brand-textPrimary mb-3">
              <span className="text-brand-blue">{index + 1}.</span> {question}
            </label>
            <textarea
              value={responses[index]}
              onChange={e => {
                const newResponses = [...responses];
                newResponses[index] = e.target.value;
                setResponses(newResponses);
              }}
              required
              rows={3}
              maxLength={500}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
              placeholder="Your answer..."
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {responses[index]?.length ?? 0}/500
            </p>
          </div>
        ))}

        {error && (
          <p className="text-brand-error text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-success text-white rounded-xl py-4 font-semibold text-base hover:bg-green-700 transition disabled:opacity-60 shadow-sm"
        >
          {submitting ? 'Submitting...' : 'Submit Answers — Earn 🪙'}
        </button>
      </form>
    </div>
  );
}
