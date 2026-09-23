import BottomSheet from '../BottomSheet';

/* ── Plate Calculator Sheet ──────────────────────── */
export default function PlateCalculatorSheet({ weight, unitPreference, onClose }) {
  const isLbs = unitPreference === 'lbs';
  const barWeight = isLbs ? 45 : 20;
  const platesAvailable = isLbs ? [45, 35, 25, 10, 5, 2.5] : [25, 20, 15, 10, 5, 2.5, 1.25];
  const unitLabel = isLbs ? 'lbs' : 'kg';
  
  const targetPerSide = (weight - barWeight) / 2;
  const platesToLoad = [];
  let leftoverPerSide = 0;

  if (targetPerSide > 0) {
    let currentTarget = targetPerSide;
    for (const p of platesAvailable) {
      while (currentTarget >= p) {
        platesToLoad.push(p);
        currentTarget -= p;
        currentTarget = Math.round(currentTarget * 100) / 100; // handle float precision
      }
    }
    leftoverPerSide = currentTarget;
  }

  return (
    <BottomSheet
      onClose={onClose}
      title="PLATE CALCULATOR"
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>{weight} {unitLabel}</div>
        <div className="section-label">TARGET WEIGHT</div>
      </div>

      {weight < barWeight ? (
        <div className="empty-state" style={{ padding: 20 }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <p style={{ marginTop: 8 }}>Weight is less than the bar ({barWeight}{unitLabel})</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Barbell</span>
            <span style={{ color: 'var(--text-muted)' }}>{barWeight} {unitLabel}</span>
          </div>
          
          <p className="section-label" style={{ margin: '16px 0 8px' }}>LOAD ON EACH SIDE:</p>
          {platesToLoad.length === 0 ? (
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', textAlign: 'center' }}>
              Just the bar!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {platesToLoad.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                  </div>
                  <span style={{ fontWeight: 600 }}>{p} {unitLabel} plate</span>
                </div>
              ))}
            </div>
          )}
          {leftoverPerSide > 0 && (
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--accent-gold)', textAlign: 'center' }}>
              {leftoverPerSide} {unitLabel} per side can't be made with standard plates. Closest: {weight - leftoverPerSide * 2} {unitLabel}.
            </p>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
