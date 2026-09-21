import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import BottomSheet from './BottomSheet';

export default function EditPlanModal({ isOpen, onClose, plan, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (plan) {
      setName(plan.name || '');
      setDescription(plan.description || '');
    }
  }, [plan]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <BottomSheet onClose={onClose} title="Edit Plan">
          <div className="section">
        <label className="section-label" htmlFor="edit-plan-name">PLAN NAME</label>
        <input
          id="edit-plan-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Push Day, Full Body..."
          style={{ marginTop: 8 }}
          autoFocus
        />
      </div>

      <div className="section mt-16">
        <label className="section-label" htmlFor="edit-plan-desc">DESCRIPTION (OPTIONAL)</label>
        <textarea
          id="edit-plan-desc"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What is the goal of this plan?"
          style={{ 
            marginTop: 8, 
            width: '100%', 
            minHeight: '80px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      <button 
        className="btn-primary" 
        style={{ width: '100%', marginTop: 24 }}
        onClick={handleSave}
        disabled={!name.trim()}
      >
        SAVE CHANGES
      </button>
        </BottomSheet>
      )}
    </AnimatePresence>
  );
}
