import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RestTimerOverlay.css';

const PRESETS = [30, 60, 90, 120];

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* audio not available */ }
}

function vibrate() {
  try { navigator.vibrate?.([200, 100, 200]); } catch { /* vibration not available */ }
}

export default function RestTimerOverlay({ defaultDuration = 60, onClose }) {
  const [duration, setDuration] = useState(defaultDuration);
  const [remaining, setRemaining] = useState(defaultDuration);
  const [running, setRunning] = useState(true);
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState('');
  const intervalRef = useRef(null);
  const startRef = useRef(Date.now());
  const durationRef = useRef(defaultDuration);

  const reset = useCallback((newDur) => {
    clearInterval(intervalRef.current);
    const d = newDur ?? durationRef.current;
    durationRef.current = d;
    setDuration(d);
    setRemaining(d);
    startRef.current = Date.now();
    setRunning(true);
  }, []);

  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(err => console.error('Notification permission request failed:', err));
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const rem = Math.max(durationRef.current - elapsed, 0);
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(intervalRef.current);
        setRunning(false);
        playChime();
        vibrate();

        // Send local PWA notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Rest Time Finished!', {
              body: 'Time to begin the next set, Hunter.',
              icon: '/favicon.ico',
              silent: true
            });
          } catch (e) {
            console.error('Failed to show notification:', e);
          }
        }
      }
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const progress = remaining / duration;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * progress;

  // Color: green → amber → red
  const strokeColor = remaining > duration * 0.5
    ? 'var(--success)'
    : remaining > 10
      ? '#FFA000'
      : 'var(--accent-red)';

  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  const fmt = (n) => String(n).padStart(2, '0');
  const timeStr = `${mins > 0 ? fmt(mins) + ':' : ''}${fmt(secs)}`;

  if (minimized) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', borderRadius: 30, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 16, border: `2px solid ${strokeColor}`, zIndex: 9999, boxShadow: `0 4px 12px ${strokeColor}40` }}
        onClick={() => setMinimized(false)}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: strokeColor }}>{timeStr}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); clearInterval(intervalRef.current); onClose(); }} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, padding: '4px 8px' }}
        >
          ✕
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rest-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="rest-content">
        {/* Ring */}
        <div className="rest-ring-container">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r={radius} fill="none" stroke="var(--bg-surface)" strokeWidth="10" />
            <motion.circle
              cx="110" cy="110" r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={remaining <= 0 ? circumference : circumference - strokeOffset}
              transform="rotate(-90 110 110)"
              style={{ transition: remaining <= 0 ? 'none' : 'stroke 0.5s ease, stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          <div className="rest-timer-center">
            <span className="rest-time-display">{timeStr}</span>
            <span className="rest-label section-label">{remaining <= 0 ? 'REST COMPLETE' : 'REST'}</span>
          </div>
        </div>

        {/* Preset Durations */}
        <div className="rest-presets">
          {PRESETS.map(p => (
            <button
              key={p}
              className={`rest-preset ${duration === p ? 'active' : ''}`}
              onClick={() => reset(p)}
              id={`rest-preset-${p}`}
            >
              {p}s
            </button>
          ))}
          <button
            className={`rest-preset ${!PRESETS.includes(duration) ? 'active' : ''}`}
            onClick={() => setShowCustom(true)}
            id="rest-preset-custom"
          >
            Custom
          </button>
        </div>

        {/* Custom input */}
        <AnimatePresence>
          {showCustom && (
            <motion.div
              className="rest-custom-row"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <input
                type="number"
                inputMode="numeric"
                className="rest-custom-input"
                placeholder="Seconds"
                value={customVal}
                onChange={e => setCustomVal(e.target.value)}
                id="rest-custom-input"
              />
              <button
                className="rest-preset active"
                onClick={() => {
                  const v = parseInt(customVal);
                  if (v > 0) { reset(v); setShowCustom(false); setCustomVal(''); }
                }}
              >
                SET
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="rest-controls">
          <button className="rest-skip-btn" onClick={() => setMinimized(true)} style={{ color: 'var(--accent-blue)' }}>
            MINIMIZE
          </button>
          <button
            className="rest-skip-btn"
            onClick={() => { clearInterval(intervalRef.current); onClose(); }}
            id="rest-skip-btn"
          >
            SKIP
          </button>
          {remaining <= 0 && (
            <button className="rest-skip-btn rest-done-btn" onClick={onClose} id="rest-done-btn">
              DONE ✓
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
