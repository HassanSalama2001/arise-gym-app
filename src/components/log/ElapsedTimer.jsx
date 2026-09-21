import { useState, useEffect } from 'react';

/* ── Elapsed Timer ─────────────────────────────── */
export default function ElapsedTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const iv = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(iv);
  }, [startTime]);
  if (!startTime) return null;
  const s = Math.floor(elapsed / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const fmt = (n) => String(n).padStart(2, '0');
  return (
    <span className="elapsed-timer">
      {h > 0 ? `${fmt(h)}:` : ''}{fmt(m)}:{fmt(sec)}
    </span>
  );
}
