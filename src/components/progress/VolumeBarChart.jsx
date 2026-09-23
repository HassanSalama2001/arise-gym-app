import { motion } from 'framer-motion';

/* ── Weekly Volume Bar Chart ──────────────────────── */
export default function VolumeBarChart({ weekData }) {
  const W = 340, H = 100, PAD = 8;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxVol = Math.max(...weekData.map(d => d.vol), 1);
  const barW = (W - PAD * 2) / 7 - 4;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} className="bar-chart">
      {weekData.map((d, i) => {
        const barH = d.vol > 0 ? Math.max(((d.vol / maxVol) * (H - PAD)), 4) : 0;
        const x = PAD + i * ((W - PAD * 2) / 7) + 2;
        const y = H - barH;
        const todayDay = new Date().getDay();
        const todayIdx = todayDay === 0 ? 6 : todayDay - 1;
        const isToday = i === todayIdx;
        return (
          <g key={i}>
            {barH > 0 && (
              <motion.rect
                x={x} y={y} width={barW} height={barH} rx="3"
                fill={isToday ? 'var(--accent-gold)' : (d.vol > 0 ? 'var(--accent-blue)' : 'var(--bg-surface)')}
                opacity={isToday ? 1.0 : 0.8}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                style={{ transformOrigin: `${x + barW / 2}px ${H}px` }}
              />
            )}
            {barH === 0 && (
              <rect x={x} y={H - 3} width={barW} height={3} rx="2" fill={isToday ? 'var(--accent-gold)' : 'var(--bg-surface)'} opacity={isToday ? 0.6 : 0.4}/>
            )}
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize="10" fill={isToday ? 'var(--accent-gold)' : 'var(--text-muted)'} fontWeight={isToday ? '700' : '600'} fontFamily="var(--font-display)">{days[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}
