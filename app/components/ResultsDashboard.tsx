'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, type Survey, type Answer } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface SurveyWithAnswers extends Survey {
  answers: Answer[];
}

interface ResultsDashboardProps {
  user: User;
}

export default function ResultsDashboard({ user }: ResultsDashboardProps) {
  const [surveys, setSurveys] = useState<SurveyWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    const { data: surveyData } = await supabase
      .from('surveys')
      .select('*')
      .eq('asker_id', user.id)
      .order('created_at', { ascending: false });

    if (surveyData && surveyData.length > 0) {
      const ids = (surveyData as Survey[]).map((s) => s.id);

      const { data: answerData } = await supabase
        .from('answers')
        .select('*')
        .in('survey_id', ids);

      const merged: SurveyWithAnswers[] = (surveyData as Survey[]).map((s) => ({
        ...s,
        answers: ((answerData as Answer[]) ?? []).filter((a) => a.survey_id === s.id),
      }));
      setSurveys(merged);
    } else {
      setSurveys([]);
    }

    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  function exportCSV(survey: SurveyWithAnswers) {
    const headers = ['Response #', ...survey.questions.map((_, i) => `Q${i + 1}: ${survey.questions[i]}`)];
    const rows = survey.answers.map((a, idx) => [
      `Response ${idx + 1}`,
      ...a.responses,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${survey.area.replace(/\s+/g, '-')}-results.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

  if (surveys.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center gap-4"
        style={{ minHeight: '60vh' }}
      >
        <span className="text-6xl">📊</span>
        <h2
          className="text-xl font-bold"
          style={{ color: '#1A1A1A', fontFamily: 'Fredoka, sans-serif' }}
        >
          No surveys yet
        </h2>
        <p className="text-sm max-w-xs" style={{ color: '#666666' }}>
          Post your first survey on the Ask tab to start collecting answers.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col"
      style={{ minHeight: 'calc(100vh - 144px)' }}
    >
      <div className="mb-5">
        <h2
          className="text-xl font-bold"
          style={{ color: '#1A1A1A', fontFamily: 'Fredoka, sans-serif' }}
        >
          My Results
        </h2>
        <p className="text-sm mt-0.5" style={{ color: '#666666' }}>
          {surveys.length} survey{surveys.length !== 1 ? 's' : ''} posted
        </p>
      </div>

      <div className="space-y-3 overflow-y-auto pb-4">
        {surveys.map((survey) => (
          <div
            key={survey.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
          >
            {/* Header row */}
            <button
              className="w-full p-4 flex items-start justify-between text-left"
              onClick={() => setExpanded(expanded === survey.id ? null : survey.id)}
            >
              <div>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1"
                  style={{ backgroundColor: '#EEF3FF', color: '#0057FF' }}
                >
                  {survey.area}
                </span>
                <p className="text-sm" style={{ color: '#666666' }}>
                  {survey.answers.length} answer{survey.answers.length !== 1 ? 's' : ''} ·{' '}
                  {new Date(survey.created_at).toLocaleDateString()}
                </p>
              </div>
              <motion.span
                animate={{ rotate: expanded === survey.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-lg mt-0.5 flex-shrink-0 ml-2"
                style={{ color: '#666666' }}
              >
                ▾
              </motion.span>
            </button>

            {/* Expanded view */}
            <AnimatePresence initial={false}>
              {expanded === survey.id && (
                <motion.div
                  key="content"
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3"
                  >
                    {/* Questions */}
                    {survey.questions.map((q, qi) => (
                      <p key={qi} className="text-sm" style={{ color: '#1A1A1A' }}>
                        <span className="font-medium">Q{qi + 1}:</span> {q}
                      </p>
                    ))}

                    {/* Answers */}
                    {survey.answers.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        <p
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color: '#666666' }}
                        >
                          Responses (de-identified)
                        </p>
                        {survey.answers.map((answer, ai) => (
                          <div
                            key={answer.id}
                            className="rounded-xl p-3 space-y-1"
                            style={{ backgroundColor: '#F6F4EF' }}
                          >
                            <p className="text-xs font-medium" style={{ color: '#666666' }}>
                              Response {ai + 1}
                            </p>
                            {answer.responses.map((r, ri) => (
                              <p key={ri} className="text-sm" style={{ color: '#1A1A1A' }}>
                                <span style={{ color: '#666666' }}>Q{ri + 1}:</span> {r}
                              </p>
                            ))}
                          </div>
                        ))}

                        <button
                          onClick={() => exportCSV(survey)}
                          className="flex items-center gap-1.5 text-sm font-medium hover:underline"
                          style={{ color: '#0057FF' }}
                        >
                          ↓ Export CSV
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm italic" style={{ color: '#666666' }}>
                        No answers yet.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
