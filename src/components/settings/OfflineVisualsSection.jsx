import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../../db/db';
import { useAlert } from '../../context/useAlert';
import {
  AVERAGE_VISUAL_BYTES, downloadVisuals, exercisesInPlans, clearVisualCache,
  storageEstimate, requestPersistentStorage,
} from '../../utils/exerciseImages';

const mb = bytes => Math.max(1, Math.round(bytes / 1048576));

export default function OfflineVisualsSection() {
  const { showAlert, showConfirm, showToast } = useAlert();
  const cachedCount = useLiveQuery(() => db.exerciseImageCache.count(), [], null);
  const totalWithVisuals = useLiveQuery(() => db.exercises.filter(ex => !!ex.gifUrl).count(), [], null);
  const [progress, setProgress] = useState(null); // { done, total }
  const abortRef = useRef(null);

  async function run(getExercises, label) {
    const exercises = await getExercises();
    if (!exercises.length) {
      await showAlert('No exercises to download yet. Add some to a plan first.', 'Nothing to Download');
      return;
    }
    const missing = exercises.length;
    const confirmed = await showConfirm(
      `Download demonstrations for ${missing} ${label} (up to about ${mb(missing * AVERAGE_VISUAL_BYTES)} MB)? Best done on Wi-Fi.`,
      'Download Visuals?',
      { okText: 'DOWNLOAD' }
    );
    if (!confirmed) return;

    await requestPersistentStorage();
    const controller = new AbortController();
    abortRef.current = controller;
    setProgress({ done: 0, total: missing });
    try {
      const result = await downloadVisuals(exercises, { signal: controller.signal, onProgress: setProgress });
      if (result.cancelled) showToast('Download stopped.');
      else if (result.failed) showToast(`Downloaded ${result.done - result.failed} of ${result.total}; ${result.failed} unavailable.`);
      else showToast(`${result.total} demonstrations saved for offline use.`);
    } catch (err) {
      await showAlert('Download failed: ' + err.message, 'Download Failed');
    } finally {
      abortRef.current = null;
      setProgress(null);
    }
  }

  async function handleClear() {
    const confirmed = await showConfirm(
      'Delete the downloaded exercise demonstrations? They will be fetched again when you next view an exercise online.',
      'Clear Downloads?',
      { okText: 'CLEAR', danger: true }
    );
    if (!confirmed) return;
    await clearVisualCache();
    showToast('Downloads cleared.');
  }

  async function showStorage() {
    const estimate = await storageEstimate();
    if (!estimate) {
      await showAlert('This browser does not report storage usage.', 'Storage');
      return;
    }
    await showAlert(
      `ARISE is using about ${mb(estimate.usage)} MB of the ${mb(estimate.quota)} MB this browser allows.`,
      'Storage Used'
    );
  }

  const cached = cachedCount ?? 0;
  const total = totalWithVisuals ?? 0;

  return (
    <div className="settings-section mt-24">
      <span className="section-label">OFFLINE DEMONSTRATIONS</span>
      <div className="settings-card card mt-8" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="settings-info">
          <span className="settings-title">Exercise animations</span>
          <span className="settings-desc">
            {cached} of {total} saved on this device{cached > 0 ? ` (about ${mb(cached * AVERAGE_VISUAL_BYTES)} MB)` : ''}.
            Saved animations play without a connection.
          </span>
        </div>

        {progress ? (
          <>
            <div className="settings-desc">Downloading {progress.done} of {progress.total}...</div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-void)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
                  background: 'var(--accent-blue)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
            <button className="btn-ghost" onClick={() => abortRef.current?.abort()}>
              STOP DOWNLOAD
            </button>
          </>
        ) : (
          <div className="sync-actions-grid">
            <button className="sync-btn" onClick={() => run(exercisesInPlans, 'exercises in your plans')}>
              MY PLANS
            </button>
            <button
              className="sync-btn"
              onClick={() => run(() => db.exercises.filter(ex => !!ex.gifUrl).toArray(), 'exercises')}
            >
              ALL ({mb(total * AVERAGE_VISUAL_BYTES)} MB)
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="data-btn" style={{ flex: 1 }} onClick={showStorage}>STORAGE USED</button>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={handleClear} disabled={!cached || !!progress}>
            CLEAR DOWNLOADS
          </button>
        </div>
      </div>
    </div>
  );
}
