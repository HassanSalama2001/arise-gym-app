import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence } from 'framer-motion';
import db from '../db/db';
import BottomSheet from './BottomSheet';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body', 'Corrective'];

export default function AddExerciseToPlanSheet({ isOpen, onClose, planId, onExerciseAdded }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const planExercises = useLiveQuery(() => db.planExercises.where('planId').equals(planId).toArray(), [planId]);

  const addedExerciseIds = useMemo(() => {
    if (!planExercises) return new Set();
    return new Set(planExercises.map(pe => pe.exerciseId));
  }, [planExercises]);

  const filtered = useMemo(() => {
    if (!exercises) return [];
    return exercises.filter(ex => {
      const matchSearch = !search || (ex.name && ex.name.toLowerCase().includes(search.toLowerCase()));
      const matchFilter = filter === 'All' || ex.muscleGroup === filter;
      return matchSearch && matchFilter;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, search, filter]);

  const handleAdd = async (exercise) => {
    if (addedExerciseIds.has(exercise.id)) return; // Already added
    
    const count = planExercises ? planExercises.length : 0;
    await db.planExercises.add({
      planId,
      exerciseId: exercise.id,
      order: count,
      targetSets: 3,
      targetReps: 10
    });
    
    if (onExerciseAdded) {
      onExerciseAdded(exercise.id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <BottomSheet onClose={onClose} title="ADD EXERCISE">
          <div style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
        
        {/* Search */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Filter Chips */}
        <div className="filter-chips" style={{ marginBottom: 16, paddingBottom: 4 }}>
          {MUSCLE_GROUPS.map(mg => (
            <button
              key={mg}
              className={`filter-chip ${filter === mg ? 'active' : ''}`}
              onClick={() => setFilter(mg)}
            >
              {mg}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length > 0 ? (
            filtered.map(ex => {
              const isAdded = addedExerciseIds.has(ex.id);
              return (
                <div key={ex.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{ex.name}</span>
                    <span className="chip" style={{ fontSize: 10, padding: '2px 6px', width: 'fit-content' }}>{ex.muscleGroup}</span>
                  </div>
                  {isAdded ? (
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Added</span>
                  ) : (
                    <button 
                      className="btn-ghost" 
                      onClick={() => handleAdd(ex)}
                      style={{ height: 32, padding: '0 12px', fontSize: 12, color: 'var(--accent-blue)', border: '1px solid var(--accent-blue)' }}
                    >
                      + ADD
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state" style={{ minHeight: 'auto', padding: '40px 0' }}>
              <p>No exercises found.</p>
            </div>
          )}
        </div>
      </div>
        </BottomSheet>
      )}
    </AnimatePresence>
  );
}
