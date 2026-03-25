'use client';

import { useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from 'framer-motion';
import type { Survey } from '../../lib/supabase';

interface SurveyCardProps {
  survey: Survey;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  isTop: boolean;
  stackOffset: number;
}

const SWIPE_THRESHOLD = 80;

export default function SurveyCard({
  survey,
  onSwipeRight,
  onSwipeLeft,
  isTop,
  stackOffset,
}: SurveyCardProps) {
  const [peeked, setPeeked] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const rightOpacity = useTransform(x, [30, 100], [0, 1]);
  const leftOpacity = useTransform(x, [-30, -100], [0, 1]);
  const controls = useAnimation();

  async function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      await controls.start({ x: 600, opacity: 0, rotate: 30, transition: { duration: 0.3 } });
      onSwipeRight();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      await controls.start({ x: -600, opacity: 0, rotate: -30, transition: { duration: 0.3 } });
      onSwipeLeft();
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
    }
  }

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{
        x: isTop ? x : undefined,
        rotate: isTop ? rotate : undefined,
        y: stackOffset,
        scale: isTop ? 1 : 1 - stackOffset * 0.003,
        zIndex: isTop ? 10 : 10 - Math.floor(stackOffset),
      }}
      className="absolute inset-0 bg-white rounded-3xl shadow-xl overflow-hidden select-none"
      whileTap={isTop ? { cursor: 'grabbing' } : undefined}
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
    >
      {/* Right swipe indicator — ANSWER */}
      {isTop && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute top-6 left-5 z-20 pointer-events-none"
        >
          <span
            className="px-3 py-1 rounded-lg border-2 font-bold text-base rotate-[-20deg] inline-block"
            style={{ borderColor: '#00913C', color: '#00913C' }}
          >
            ANSWER ✓
          </span>
        </motion.div>
      )}

      {/* Left swipe indicator — PASS */}
      {isTop && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute top-6 right-5 z-20 pointer-events-none"
        >
          <span
            className="px-3 py-1 rounded-lg border-2 font-bold text-base rotate-[20deg] inline-block"
            style={{ borderColor: '#D42B2B', color: '#D42B2B' }}
          >
            PASS ✗
          </span>
        </motion.div>
      )}

      <div className="p-8 flex flex-col h-full">
        {/* Area badge */}
        <div className="text-center mb-5">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{ backgroundColor: '#EEF3FF', color: '#0057FF' }}
          >
            {survey.area}
          </span>
        </div>

        {/* Question count */}
        <p className="text-center text-sm mb-4" style={{ color: '#666666' }}>
          {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}
        </p>

        {/* Peek section */}
        {peeked ? (
          <div className="space-y-3 flex-1 overflow-y-auto">
            {survey.questions.map((q, i) => (
              <div
                key={i}
                className="p-3 rounded-xl text-sm"
                style={{ backgroundColor: '#F6F4EF', color: '#1A1A1A' }}
              >
                <span style={{ color: '#666666' }} className="mr-1.5">
                  Q{i + 1}.
                </span>
                {q}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm flex-1" style={{ color: '#666666' }}>
            Swipe right to answer →
          </p>
        )}

        {/* Peek button — stop propagation so drag doesn't fire */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setPeeked((p) => !p);
          }}
          className="mt-5 w-full py-2.5 rounded-xl border text-sm font-medium transition-colors"
          style={{ borderColor: '#0057FF', color: '#0057FF' }}
        >
          {peeked ? 'Hide questions' : '👁 Peek at questions'}
        </button>
      </div>

      {/* Footer */}
      <p className="pb-4 text-center text-xs" style={{ color: '#666666' }}>
        by {survey.asker_name}
      </p>
    </motion.div>
  );
}
