import BottomSheet from '../BottomSheet';

/* ── RPE Selection Sheet ──────────────────────── */
export default function RPESelectionSheet({ onSelect, onClose }) {
  const options = [
    { value: 10, label: '10', desc: 'Max Effort / 0 reps left' },
    { value: 9.5, label: '9.5', desc: 'Maybe 1 rep left' },
    { value: 9, label: '9', desc: '1 rep left' },
    { value: 8.5, label: '8.5', desc: 'Maybe 2 reps left' },
    { value: 8, label: '8', desc: '2 reps left' },
    { value: 7.5, label: '7.5', desc: 'Maybe 3 reps left' },
    { value: 7, label: '7', desc: '3 reps left' },
    { value: 6, label: '6', desc: 'Challenging' },
    { value: 5, label: '5', desc: 'Easy / Warm-up' }
  ];

  return (
    <BottomSheet
      onClose={onClose}
      title="RATE YOUR EFFORT (RPE)"
    >
      <div className="rpe-prompt-info" style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          How hard was that set? Rate the intensity of your effort.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
        {options.map(opt => (
          <button
            key={opt.value}
            className="jump-item"
            onClick={() => onSelect(opt.value)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}
          >
            <span style={{ fontSize: 16, fontWeight: '700', color: 'var(--accent-blue)' }}>RPE {opt.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{opt.desc}</span>
          </button>
        ))}
        
        <button
          className="jump-item"
          onClick={() => onSelect(null)}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px 16px', border: '1px dashed var(--border)', background: 'transparent', marginTop: 8 }}
        >
          <span style={{ fontSize: 15, fontWeight: '600', color: 'var(--text-secondary)' }}>Skip / No RPE</span>
        </button>
      </div>
    </BottomSheet>
  );
}
