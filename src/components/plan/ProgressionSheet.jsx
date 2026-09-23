import { useState } from 'react';
import BottomSheet from '../BottomSheet';
import { PROGRESSION_TYPES, DEFAULT_PROGRESSION } from '../../utils/loadProgression';

/** Per-exercise progression settings for a plan. onSave receives the settings object. */
export default function ProgressionSheet({ exerciseName, progression, unit = 'kg', onSave, onClose }) {
  const [values, setValues] = useState({ ...DEFAULT_PROGRESSION, ...progression });
  const update = changes => setValues(v => ({ ...v, ...changes }));
  const number = (value, fallback) => (value === '' ? fallback : Number(value));

  return (
    <BottomSheet onClose={onClose} title="PROGRESSION">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
        <span className="settings-desc">{exerciseName}</span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(PROGRESSION_TYPES).map(([type, { label, description }]) => (
            <button
              key={type}
              className={`jump-item ${values.type === type ? 'active' : ''}`}
              onClick={() => update({ type })}
              style={values.type === type ? { borderColor: 'var(--accent-blue)' } : undefined}
            >
              <span className="jump-name">{label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{description}</span>
            </button>
          ))}
        </div>

        {values.type !== 'none' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ flex: 1 }}>
              <span className="section-label" style={{ fontSize: 11 }}>INCREMENT ({unit})</span>
              <input
                type="number" inputMode="decimal" className="settings-input" step="0.5"
                value={values.increment}
                onChange={e => update({ increment: number(e.target.value, DEFAULT_PROGRESSION.increment) })}
              />
            </label>
            {values.type === 'linear' ? (
              <label style={{ flex: 1 }}>
                <span className="section-label" style={{ fontSize: 11 }}>TARGET REPS</span>
                <input
                  type="number" inputMode="numeric" className="settings-input"
                  value={values.targetReps}
                  onChange={e => update({ targetReps: number(e.target.value, DEFAULT_PROGRESSION.targetReps) })}
                />
              </label>
            ) : (
              <>
                <label style={{ flex: 1 }}>
                  <span className="section-label" style={{ fontSize: 11 }}>MIN REPS</span>
                  <input
                    type="number" inputMode="numeric" className="settings-input"
                    value={values.minReps}
                    onChange={e => update({ minReps: number(e.target.value, DEFAULT_PROGRESSION.minReps) })}
                  />
                </label>
                <label style={{ flex: 1 }}>
                  <span className="section-label" style={{ fontSize: 11 }}>MAX REPS</span>
                  <input
                    type="number" inputMode="numeric" className="settings-input"
                    value={values.maxReps}
                    onChange={e => update({ maxReps: number(e.target.value, DEFAULT_PROGRESSION.maxReps) })}
                  />
                </label>
              </>
            )}
          </div>
        )}

        {values.type === 'linear' && (
          <span className="settings-desc">
            Deloads {values.deloadPercent}% after {values.failuresBeforeDeload} sessions short of the target.
          </span>
        )}

        <button className="btn-primary" onClick={() => onSave(values)} id="save-progression">
          SAVE
        </button>
      </div>
    </BottomSheet>
  );
}
