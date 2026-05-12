import React from 'react';
import { motion } from 'framer-motion';

export default function XPToast({ amount }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        background: 'rgba(255, 215, 0, 0.15)',
        border: '1px solid rgba(255, 215, 0, 0.4)',
        borderRadius: 20,
        padding: '8px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#FFD700', letterSpacing: '0.05em' }}>
        +{amount} XP
      </span>
    </motion.div>
  );
}
