

/* ── Rank Timeline ────────────────────────────────── */
export default function RankTimeline({ achievements }) {
  const rankUps = achievements.filter(a => a.type === 'rankup');
  if (rankUps.length === 0) return (
    <div className="chart-empty"><span className="section-label">NO RANK-UPS YET — KEEP GRINDING</span></div>
  );
  return (
    <div className="rank-timeline">
      {rankUps.map((a, i) => (
        <div key={a.id} className="rank-timeline-item">
          <div className="rank-timeline-dot" style={{ background: a.rankColor || 'var(--accent-blue)' }}/>
          {i < rankUps.length - 1 && <div className="rank-timeline-line"/>}
          <div className="rank-timeline-info">
            <span className="rank-timeline-rank" style={{ color: a.rankColor || 'var(--accent-blue)' }}>{a.title}</span>
            <span className="section-label">{new Date(a.date).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
