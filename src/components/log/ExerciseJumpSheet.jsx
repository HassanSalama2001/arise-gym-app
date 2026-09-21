import BottomSheet from '../BottomSheet';

/* ── Exercise Jump Sheet ──────────────────────── */
export default function ExerciseJumpSheet({ blocks, currentIdx, onSelect, onDeleteBlock, onClose }) {
  if (!blocks) return null;
  return (
    <BottomSheet
      onClose={onClose}
      title="JUMP TO BLOCK"
    >
      <div className="jump-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {blocks.map((block, i) => {
          const isSuperset = block.length > 1;
          const name = isSuperset ? `Superset (${block.length} exercises)` : (block[0]?.name || 'Unknown');
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <button 
                className={`jump-item ${i === currentIdx ? 'current' : ''}`} 
                onClick={() => { onSelect(i); onClose(); }} 
                id={`jump-to-${i}`}
                style={{ flex: 1, margin: 0 }}
              >
                <span className="jump-num">{i + 1}</span>
                <span className="jump-name">{name}</span>
                {i === currentIdx && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
              <button
                className="delete-jump-btn"
                onClick={(e) => { e.stopPropagation(); onDeleteBlock(i); }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-red-dim)',
                  border: '1px solid rgba(255, 23, 68, 0.2)',
                  color: 'var(--accent-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Remove exercise block"
                id={`delete-block-${i}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}
