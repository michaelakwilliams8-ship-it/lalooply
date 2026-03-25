'use client';

import { motion } from 'framer-motion';

interface HeaderProps {
  coins: number;
}

export default function Header({ coins }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-gray-200"
      style={{ backgroundColor: '#F6F4EF' }}
    >
      <h1
        className="text-2xl font-bold"
        style={{ color: '#0057FF', fontFamily: 'Fredoka, sans-serif' }}
      >
        lalooply
      </h1>
      <motion.div
        key={coins}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
        style={{ backgroundColor: '#FFF8E7', borderColor: 'rgba(201,138,0,0.3)' }}
      >
        <span>🪙</span>
        <span className="font-semibold text-sm" style={{ color: '#C98A00' }}>
          {coins}
        </span>
      </motion.div>
    </header>
  );
}
