import { useState } from 'react';
import BottomSheet from './BottomSheet';
import db from '../db/db';
import { MUSCLE_GROUPS } from '../data/muscleGroups';
import { nextCustomExerciseId } from '../db/remap';

export default function CreateCustomExerciseSheet({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Corrective');
  const [difficulty, setDifficulty] = useState('D');
  const [instructions, setInstructions] = useState('');

  const difficulties = ['A', 'B', 'C', 'D', 'E'];

  async function handleSave() {
    if (!name.trim()) return;
    
    // Process instructions separated by newlines
    const instArray = instructions
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const newEx = {
      id: await nextCustomExerciseId(db.exercises),
      name: name.trim(),
      muscleGroup,
      difficulty,
      instructions: instArray,
      isCustom: true // Just a flag to identify user-created exercises
    };

    await db.exercises.add(newEx);
    if (onCreated) onCreated(newEx);
    onClose();
  }

  return (
    <BottomSheet onClose={onClose} title="CREATE EXERCISE">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
        <div>
          <label className="section-label">EXERCISE NAME</label>
          <input 
            type="text" 
            className="search-input" 
            placeholder="e.g., Banded External Rotation" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            style={{ width: '100%', marginTop: 8 }}
          />
        </div>

        <div>
          <label className="section-label">MUSCLE GROUP</label>
          <select 
            className="search-input" 
            value={muscleGroup} 
            onChange={e => setMuscleGroup(e.target.value)}
            style={{ width: '100%', marginTop: 8, appearance: 'none', background: 'var(--bg-surface)' }}
          >
            {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg}</option>)}
          </select>
        </div>

        <div>
          <label className="section-label">DIFFICULTY LEVEL</label>
          <select 
            className="search-input" 
            value={difficulty} 
            onChange={e => setDifficulty(e.target.value)}
            style={{ width: '100%', marginTop: 8, appearance: 'none', background: 'var(--bg-surface)' }}
          >
            {difficulties.map(d => <option key={d} value={d}>Level {d} {d==='E' ? '(Easiest)' : d==='A' ? '(Hardest)' : ''}</option>)}
          </select>
        </div>

        <div>
          <label className="section-label">INSTRUCTIONS (Optional)</label>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, marginTop: 4 }}>Enter each step on a new line.</p>
          <textarea 
            className="search-input" 
            placeholder="Step 1...\nStep 2..." 
            value={instructions} 
            onChange={e => setInstructions(e.target.value)} 
            rows={4}
            style={{ width: '100%', resize: 'none' }}
          />
        </div>

        <button 
          className="btn-primary" 
          onClick={handleSave}
          disabled={!name.trim()}
          style={{ marginTop: 8 }}
        >
          SAVE EXERCISE
        </button>
      </div>
    </BottomSheet>
  );
}
