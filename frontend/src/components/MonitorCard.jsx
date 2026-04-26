export default function MonitorCard({ monitor, onDelete }) {
  const statusClass = monitor.status === 'up' ? 'up' : monitor.status === 'down' ? 'down' : 'unknown'
  const uptime = Math.round(monitor.uptime_percent || 0)
  const avgResp = Math.round(monitor.avg_response_time || 0)

  const lastChecked = monitor.last_checked
    ? new Date(monitor.last_checked + ' UTC').toLocaleTimeString()
    : 'Never'

  return (
    <div className={`monitor-card status-${statusClass}`} id={`monitor-${monitor.id}`}>
      <div className="monitor-header">
        <span className="monitor-name">{monitor.name}</span>
        <span className={`status-badge ${statusClass}`}>
          <span className="status-dot" />
          {monitor.status || 'unknown'}
        </span>
      </div>

      <div className="monitor-url">{monitor.url}</div>

      <div className="monitor-metrics">
        <div className="metric">
          <span className="metric-label">Uptime</span>
          <span className="metric-value" style={{ color: uptime >= 90 ? 'var(--green)' : uptime >= 70 ? 'var(--yellow)' : 'var(--red)' }}>
            {uptime}%
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Avg Response</span>
          <span className="metric-value">{avgResp > 0 ? `${avgResp}ms` : '—'}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Interval</span>
          <span className="metric-value">{monitor.interval_seconds}s</span>
        </div>
      </div>

      <div className="monitor-footer">
        <span className="last-checked">Last checked: {lastChecked}</span>
        <button
          id={`btn-delete-${monitor.id}`}
          className="btn-danger"
          onClick={() => { if (window.confirm(`Delete monitor "${monitor.name}"?`)) onDelete(monitor.id) }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
