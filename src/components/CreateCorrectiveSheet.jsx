import React, { useState } from 'react';
import BottomSheet from './BottomSheet';
import ExercisePickerSheet from './ExercisePickerSheet';
import db from '../db/db';
import { AnimatePresence } from 'framer-motion';

export default function CreateCorrectiveSheet({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Upper Body');
  const [icon, setIcon] = useState('🛠️');
  const [targetSessions, setTargetSessions] = useState(30);
  const [protocol, setProtocol] = useState([]); // [{ exerciseId, name, sets, reps, notes }]
  
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const categories = ['Upper Body', 'Lower Body', 'Spine', 'Full Body'];
  const icons = ['🛠️', '🔄', '⚕️', '💪', '🩹', '🧘', '⚙️', '🚼', '⚖️'];

  function handleAddExercise(ex) {
    setProtocol(prev => [
      ...prev,
      { exerciseId: ex.id, name: ex.name, sets: 2, reps: '15 reps', notes: '' }
    ]);
  }

  function updateProtocolItem(idx, field, value) {
    setProtocol(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  function removeProtocolItem(idx) {
    setProtocol(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!name.trim() || protocol.length === 0) return;
    
    const newCorrective = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      category,
      icon,
      severity: 'custom',
      timeline: 'Ongoing',
      targetSessionsDefault: targetSessions,
      correctiveProtocol: protocol,
      createdAt: new Date().toISOString()
    };

    await db.customPosturalIssues.add(newCorrective);
    if (onCreated) onCreated(newCorrective);
    onClose();
  }

  return (
    <>
      <BottomSheet onClose={onClose} title="CUSTOM CORRECTIVE">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24, maxHeight: '80vh', overflowY: 'auto' }}>
          
          <div>
            <label className="section-label">PROTOCOL NAME</label>
            <input 
              type="text" 
              className="search-input" 
              placeholder="e.g., Morning Mobility Routine" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              style={{ width: '100%', marginTop: 8 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="section-label">CATEGORY</label>
              <select 
                className="search-input" 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', marginTop: 8, appearance: 'none', background: 'var(--bg-surface)' }}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ width: 80 }}>
              <label className="section-label">ICON</label>
              <select 
                className="search-input" 
                value={icon} 
                onChange={e => setIcon(e.target.value)}
                style={{ width: '100%', marginTop: 8, appearance: 'none', background: 'var(--bg-surface)', textAlign: 'center' }}
              >
                {icons.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="section-label">TARGET SESSIONS</label>
            <input 
              type="number" 
              className="search-input" 
              value={targetSessions} 
              onChange={e => setTargetSessions(parseInt(e.target.value) || 30)} 
              style={{ width: '100%', marginTop: 8 }}
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label className="section-label" style={{ margin: 0 }}>EXERCISES ({protocol.length})</label>
            </div>

            {protocol.map((item, idx) => (
              <div key={idx} style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                  <button onClick={() => removeProtocolItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)' }}>✕</button>
                </div>
                
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input type="number" className="search-input" value={item.sets} onChange={e => updateProtocolItem(idx, 'sets', parseInt(e.target.value)||0)} style={{ width: 60, padding: 8 }} placeholder="Sets" />
                  <input type="text" className="search-input" value={item.reps} onChange={e => updateProtocolItem(idx, 'reps', e.target.value)} style={{ flex: 1, padding: 8 }} placeholder="Reps (e.g., 15 reps, 30s hold)" />
                </div>
                
                <input type="text" className="search-input" value={item.notes} onChange={e => updateProtocolItem(idx, 'notes', e.target.value)} style={{ width: '100%', padding: 8 }} placeholder="Notes / Cues (optional)" />
              </div>
            ))}

            <button 
              className="btn-ghost" 
              style={{ width: '100%', border: '1px dashed var(--accent-blue)', color: 'var(--accent-blue)', marginTop: 8 }}
              onClick={() => setShowExercisePicker(true)}
            >
              + ADD EXERCISE
            </button>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={!name.trim() || protocol.length === 0}
            style={{ marginTop: 16 }}
          >
            SAVE PROTOCOL
          </button>
        </div>
      </BottomSheet>

      <AnimatePresence>
        {showExercisePicker && (
          <ExercisePickerSheet 
            onClose={() => setShowExercisePicker(false)} 
            onSelect={handleAddExercise} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
