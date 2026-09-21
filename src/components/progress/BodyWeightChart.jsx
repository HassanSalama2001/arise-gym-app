

export default function BodyWeightChart({ data }) {
  const W = 340, H = 80, PAD = 10;
  const vals = data.map(d => d.weight);
  const min = Math.min(...vals) - 2;
  const max = Math.max(...vals) + 2;
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (((d.weight - min) / (max - min)) * (H - PAD * 2));
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="area-chart">
      <polyline points={pts} fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d, i) => {
        const [x, y] = pts.split(' ')[i].split(',');
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent-gold)"/>;
      })}
    </svg>
  );
}
