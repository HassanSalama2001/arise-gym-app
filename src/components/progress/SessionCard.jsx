import { motion } from 'framer-motion';

/* ── History Session Card ─────────────────────────── */
export default function SessionCard({ session, onClick, unitPreference }) {
  const dur = session.endTime ? session.endTime - session.startTime : 0;
  const mins = Math.floor(dur / 60000);
  return (
    <motion.div className="session-card card" onClick={onClick} whileTap={{ scale: 0.97 }} id={`session-${session.id}`}>
      <div className="session-card-top">
        <span className="session-name">{session.name}</span>
        <span className="session-xp chip chip-gold">+{session.xpEarned || 0} XP</span>
      </div>
      <div className="session-card-meta">
        <span className="section-label">{new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        <span className="section-label">{mins}m · {session.volume || 0} {unitPreference || 'kg'}</span>
      </div>
    </motion.div>
  );
}
