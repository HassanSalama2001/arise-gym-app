import ImportHistorySection from './ImportHistorySection';

export default function LocalDataSection({ exportMsg, onExport, onImport, onReset }) {
  return (
    <div className="settings-section mt-24">
      <span className="section-label">BACKUP & LOCAL DATA</span>
      <div className="settings-card card mt-8" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="data-action-block">
          <div className="settings-info">
            <span className="settings-title">Export Backup</span>
            <span className="settings-desc">Save your workout history as a JSON file</span>
          </div>
          <button className="data-btn mt-8" onClick={onExport}>
            EXPORT
          </button>
        </div>
        {exportMsg && <div className="sync-msg success" style={{ marginTop: 4 }}>{exportMsg}</div>}

        <div className="data-action-block" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div className="settings-info">
            <span className="settings-title">Import Backup</span>
            <span className="settings-desc">Load database from a previously exported JSON file</span>
          </div>
          <label className="data-btn mt-8" style={{ cursor: 'pointer', textAlign: 'center' }}>
            IMPORT
            <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
          </label>
        </div>

        <ImportHistorySection />

        <div className="data-action-block" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div className="settings-info">
            <span className="settings-title" style={{ color: 'var(--accent-red)' }}>Clear All Data</span>
            <span className="settings-desc">Delete all local workouts, plans, and profile history</span>
          </div>
          <button className="btn-ghost mt-8" onClick={onReset} style={{ color: 'var(--accent-red)', borderColor: 'rgba(255, 23, 68, 0.3)' }}>
            RESET APP
          </button>
        </div>
      </div>
    </div>
  );
}
