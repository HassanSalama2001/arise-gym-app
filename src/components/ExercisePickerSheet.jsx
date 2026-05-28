import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import BottomSheet from './BottomSheet';
import CreateCustomExerciseSheet from './CreateCustomExerciseSheet';
import { AnimatePresence } from 'framer-motion';

export default function ExercisePickerSheet({ onClose, onSelect }) {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  
  const allExercises = useLiveQuery(() => db.exercises.toArray(), []) || [];
  const filtered = allExercises.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <BottomSheet onClose={onClose} title="SELECT EXERCISE">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>
          
          <button 
            className="btn-ghost" 
            style={{ width: '100%', border: '1px dashed var(--accent-blue)', color: 'var(--accent-blue)', padding: 12 }}
            onClick={() => setShowCreate(true)}
          >
            + CREATE CUSTOM EXERCISE
          </button>

          <input 
            className="search-input" 
            type="search" 
            placeholder="Search exercises..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '50vh', overflowY: 'auto' }}>
            {filtered.map(ex => (
              <button 
                key={ex.id} 
                className="jump-item" 
                onClick={() => { onSelect(ex); onClose(); }} 
                style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span className="jump-name">{ex.name}</span>
                <span className="chip chip-blue" style={{ fontSize: 10 }}>{ex.muscleGroup}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                No exercises found.
              </div>
            )}
          </div>
        </div>
      </BottomSheet>

      <AnimatePresence>
        {showCreate && (
          <CreateCustomExerciseSheet 
            onClose={() => setShowCreate(false)} 
            onCreated={(newEx) => {
              onSelect(newEx);
              setShowCreate(false);
              onClose();
            }} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
