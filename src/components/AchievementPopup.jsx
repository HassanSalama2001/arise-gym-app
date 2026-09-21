import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAchievementSound } from '../utils/audio';
import { hapticLevelUp } from '../utils/haptics';

export default function AchievementPopup() {
  const [achievement, setAchievement] = useState(null);

  useEffect(() => {
    const handleUnlock = (e) => {
      setAchievement(e.detail);
      playAchievementSound();
      hapticLevelUp();
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setAchievement(null);
      }, 4000);
    };

    window.addEventListener('achievement_unlocked', handleUnlock);
    return () => window.removeEventListener('achievement_unlocked', handleUnlock);
  }, []);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            position: 'fixed',
            top: 'calc(var(--safe-top) + 20px)',
            left: 16,
            right: 16,
            zIndex: 9999,
            background: 'linear-gradient(135deg, rgba(7,13,20,0.95), rgba(79,195,247,0.15))',
            border: '1px solid var(--accent-blue)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(79,195,247,0.2)',
            backdropFilter: 'blur(12px)',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: 32, flexShrink: 0 }}>{achievement.icon || '🏆'}</div>
          <div>
            <span style={{ 
              display: 'block', 
              fontFamily: 'var(--font-display)', 
              fontSize: 12, 
              color: 'var(--accent-gold)', 
              letterSpacing: '0.1em',
              marginBottom: 4
            }}>ACHIEVEMENT UNLOCKED</span>
            <span style={{ 
              display: 'block', 
              fontFamily: 'var(--font-display)', 
              fontSize: 18, 
              fontWeight: 700, 
              color: 'var(--text-primary)' 
            }}>{achievement.title}</span>
            <span style={{ 
              display: 'block', 
              fontSize: 12, 
              color: 'var(--text-muted)' 
            }}>{achievement.desc}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
