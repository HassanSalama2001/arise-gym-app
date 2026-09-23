import { useState } from 'react';
import BottomSheet from '../../components/BottomSheet';

export default function ConfirmDeleteSheet({ onConfirm, onClose }) {
  const [input, setInput] = useState('');
  return (
    <BottomSheet 
      onClose={onClose} 
      title="DANGER ZONE"
      footer={
        <div className="sheet-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>CANCEL</button>
          <button
            className="btn-primary"
            style={{ flex: 1, background: input === 'ARISE' ? 'var(--accent-red)' : 'var(--bg-surface)', color: input === 'ARISE' ? 'white' : 'var(--text-muted)' }}
            disabled={input !== 'ARISE'}
            onClick={onConfirm}
            id="confirm-delete-btn"
          >
            DELETE ALL
          </button>
        </div>
      }
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>This will permanently delete ALL your workout data, XP, and progress. Type <strong style={{ color: 'var(--text-primary)' }}>ARISE</strong> to confirm.</p>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type ARISE to confirm"
        id="delete-confirm-input"
        style={{ marginBottom: 16 }}
      />
    </BottomSheet>
  );
}
