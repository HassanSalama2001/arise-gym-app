import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './RankUpCinematic.css';

function Particle({ angle, color }) {
  const rad = (angle * Math.PI) / 180;
  const [dist] = useState(() => 120 + Math.random() * 80);
  const x = Math.cos(rad) * dist;
  const y = Math.sin(rad) * dist;
  return (
    <motion.div
      className="rankup-particle"
      style={{ background: color }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x, y, scale: 0, opacity: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
    />
  );
}

export default function RankUpCinematic({ newRank, onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 3200);
    return () => clearTimeout(t);
  }, [onComplete]);

  const particles = Array.from({ length: 40 }, (_, i) => ({
    angle: (i / 40) * 360,
    color: i % 2 === 0 ? newRank.color : 'var(--accent-gold)',
  }));

  return (
    <motion.div
      className="rankup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rankup-content">
        {/* Particle burst */}
        <div className="rankup-particles">
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        {/* Rank Letter */}
        <motion.div
          className="rankup-rank-letter"
          style={{ color: newRank.color, borderColor: newRank.color, boxShadow: `0 0 60px ${newRank.color}60` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {newRank.rank}
        </motion.div>

        {/* Glow pulse */}
        <motion.div
          className="rankup-glow"
          style={{ background: `radial-gradient(circle, ${newRank.color}30 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.5, 1, 1.5, 1], opacity: [0.5, 1, 0.5, 1, 0] }}
          transition={{ duration: 2, delay: 0.5 }}
        />

        {/* RANK UP text */}
        <motion.h1
          className="rankup-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          RANK UP
        </motion.h1>

        {/* Rank name */}
        <motion.p
          className="rankup-name"
          style={{ color: newRank.color }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
        >
          {newRank.name}
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="rankup-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          RANK {newRank.rank} ACHIEVED
        </motion.p>
      </div>
    </motion.div>
  );
}
