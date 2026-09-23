import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../../db/db';
import BottomSheet from '../../components/BottomSheet';

/* ── Measurements Tracker ────────────────────────── */
export default function MeasurementsTracker({ measurements, openSheet, setOpenSheet }) {
  const [showGuide, setShowGuide] = useState(null);
  const [formData, setFormData] = useState({ neck: '', chest: '', waist: '', arms: '' });

  const guides = {
    neck: 'Measure horizontally around the widest part of your neck.',
    chest: 'Measure across the nipples while breathing normally.',
    waist: 'Measure around the belly button, totally relaxed.',
    arms: 'Measure the thickest part of the bicep while flexed.'
  };

  async function handleSave() {
    await db.measurements.put({
      date: new Date().toISOString(),
      neck: parseFloat(formData.neck) || null,
      chest: parseFloat(formData.chest) || null,
      waist: parseFloat(formData.waist) || null,
      arms: parseFloat(formData.arms) || null
    });
    setOpenSheet(false);
    setFormData({ neck: '', chest: '', waist: '', arms: '' });
  }

  const latest = measurements?.[0];

  return (
    <div className="profile-section">
      <span className="section-label">BODY MEASUREMENTS</span>
      <div className="card mt-8">
        {latest ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {['neck', 'chest', 'waist', 'arms'].map(k => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k}</span>
                <span className="stat-number" style={{ fontSize: 16 }}>{latest[k]}cm</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>No measurements yet.</p>
        )}
        <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => setOpenSheet(true)}>+ ADD MEASUREMENTS</button>
      </div>

      <AnimatePresence>
        {openSheet && (
          <BottomSheet 
            onClose={() => setOpenSheet(false)} 
            title="RECORD MEASUREMENTS"
            footer={
              <button className="btn-primary w-full" onClick={handleSave}>SAVE MEASUREMENTS</button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {['neck', 'chest', 'waist', 'arms'].map(k => (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="section-label" style={{ textTransform: 'capitalize' }}>{k} (cm)</label>
                    <button className="guide-btn" onClick={() => setShowGuide(showGuide === k ? null : k)} style={{ background: 'var(--bg-void)', border: '1px solid var(--border)', width: 20, height: 20, borderRadius: '50%', fontSize: 10, color: 'var(--text-muted)' }}>?</button>
                  </div>
                  <input type="number" inputMode="decimal" value={formData[k]} onChange={e => setFormData(p => ({ ...p, [k]: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
                  <AnimatePresence>
                    {showGuide === k && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ fontSize: 11, color: 'var(--accent-blue)', marginTop: 4, overflow: 'hidden' }}>
                        {guides[k]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
