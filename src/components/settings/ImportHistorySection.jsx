import { useState } from 'react';
import { useAlert } from '../../context/useAlert';
import { previewWorkoutImport, importWorkouts } from '../../db/importWorkouts';

const APP_NAMES = { hevy: 'Hevy', strong: 'Strong' };

export default function ImportHistorySection() {
  const { showAlert, showConfirm, showToast } = useAlert();
  const [busy, setBusy] = useState(false);

  async function handleFile(event) {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    setBusy(true);
    try {
      const preview = await previewWorkoutImport(await file.text());
      const newSessions = preview.sessions - preview.alreadyImported;
      if (!newSessions) {
        await showAlert('Every workout in this file is already in ARISE.', 'Nothing New');
        return;
      }

      const lines = [
        `Found ${newSessions} workout${newSessions === 1 ? '' : 's'} (${preview.sets} sets) from ${APP_NAMES[preview.format]}.`,
        preview.alreadyImported ? `${preview.alreadyImported} already imported and will be skipped.` : '',
        preview.unmatched.length
          ? `${preview.unmatched.length} exercise${preview.unmatched.length === 1 ? '' : 's'} not in ARISE will be added as custom exercises (e.g. ${preview.unmatched.slice(0, 3).join(', ')}).`
          : 'All exercises matched ones in ARISE.',
        'Imported workouts are added to your history; they do not award XP.',
      ].filter(Boolean);

      const confirmed = await showConfirm(lines.join('\n\n'), 'Import History?', { okText: 'IMPORT' });
      if (!confirmed) return;

      const result = await importWorkouts(preview.parsed);
      showToast(`Imported ${result.importedSessions} workouts (${result.importedSets} sets).`);
    } catch (err) {
      await showAlert(err.message, 'Import Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="data-action-block" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
      <div className="settings-info">
        <span className="settings-title">Import from Hevy or Strong</span>
        <span className="settings-desc">Add your workout history from another app's CSV export</span>
      </div>
      <label className="data-btn mt-8" style={{ cursor: busy ? 'progress' : 'pointer', textAlign: 'center' }}>
        {busy ? 'READING...' : 'IMPORT CSV'}
        <input type="file" accept=".csv,text/csv" onChange={handleFile} disabled={busy} style={{ display: 'none' }} />
      </label>
    </div>
  );
}
