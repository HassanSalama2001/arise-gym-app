import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import db from '../../db/db';
import { useAlert } from '../../context/useAlert';
import BottomSheet from '../../components/BottomSheet';
import { compressImageToDataUrl } from '../../utils/image';
import { calculateInBodyScore, calculateBMI, lbsToKg } from '../../utils/calorieEngine';

/* ── InBody Scan Tracker ────────────────────────── */
export default function InBodyTracker({ scans, openSheet, setOpenSheet, unitPreference, gender, height }) {
  const { showAlert, showConfirm, showToast } = useAlert();
  const [formData, setFormData] = useState({ weight: '', smm: '', bf: '', score: '', photoUrl: '' });
  
  async function handleSave() {
    if (!formData.weight || !formData.smm || !formData.bf) return;
    
    let scoreVal = parseFloat(formData.score) || 0;
    let scoreEstimated = false;
    
    if (scoreVal === 0 && height && gender) {
      const weightKg = unitPreference === 'lbs' ? lbsToKg(parseFloat(formData.weight)) : parseFloat(formData.weight);
      const smmKg = unitPreference === 'lbs' ? lbsToKg(parseFloat(formData.smm)) : parseFloat(formData.smm);
      scoreVal = calculateInBodyScore(weightKg, smmKg, parseFloat(formData.bf), height, gender);
      scoreEstimated = true;
    } else if (scoreVal > 0) {
      scoreEstimated = false;
    }

    await db.inbodyScans.put({
      date: new Date().toISOString(),
      weight: parseFloat(formData.weight),
      smm: parseFloat(formData.smm),
      bf: parseFloat(formData.bf),
      score: scoreVal,
      scoreEstimated,
      photoUrl: formData.photoUrl
    });
    setOpenSheet(false);
    setFormData({ weight: '', smm: '', bf: '', score: '', photoUrl: '' });
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const photoUrl = await compressImageToDataUrl(file);
      setFormData(p => ({ ...p, photoUrl }));
    } catch {
      showAlert('Could not read that image. Try a JPEG or PNG photo.', 'Photo Error');
    }
  }

  const unscoredCount = scans ? scans.filter(s => !s.score || s.score === 0).length : 0;
  const canRecalculate = unscoredCount > 0 && gender && height;

  async function handleBatchRecalculate() {
    const confirmation = await showConfirm(`Estimate scores for ${unscoredCount} historical scan(s) using your profile height (${height}cm) and gender (${gender.toUpperCase()})?`);
    if (!confirmation) return;
    
    await db.transaction('rw', db.inbodyScans, async () => {
      for (const scan of scans) {
        if (!scan.score || scan.score === 0) {
          const weightKg = unitPreference === 'lbs' ? lbsToKg(scan.weight) : scan.weight;
          const smmKg = unitPreference === 'lbs' ? lbsToKg(scan.smm) : scan.smm;
          const calculated = calculateInBodyScore(weightKg, smmKg, scan.bf, height, gender);
          await db.inbodyScans.update(scan.id, {
            score: calculated,
            scoreEstimated: true
          });
        }
      }
    });
    
    showToast(`Estimated scores for ${unscoredCount} scans!`);
  }

  const getScoreColor = (score) => {
    if (!score) return 'var(--text-secondary)';
    if (score >= 80) return 'var(--success)';
    if (score >= 70) return 'var(--accent-gold)';
    return 'var(--accent-red)';
  };

  const latest = scans?.[0];

  return (
    <div className="profile-section">
      <span className="section-label">INBODY SCANS</span>
      <div className="card mt-8">
        {latest ? (
          <div className="inbody-latest">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Latest: {new Date(latest.date).toLocaleDateString()}</span>
              {latest.photoUrl && <span style={{ fontSize: 13, color: 'var(--accent-blue)' }}>📸 Proof attached</span>}
            </div>
            <div className="stat-overview-row" style={{ marginBottom: 0 }}>
              <div className="stat-overview-box">
                <span className="stat-number">{latest.weight}{unitPreference}</span>
                <span className="section-label">Weight</span>
              </div>
              <div className="stat-overview-box">
                <span className="stat-number" style={{ color: 'var(--success)' }}>{latest.smm}{unitPreference}</span>
                <span className="section-label">Muscle</span>
              </div>
              <div className="stat-overview-box">
                <span className="stat-number" style={{ color: 'var(--accent-red)' }}>{latest.bf}%</span>
                <span className="section-label">Fat</span>
              </div>
              <div className="stat-overview-box">
                <span className="stat-number" style={{ color: getScoreColor(latest.score) }}>{latest.score || 'N/A'}</span>
                <span className="section-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  Score
                  {latest.scoreEstimated && <span style={{ fontSize: 9, color: 'var(--accent-blue)', opacity: 0.8, marginTop: 2 }}>⚡ EST.</span>}
                </span>
              </div>
            </div>

            {height ? (
              <div style={{ textAlign: 'center', marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                BMI: <strong style={{ color: 'var(--text-primary)' }}>{calculateBMI(unitPreference === 'lbs' ? lbsToKg(latest.weight) : latest.weight, height)}</strong>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                ⚠️ Set Height in settings to view BMI and auto-calculate InBody Score
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>No InBody scans recorded yet.</p>
        )}
        
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-ghost" style={{ marginTop: 16, flex: 1 }} onClick={() => setOpenSheet(true)}>+ ADD INBODY SCAN</button>
          {canRecalculate && (
            <button className="btn-ghost" style={{ marginTop: 16, flex: 1, color: 'var(--accent-blue)', borderColor: 'rgba(79, 195, 247, 0.3)' }} onClick={handleBatchRecalculate}>
              ⚡ ESTIMATE HISTORICAL ({unscoredCount})
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {openSheet && (
          <BottomSheet 
            onClose={() => setOpenSheet(false)} 
            title="RECORD INBODY SCAN"
            footer={
              <button className="btn-primary w-full" onClick={handleSave} disabled={!formData.weight || !formData.smm || !formData.bf}>SAVE SCAN</button>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label className="section-label">Weight ({unitPreference})</label>
                <input type="number" inputMode="decimal" value={formData.weight} onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
              </div>
              <div>
                <label className="section-label">SMM - Muscle ({unitPreference})</label>
                <input type="number" inputMode="decimal" value={formData.smm} onChange={e => setFormData(p => ({ ...p, smm: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
              </div>
              <div>
                <label className="section-label">Body Fat (%)</label>
                <input type="number" inputMode="decimal" value={formData.bf} onChange={e => setFormData(p => ({ ...p, bf: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
              </div>
              <div>
                <label className="section-label">InBody Score</label>
                <input type="number" inputMode="decimal" value={formData.score} onChange={e => setFormData(p => ({ ...p, score: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="section-label">Photo Proof (Optional)</label>
              {formData.photoUrl ? (
                <div style={{ marginTop: 8, position: 'relative' }}>
                  <img src={formData.photoUrl} alt="InBody Proof" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <button onClick={() => setFormData(p => ({ ...p, photoUrl: '' }))} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', padding: 4, borderRadius: '50%' }}>❌</button>
                </div>
              ) : (
                <label style={{ display: 'block', marginTop: 8, padding: '16px', border: '1px solid var(--border)', borderStyle: 'dashed', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--accent-blue)', cursor: 'pointer' }}>
                  Tap to upload scan photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
