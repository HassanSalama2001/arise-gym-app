import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkout } from '../context/useWorkout';
import { playClickSound } from '../utils/audio';
import { hapticClick } from '../utils/haptics';
import './ActiveWorkoutFAB.css';

export default function ActiveWorkoutFAB() {
  const location = useLocation();
  const navigate = useNavigate();
  const { workoutState } = useWorkout();
  const { isActive, startTime, planName } = workoutState;

  const [elapsed, setElapsed] = useState('');

  // Keep track of active elapsed time
  useEffect(() => {
    if (!isActive || !startTime) return;

    const updateTimer = () => {
      const ms = Date.now() - startTime;
      const s = Math.floor(ms / 1000);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      setElapsed(`${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const isLogScreen = location.pathname === '/log';
  const isMissionCompleteScreen = location.pathname === '/mission-complete';
  const showFAB = isActive && !isLogScreen && !isMissionCompleteScreen;

  const handleClick = () => {
    playClickSound();
    hapticClick();
    navigate('/log');
  };

  return (
    <AnimatePresence>
      {showFAB && (
        <motion.button
          key="active-workout-fab"
          className="active-workout-fab card"
          onClick={handleClick}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          id="active-workout-fab-btn"
          aria-label="Return to active workout"
        >
          <div className="fab-glow-ring" />
          <div className="fab-content">
            <div className="fab-left">
              <div className="fab-indicator-dot" />
              <div className="fab-text">
                <span className="fab-title">MISSION IN PROGRESS</span>
                <span className="fab-subtitle">{planName || 'Quick Workout'}</span>
              </div>
            </div>
            <div className="fab-right">
              <span className="fab-timer">{elapsed}</span>
              <svg
                className="fab-arrow"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-blue)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
