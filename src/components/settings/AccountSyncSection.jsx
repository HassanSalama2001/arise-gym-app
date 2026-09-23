export default function AccountSyncSection({ session, syncing, syncStatus, lastSyncedAt, onSync, onSignIn, onSignOut }) {
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

        <div className="mt-16">
          {session ? (
            <>
              <button className="btn-primary" onClick={onSync} disabled={syncing} style={{ width: '100%' }} id="sync-now">
                {syncing ? 'SYNCING...' : 'SYNC NOW'}
              </button>
              <span className="settings-desc" style={{ display: 'block', marginTop: 8 }}>
                Sends what you logged here and brings in changes from your other devices.
                {lastSyncedAt ? ` Last synced ${new Date(lastSyncedAt).toLocaleString()}.` : ' Not synced yet.'}
              </span>
            </>
          ) : (
            <button className="btn-primary" onClick={() => onSignIn()} style={{ width: '100%' }}>
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
