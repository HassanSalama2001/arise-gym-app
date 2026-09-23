import { TRAINED_MUSCLE_GROUPS } from '../../data/muscleGroups';

/* ── Muscle Frequency Grid ────────────────────────── */
export default function MuscleGrid({ data }) {
  const muscles = TRAINED_MUSCLE_GROUPS;
  const maxCount = Math.max(...muscles.map(m => data[m] || 0), 1);
  return (
    <div className="muscle-grid">
      {muscles.map(m => {
        const count = data[m] || 0;
        const intensity = count / maxCount;
        return (
          <div
            key={m}
            className="muscle-cell"
            style={{ background: `rgba(79, 195, 247, ${0.05 + intensity * 0.7})`, borderColor: `rgba(79, 195, 247, ${0.1 + intensity * 0.5})` }}
          >
            <span className="muscle-cell-name">{m}</span>
            <span className="muscle-cell-count stat-number">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
