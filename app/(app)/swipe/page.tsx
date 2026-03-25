'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { supabase, Survey } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function SwipePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [peeking, setPeeking] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [gone, setGone] = useState(false);

  const fetchSurveys = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get answered survey ids
    const { data: answeredData } = await supabase
      .from('answers')
      .select('survey_id')
      .eq('responder_id', user.id);

    const answeredIds = (answeredData ?? []).map((a: { survey_id: string }) => a.survey_id);

    let query = supabase
      .from('surveys')
      .select('*')
      .neq('asker_id', user.id);

    if (answeredIds.length > 0) {
      // Validate UUID format before interpolating into filter string
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const safeIds = answeredIds.filter((id: string) => UUID_RE.test(id));
      if (safeIds.length > 0) {
        query = query.not('id', 'in', `(${safeIds.join(',')})`);
      }
    }

    const { data } = await query;
    if (data) {
      // Randomize order
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setSurveys(shuffled as Survey[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const currentSurvey = surveys[current];

  const handleAnswer = () => {
    if (!currentSurvey) return;
    router.push(`/survey/${currentSurvey.id}`);
  };

  const handlePass = () => {
    setDirection('left');
    setGone(true);
    setPeeking(false);
    setTimeout(() => {
      setCurrent(prev => prev + 1);
      setGone(false);
      setDirection(null);
    }, 350);
  };

  const handleSwipe = (dir: 'left' | 'right') => {
    if (dir === 'right') {
      handleAnswer();
    } else {
      handlePass();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-brand-textSecondary">Loading surveys...</p>
      </div>
    );
  }

  if (!currentSurvey) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-fredoka text-2xl font-semibold text-brand-blue mb-2">
          You&apos;re all caught up!
        </h2>
        <p className="text-brand-textSecondary text-sm mb-6">
          No more surveys right now. Check back soon or ask one yourself!
        </p>
        <button
          onClick={fetchSurveys}
          className="bg-brand-blue text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-blue-700 transition mb-3"
        >
          🔄 Refresh
        </button>
        <p className="text-xs text-brand-textSecondary">
          Share Lalooply and bring more humans in! 🙌
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-4 max-w-lg mx-auto">
      <p className="text-xs text-brand-textSecondary mb-4 text-center">
        Swipe right to answer → earn 🪙 &nbsp;|&nbsp; Swipe left to pass
      </p>

      <div className="w-full relative" style={{ height: '420px' }}>
        <AnimatePresence>
          {!gone && (
            <SwipeCard
              key={currentSurvey.id}
              survey={currentSurvey}
              peeking={peeking}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handlePass}
          className="w-14 h-14 rounded-full border-2 border-brand-error text-brand-error text-2xl flex items-center justify-center hover:bg-red-50 transition shadow-sm"
          title="Pass"
        >
          ✕
        </button>
        <button
          onClick={() => setPeeking(p => !p)}
          className={`w-12 h-12 rounded-full border-2 text-sm font-semibold flex items-center justify-center transition shadow-sm ${
            peeking
              ? 'border-brand-blue bg-brand-blue text-white'
              : 'border-gray-300 text-brand-textSecondary hover:border-brand-blue hover:text-brand-blue'
          }`}
          title="Peek at questions"
        >
          👁️
        </button>
        <button
          onClick={handleAnswer}
          className="w-14 h-14 rounded-full border-2 border-brand-success text-brand-success text-2xl flex items-center justify-center hover:bg-green-50 transition shadow-sm"
          title="Answer"
        >
          ✓
        </button>
      </div>

      <p className="text-xs text-brand-textSecondary mt-4 text-center">
        {surveys.length - current - 1} survey{surveys.length - current - 1 !== 1 ? 's' : ''} remaining
      </p>
    </div>
  );
}

function SwipeCard({
  survey,
  peeking,
  onSwipe,
}: {
  survey: Survey;
  peeking: boolean;
  onSwipe: (dir: 'left' | 'right') => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const leftOpacity = useTransform(x, [-100, -20, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 20, 100], [0, 0.5, 1]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 80) {
      onSwipe('right');
    } else if (info.offset.x < -80) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: -300, right: 300 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0 bg-brand-surface rounded-3xl shadow-lg p-6 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Pass indicator */}
      <motion.div
        style={{ opacity: leftOpacity }}
        className="absolute top-6 left-6 bg-brand-error text-white rounded-xl px-3 py-1 text-sm font-semibold rotate-[-12deg] z-10"
      >
        PASS
      </motion.div>

      {/* Answer indicator */}
      <motion.div
        style={{ opacity: rightOpacity }}
        className="absolute top-6 right-6 bg-brand-success text-white rounded-xl px-3 py-1 text-sm font-semibold rotate-[12deg] z-10"
      >
        ANSWER ✓
      </motion.div>

      {/* Card content */}
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-xs font-medium text-brand-textSecondary uppercase tracking-widest mb-3">Area</p>
          <h2 className="font-fredoka text-4xl font-semibold text-brand-blue text-center mb-2">
            {survey.area}
          </h2>
          <p className="text-xs text-brand-textSecondary">
            {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {peeking && (
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
            <p className="text-xs font-medium text-brand-textSecondary uppercase tracking-wider mb-2">Questions</p>
            {survey.questions.map((q, i) => (
              <div key={i} className="bg-brand-bg rounded-xl px-3 py-2">
                <p className="text-sm text-brand-textPrimary">
                  <span className="font-semibold text-brand-blue">{i + 1}.</span> {q}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-xs text-brand-textSecondary">
            by {survey.asker_name}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
