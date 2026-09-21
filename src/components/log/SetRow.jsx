import { motion } from 'framer-motion';

export default function SetRow({ set, index, onUpdate, onComplete, isActive, onDelete, onRpeClick, lastSetData }) {
  const typeColors = { normal: 'var(--text-primary)', warmup: 'var(--accent-gold)', drop: 'var(--accent-red)' };
  const typeLabels = { normal: index + 1, warmup: 'W', drop: 'D' };
  
  const cycleType = () => {
    if (set.completed) return;
    const types = ['normal', 'warmup', 'drop'];
    const current = types.indexOf(set.type || 'normal');
    onUpdate({ type: types[(current + 1) % types.length] });
  };

  return (
    <div
      className={`set-row ${set.completed ? 'set-completed' : ''} ${isActive ? 'set-active' : ''}`}
    >
      <button 
        className="set-number-badge" 
        onClick={cycleType} 
        disabled={set.completed}
        style={{ color: typeColors[set.type || 'normal'], borderColor: typeColors[set.type || 'normal'], cursor: set.completed ? 'default' : 'pointer', background: 'transparent' }}
        id={`set-type-toggle-${index}`}
        title="Tap to change set type"
      >
        {typeLabels[set.type || 'normal']}
      </button>

      <div className="weight-input-wrapper">
        <input
          type="number"
          inputMode="decimal"
          className="set-input weight-input"
          placeholder={lastSetData ? `${lastSetData.weight}` : "0"}
          value={set.weight || ''}
          onChange={e => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
          disabled={set.completed}
          aria-label="Weight"
          id={`set-weight-${index}`}
        />
      </div>

      <input
        type="number"
        inputMode="decimal"
        className="set-input reps-input"
        placeholder={lastSetData ? `${lastSetData.reps}` : "0"}
        value={set.reps || ''}
        onChange={e => onUpdate({ reps: parseInt(e.target.value) || 0 })}
        disabled={set.completed}
        aria-label="Reps"
        id={`set-reps-${index}`}
      />

      <button
        className={`set-rpe-badge-btn ${set.completed ? 'completed' : ''}`}
        onClick={onRpeClick}
        disabled={!set.completed}
        title={set.completed ? "Edit RPE" : "Mark set done to rate RPE"}
      >
        {set.completed ? (set.rpe || '-') : '-'}
      </button>

      <motion.button
        className={`set-complete-btn ${set.completed ? 'done' : ''}`}
        onClick={() => !set.completed && onComplete()}
        whileTap={!set.completed ? { scale: 0.85 } : {}}
        aria-label={set.completed ? 'Completed' : 'Complete set'}
        id={`complete-set-${index}`}
      >
        {set.completed ? (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"/>
          </motion.svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </motion.button>

      {onDelete && (
        <button
          className="set-delete-btn"
          onClick={onDelete}
          disabled={set.completed}
          title="Delete set"
          aria-label="Delete set"
          id={`delete-set-${index}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
}
