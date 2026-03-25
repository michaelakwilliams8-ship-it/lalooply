'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Survey, Answer } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type SurveyWithAnswers = Survey & { answers: Answer[] };

export default function ResultsPage() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<SurveyWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: surveyData } = await supabase
      .from('surveys')
      .select('*')
      .eq('asker_id', user.id)
      .order('created_at', { ascending: false });

    if (!surveyData) {
      setLoading(false);
      return;
    }

    const surveysWithAnswers: SurveyWithAnswers[] = await Promise.all(
      (surveyData as Survey[]).map(async (survey) => {
        const { data: answerData } = await supabase
          .from('answers')
          .select('*')
          .eq('survey_id', survey.id)
          .order('created_at', { ascending: false });
        return { ...survey, answers: (answerData as Answer[]) ?? [] };
      })
    );

    setSurveys(surveysWithAnswers);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const exportCSV = (survey: SurveyWithAnswers) => {
    const headers = ['Answered At', ...survey.questions.map((q, i) => `Q${i + 1}: ${q}`)];
    const rows = survey.answers.map(a => [
      new Date(a.created_at).toLocaleDateString(),
      ...a.responses,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lalooply-${survey.area.replace(/\s+/g, '-')}-results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-brand-textSecondary">Loading your results...</p>
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="font-fredoka text-2xl font-semibold text-brand-blue mb-2">
          No surveys yet
        </h2>
        <p className="text-brand-textSecondary text-sm">
          Post your first survey to start collecting responses!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      <div className="mb-6">
        <h1 className="font-fredoka text-3xl font-semibold text-brand-blue">My Results</h1>
        <p className="text-brand-textSecondary text-sm mt-1">
          {surveys.length} survey{surveys.length !== 1 ? 's' : ''} posted
        </p>
      </div>

      <div className="space-y-4">
        {surveys.map(survey => (
          <div key={survey.id} className="bg-brand-surface rounded-2xl shadow-sm overflow-hidden">
            <div
              className="p-5 cursor-pointer flex items-start justify-between gap-3"
              onClick={() => setExpanded(expanded === survey.id ? null : survey.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-brand-textSecondary uppercase tracking-widest mb-1">Area</p>
                <h3 className="font-fredoka text-xl font-semibold text-brand-blue truncate">{survey.area}</h3>
                <p className="text-xs text-brand-textSecondary mt-1">
                  {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''} •{' '}
                  {new Date(survey.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="bg-blue-50 rounded-xl px-3 py-1 text-center">
                  <span className="font-fredoka text-2xl font-semibold text-brand-blue">{survey.answers.length}</span>
                  <p className="text-xs text-brand-textSecondary">response{survey.answers.length !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-brand-textSecondary text-lg">
                  {expanded === survey.id ? '▲' : '▼'}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {expanded === survey.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 p-5">
                    {/* Questions list */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-brand-textSecondary uppercase tracking-wider mb-2">Questions</p>
                      {survey.questions.map((q, i) => (
                        <p key={i} className="text-sm text-brand-textPrimary mb-1">
                          <span className="font-semibold text-brand-blue">{i + 1}.</span> {q}
                        </p>
                      ))}
                    </div>

                    {survey.answers.length === 0 ? (
                      <p className="text-brand-textSecondary text-sm text-center py-4">
                        No responses yet. Share your survey!
                      </p>
                    ) : (
                      <>
                        <div className="space-y-3 mb-4">
                          {survey.answers.map((answer, ai) => (
                            <div key={answer.id} className="bg-brand-bg rounded-xl p-3">
                              <p className="text-xs font-medium text-brand-textSecondary mb-2">
                                Response #{ai + 1} · {new Date(answer.created_at).toLocaleDateString()}
                              </p>
                              {answer.responses.map((resp, ri) => (
                                <div key={ri} className="mb-1.5">
                                  <p className="text-xs text-brand-textSecondary font-medium">
                                    Q{ri + 1}:
                                  </p>
                                  <p className="text-sm text-brand-textPrimary">{resp}</p>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => exportCSV(survey)}
                          className="w-full border border-brand-blue text-brand-blue rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-50 transition"
                        >
                          ↓ Export CSV
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
