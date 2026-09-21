

/* ── SVG Area Chart (XP over 30 days) ────────────── */
export default function XPAreaChart({ data }) {
  const W = 340, H = 120, PAD = 10;
  if (!data || data.length < 2) return (
    <div className="chart-empty"><span className="section-label">LOG WORKOUTS TO SEE DATA</span></div>
  );
  const maxVal = Math.max(...data.map(d => d.xp), 1);
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((d.xp / maxVal) * (H - PAD * 2));
    return [x, y];
  });
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `M${pts[0][0]},${H - PAD} L${polyline.split(' ').map(p => p).join(' L')} L${pts[pts.length - 1][0]},${H - PAD} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="area-chart">
      <defs>
        <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#xpGrad)"/>
      <polyline points={polyline} fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--accent-blue)"/>
      ))}
    </svg>
  );
}
