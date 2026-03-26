'use client';

type Tab = 'swipe' | 'ask' | 'results';

interface BottomNavProps {
  active: Tab;
  onSwipe: () => void;
  onAsk: () => void;
  onResults: () => void;
}

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'swipe', icon: '👋', label: 'Swipe' },
  { id: 'ask', icon: '❓', label: 'Ask' },
  { id: 'results', icon: '📊', label: 'Results' },
];

export default function BottomNav({ active, onSwipe, onAsk, onResults }: BottomNavProps) {
  const handlers: Record<Tab, () => void> = {
    swipe: onSwipe,
    ask: onAsk,
    results: onResults,
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-white border-t border-gray-200">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={handlers[tab.id]}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors"
          style={{ color: active === tab.id ? '#0057FF' : '#666666' }}
        >
          <span className="text-xl">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
