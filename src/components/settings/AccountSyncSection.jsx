export default function AccountSyncSection({ session, syncing, syncStatus, onBackup, onRestore, onSignIn, onSignOut }) {
  return (
    <div className="settings-section mt-24">
      <span className="section-label">ACCOUNT & CLOUD SYNC</span>
      <div className="settings-card card mt-8">
        <div className="account-status-row">
          <div className="settings-info">
            <span className="settings-title">
              {session ? `Signed in as` : 'Guest Mode'}
            </span>
            <span className="settings-desc" style={{ color: session ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: 600 }}>
              {session ? session.user.email : 'Data saved locally on this device'}
            </span>
          </div>
          {session && (
            <div className="sync-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          )}
        </div>

        <div className="sync-actions-grid mt-16">
          {session ? (
            <>
              <button className="sync-btn" onClick={onBackup} disabled={syncing}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                SYNC TO CLOUD
              </button>
              <button className="sync-btn" onClick={onRestore} disabled={syncing}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                RESTORE FROM CLOUD
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => onSignIn()} style={{ gridColumn: 'span 2' }}>
              SIGN IN TO SYNC
            </button>
          )}
        </div>

        {syncStatus && <div className={`sync-msg mt-8 ${syncStatus.includes('failed') ? 'error' : 'success'}`}>{syncStatus}</div>}

        {session && (
          <button className="btn-ghost mt-16" onClick={onSignOut} style={{ color: 'var(--accent-red)', borderColor: 'rgba(255, 23, 68, 0.2)' }}>
            SIGN OUT
          </button>
        )}
      </div>
    </div>
  );
}
