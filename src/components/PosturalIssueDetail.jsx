import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import db from '../db/db';
import './PosturalIssueDetail.css';

export default function PosturalIssueDetail({ issue, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diagnose');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [position, setPosition] = useState('warmup');
  const [targetSessions, setTargetSessions] = useState(issue.targetSessionsDefault || 30);

  // Check if user is tracking this issue
  const trackingRecord = useLiveQuery(() => 
    db.userPosturalIssues.where('issueId').equals(issue.id).first(),
    [issue.id]
  );

  const isTracking = trackingRecord && trackingRecord.status === 'active';
  const isResolved = trackingRecord && trackingRecord.status === 'resolved';

  async function handleStartTracking() {
    await db.userPosturalIssues.add({
      issueId: issue.id,
      addedAt: Date.now(),
      status: 'active',
      targetSessions: Number(targetSessions),
      completedSessions: 0,
      position: position
    });
    setIsConfiguring(false);
  }

  async function handleStopTracking() {
    if (trackingRecord) {
      await db.userPosturalIssues.delete(trackingRecord.id);
    }
  }

  return createPortal(
    <motion.div 
      className="bottom-sheet-overlay" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      onClick={onClose}
    >
      <motion.div 
        className="bottom-sheet postural-detail-sheet" 
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }} 
        transition={{ type: 'spring', stiffness: 400, damping: 35 }} 
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <div className="bottom-sheet-handle" />
        
        {/* Header */}
        <div className="postural-detail-header">
          <span className="postural-detail-icon">{issue.icon}</span>
          <div className="postural-detail-title-area">
            <h3 className="sheet-title">{issue.name}</h3>
            <div className="postural-detail-chips">
              <span className="chip chip-blue">{issue.category}</span>
              <span className="chip chip-gold">Timeline: {issue.timeline}</span>
            </div>
          </div>
        </div>

        {/* Tracking Progress */}
        {isTracking && (
          <div className="tracking-progress-card card mt-12">
            <div className="progress-text-row">
              <span className="section-label">🩺 TRACKING CORRECTIVE PLAN</span>
              <span className="progress-fraction">{trackingRecord.completedSessions} / {trackingRecord.targetSessions} SESSIONS</span>
            </div>
            <div className="progress-bar-bg mt-8">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(100, (trackingRecord.completedSessions / trackingRecord.targetSessions) * 100)}%` }}
              />
            </div>
            <span className="position-cue-label mt-4">
              Auto-injecting as <strong>{trackingRecord.position === 'both' ? 'Warm-up & Cool-down' : trackingRecord.position === 'warmup' ? 'Warm-up' : 'Cool-down'}</strong>
            </span>
          </div>
        )}

        {isResolved && (
          <div className="resolved-status-card card mt-12">
            <span className="resolved-badge">🏆 CORRECTIVE PLAN ACCOMPLISHED</span>
            <p className="resolved-text mt-4">You followed this protocol for {trackingRecord.targetSessions} sessions and resolved this posture issue. Excellent work, Hunter!</p>
            <button className="btn-ghost mt-8" onClick={handleStopTracking}>RESET & TRACK AGAIN</button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="tab-pills mt-16">
          <button className={`tab-pill ${activeTab === 'diagnose' ? 'active' : ''}`} onClick={() => setActiveTab('diagnose')}>DIAGNOSE</button>
          <button className={`tab-pill ${activeTab === 'protocol' ? 'active' : ''}`} onClick={() => setActiveTab('protocol')}>PROTOCOL</button>
          <button className={`tab-pill ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>INFO</button>
        </div>

        <div className="postural-detail-content mt-16" style={{ overflowY: 'auto', flex: 1, paddingBottom: 24 }}>
          {/* DIAGNOSE TAB */}
          {activeTab === 'diagnose' && (
            <div className="diagnose-tab">
              <span className="section-label">SELF-TEST DIAGNOSTICS</span>
              {issue.diagnostics.map((diag, index) => (
                <div key={index} className="diagnostic-card card mt-8">
                  <p className="diagnostic-name">🔍 {diag.name}</p>
                  <p className="diagnostic-desc mt-4">{diag.description}</p>
                  {diag.steps && (
                    <ol className="diagnostic-steps mt-8">
                      {diag.steps.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  )}
                  {diag.externalLink && (
                    <a 
                      href={diag.externalLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="diagnostic-link mt-8"
                      id={`diag-link-${issue.id}-${index}`}
                    >
                      <span>View Trusted Video Guide</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PROTOCOL TAB */}
          {activeTab === 'protocol' && (
            <div className="protocol-tab">
              <div className="protocol-summary-row">
                <div>
                  <span className="section-label">FREQUENCY</span>
                  <p className="protocol-meta-value">3-5x per week</p>
                </div>
                <div>
                  <span className="section-label">DURATION</span>
                  <p className="protocol-meta-value">{issue.timeline}</p>
                </div>
              </div>

              <span className="section-label mt-16" style={{ display: 'block' }}>CORRECTIVE PROTOCOL ROUTINE</span>
              <div className="protocol-exercise-list mt-8">
                {issue.correctiveProtocol.map((ex) => (
                  <div 
                    key={ex.exerciseId} 
                    className="protocol-exercise-card card" 
                    onClick={() => {
                      onClose();
                      navigate(`/exercise/${ex.exerciseId}`);
                    }}
                    title="Tap to see full form guide"
                  >
                    <div className="protocol-exercise-info">
                      <span className="protocol-exercise-name">{ex.name}</span>
                      <div className="protocol-exercise-sets">
                        <span className="chip chip-gold" style={{ fontSize: 10 }}>{ex.sets} sets</span>
                        <span className="chip chip-blue" style={{ fontSize: 10 }}>{ex.reps}</span>
                      </div>
                      <p className="protocol-exercise-notes mt-4">💡 {ex.notes}</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div className="info-tab">
              <span className="section-label">PRIMARY CAUSES</span>
              <div className="card mt-8">
                <ul className="info-causes-list">
                  {issue.causes.map((cause, idx) => (
                    <li key={idx}>{cause}</li>
                  ))}
                </ul>
              </div>

              <span className="section-label mt-16" style={{ display: 'block' }}>RESEARCH SOURCE & REFERENCE</span>
              <div className="card mt-8">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  This corrective routine follows the <strong>NASM (National Academy of Sports Medicine) Corrective Exercise Continuum</strong> principles:
                </p>
                <ol className="nasm-principles mt-8" style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 16 }}>
                  <li><strong>Inhibit</strong>: Release tight overactive muscles (foam rolling).</li>
                  <li><strong>Lengthen</strong>: Perform static stretching on shortened muscles.</li>
                  <li><strong>Activate</strong>: Strengthen underactive, weak muscles.</li>
                  <li><strong>Integrate</strong>: Retrain dynamic posture patterns.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="postural-detail-actions mt-16">
          {isConfiguring ? (
            <div className="configuration-panel card w-100">
              <span className="section-label">CONFIGURE CORRECTIVE PLAN</span>
              
              <div className="config-row mt-12">
                <label className="config-label" htmlFor="plan-position-select">INJECT PLACEMENT</label>
                <select 
                  id="plan-position-select"
                  value={position} 
                  onChange={e => setPosition(e.target.value)}
                  className="config-select"
                >
                  <option value="warmup">As Warm-up (Start of workout)</option>
                  <option value="cooldown">As Cool-down (End of workout)</option>
                  <option value="both">As Both (Warm-up & Cool-down)</option>
                </select>
              </div>

              <div className="config-row mt-12">
                <label className="config-label" htmlFor="plan-duration-select">PLAN SESSIONS DURATION</label>
                <select 
                  id="plan-duration-select"
                  value={targetSessions} 
                  onChange={e => setTargetSessions(Number(e.target.value))}
                  className="config-select"
                >
                  <option value={30}>30 Sessions (Beginner / Light Corrective)</option>
                  <option value={60}>60 Sessions (Intermediate / Standard Corrective)</option>
                  <option value={90}>90 Sessions (Advanced / Deep Structural Correction)</option>
                </select>
              </div>

              <div className="sheet-actions mt-16">
                <button className="btn-ghost" onClick={() => setIsConfiguring(false)} style={{ flex: 1 }}>CANCEL</button>
                <button className="btn-primary" onClick={handleStartTracking} style={{ flex: 2 }}>BEGIN PROTOCOL</button>
              </div>
            </div>
          ) : (
            <>
              {(!isTracking && !isResolved) && (
                <button className="btn-primary w-100" onClick={() => setIsConfiguring(true)} id="track-issue-btn">
                  TRACK CORRECTIVE PLAN
                </button>
              )}
              {isTracking && (
                <button className="btn-ghost w-100" onClick={handleStopTracking} style={{ color: 'var(--accent-red)' }} id="stop-tracking-btn">
                  STOP TRACKING PLAN
                </button>
              )}
              <button className="btn-ghost w-100 mt-8" onClick={onClose}>CLOSE</button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
