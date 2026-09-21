import { useState, useRef, useEffect } from 'react';
import db from '../db/db';
import { backupToCloud, restoreFromCloud } from '../db/sync';
import { exportBackup, importBackup, parseBackup } from '../db/backup';
import { useAlert } from '../context/AlertContext';

const REPLACE_WARNING = 'This replaces everything on this device (workouts, plans, meals, scans and progress) with the backup. Export a copy first if you might want the current data back.';

/** Cloud backup/restore and JSON export/import, shared by the Profile and Settings screens. */
export function useBackup() {
  const { showAlert, showConfirm } = useAlert();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [exportMsg, setExportMsg] = useState('');
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function flash(setter, message) {
    setter(message);
    timers.current.push(setTimeout(() => setter(''), 3000));
  }

  async function markSynced() {
    await db.playerProfile.update('profile', { lastSyncedAt: Date.now() });
  }

  async function backup() {
    setSyncing(true);
    setSyncStatus('Backing up...');
    try {
      let res = await backupToCloud();
      if (res.conflict) {
        const force = await showConfirm(
          `The cloud has a newer backup (${new Date(res.cloudTime).toLocaleString()}) than this device's last sync (${res.localTime ? new Date(res.localTime).toLocaleString() : 'never'}).\n\nOverwrite the cloud backup with this device's data?`,
          'Sync Conflict',
          { okText: 'OVERWRITE CLOUD', cancelText: 'CANCEL', danger: true }
        );
        if (!force) {
          flash(setSyncStatus, 'Backup cancelled.');
          return;
        }
        res = await backupToCloud(true);
      }
      if (!res.success) throw new Error(res.error);
      await markSynced();
      flash(setSyncStatus, 'Backup complete!');
    } catch (err) {
      flash(setSyncStatus, 'Backup failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  }

  async function restore() {
    const confirmed = await showConfirm(REPLACE_WARNING, 'Restore from Cloud?', { okText: 'RESTORE', danger: true });
    if (!confirmed) return;
    setSyncing(true);
    setSyncStatus('Restoring...');
    try {
      const res = await restoreFromCloud();
      if (!res.success) throw new Error(res.error);
      await markSynced();
      setSyncStatus('Restore complete!');
      window.location.reload();
    } catch (err) {
      flash(setSyncStatus, 'Restore failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  }

  async function exportFile() {
    try {
      const data = await exportBackup();
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arise-backup-${data.exportedAt.split('T')[0]}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      flash(setExportMsg, 'Exported successfully');
    } catch (err) {
      await showAlert('Failed to export data: ' + err.message, 'Export Failed');
    }
  }

  /** Pass the change event of an <input type="file">. */
  async function importFile(event) {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    let data;
    try {
      data = JSON.parse(await file.text());
      parseBackup(data); // validate before asking for confirmation
    } catch (err) {
      await showAlert(err instanceof SyntaxError ? 'This file is not valid JSON.' : err.message, 'Import Error');
      return;
    }

    const confirmed = await showConfirm(REPLACE_WARNING, 'Import Backup?', { okText: 'IMPORT', danger: true });
    if (!confirmed) return;

    try {
      await importBackup(data);
      await showAlert('Import successful! The app will reload to apply changes.', 'Success');
      window.location.reload();
    } catch (err) {
      await showAlert('Failed to import backup: ' + err.message, 'Import Error');
    }
  }

  return { syncing, syncStatus, exportMsg, backup, restore, exportFile, importFile };
}
