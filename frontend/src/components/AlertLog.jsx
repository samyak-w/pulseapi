export default function AlertLog({ alerts }) {
  const active   = alerts.filter(a => !a.resolved)
  const resolved = alerts.filter(a =>  a.resolved)

  return (
    <div>
      <div className="page-header">
        <h1>Alert Log</h1>
        <p>{active.length} active · {resolved.length} resolved</p>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No alerts</h3>
          <p>All your monitored APIs are healthy</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p className="section-title" style={{ color: 'var(--red)' }}>🔴 Active Incidents ({active.length})</p>
              <div className="alerts-list">
                {active.map(a => <AlertItem key={a.id} alert={a} />)}
              </div>
            </div>
          )}
          {resolved.length > 0 && (
            <div>
              <p className="section-title">✅ Resolved ({resolved.length})</p>
              <div className="alerts-list">
                {resolved.map(a => <AlertItem key={a.id} alert={a} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AlertItem({ alert }) {
  const state = alert.resolved ? 'resolved' : 'active'
  const created = new Date(alert.created_at + ' UTC').toLocaleString()
  const resolvedAt = alert.resolved_at
    ? new Date(alert.resolved_at + ' UTC').toLocaleString()
    : null

  return (
    <div className={`alert-item ${state}`} id={`alert-${alert.id}`}>
      <div className={`alert-dot ${state}`} />
      <div className="alert-info">
        <div className="alert-name">{alert.monitor_name || 'Unknown Monitor'}</div>
        <div className="alert-msg">{alert.message}</div>
        {resolvedAt && <div className="alert-msg" style={{ color: 'var(--green)', marginTop: 2 }}>Resolved: {resolvedAt}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span className={`alert-status ${state}`}>{state.toUpperCase()}</span>
        <span className="alert-meta">{created}</span>
      </div>
    </div>
  )
}
