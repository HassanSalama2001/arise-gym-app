import { useState } from 'react';
import BottomSheet from '../BottomSheet';

/* ── Add Exercise Sheet ─────────────────────────── */
export default function AddExerciseSheet({ allExercises, onAdd, onClose, hasCurrentBlock }) {
  const [search, setSearch] = useState('');
  const [addMode, setAddMode] = useState('new'); // 'new' | 'superset'
  const filtered = allExercises.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <BottomSheet
      onClose={onClose}
      title="ADD EXERCISE"
    >
      {hasCurrentBlock && (
        <div className="tab-pills" style={{ marginBottom: 16 }}>
          <button className={`tab-pill ${addMode === 'new' ? 'active' : ''}`} onClick={() => setAddMode('new')}>NEW EXERCISE</button>
          <button className={`tab-pill ${addMode === 'superset' ? 'active' : ''}`} onClick={() => setAddMode('superset')}>SUPERSET</button>
        </div>
      )}

      <input className="search-input" type="search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(ex => (
          <button key={ex.id} className="jump-item" onClick={() => onAdd(ex, addMode === 'superset')} id={`add-ex-${ex.id}`}>
            <span className="jump-name">{ex.name}</span>
            <span className="chip chip-blue" style={{ fontSize: 10 }}>{ex.muscleGroup}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
