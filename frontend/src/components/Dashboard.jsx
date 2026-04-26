import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function Dashboard({ stats, monitors }) {
  const upMonitors   = monitors.filter(m => m.status === 'up')
  const downMonitors = monitors.filter(m => m.status === 'down')

  const chartLabels = monitors.slice(0, 8).map(m => m.name.substring(0, 12))
  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Avg Response Time (ms)',
      data: monitors.slice(0, 8).map(m => Math.round(m.avg_response_time || 0)),
      fill: true,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      pointBackgroundColor: '#3b82f6',
      pointRadius: 5,
      tension: 0.4
    }]
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#1e2d4a' }, ticks: { color: '#8b9dc3', font: { size: 11 } } },
      y: { grid: { color: '#1e2d4a' }, ticks: { color: '#8b9dc3', font: { size: 11 } } }
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Live overview of all your API monitors</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Monitors</span>
          <span className="stat-value blue">{stats.total}</span>
          <span className="stat-sub">registered endpoints</span>
        </div>
        <div className="stat-card green">
          <span className="stat-label">Online</span>
          <span className="stat-value green">{stats.up}</span>
          <span className="stat-sub">responding normally</span>
        </div>
        <div className="stat-card red">
          <span className="stat-label">Offline</span>
          <span className="stat-value red">{stats.down}</span>
          <span className="stat-sub">need attention</span>
        </div>
        <div className="stat-card yellow">
          <span className="stat-label">Active Alerts</span>
          <span className="stat-value yellow">{stats.activeAlerts}</span>
          <span className="stat-sub">unresolved incidents</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Uptime</span>
          <span className="stat-value blue">{stats.avgUptime}%</span>
          <span className="stat-sub">across all monitors</span>
        </div>
      </div>

      {monitors.length > 0 && (
        <div className="chart-wrap">
          <p className="section-title">Response Times (ms)</p>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="dashboard-monitors">
        <p className="section-title">Monitor Status</p>
        {monitors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📡</div>
            <h3>No monitors configured</h3>
            <p>Click "+ Add Monitor" to start tracking your APIs</p>
          </div>
        ) : (
          monitors.map(m => (
            <div key={m.id} className="monitor-row">
              <div className={`status-dot`} style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: m.status === 'up' ? 'var(--green)' : m.status === 'down' ? 'var(--red)' : 'var(--text-3)',
                boxShadow: m.status === 'up' ? '0 0 8px var(--green)' : m.status === 'down' ? '0 0 8px var(--red)' : 'none'
              }} />
              <span className="monitor-row-name">{m.name}</span>
              <span className="monitor-row-url">{m.url}</span>
              <span className="monitor-row-uptime" style={{ color: m.uptime_percent >= 90 ? 'var(--green)' : m.uptime_percent >= 70 ? 'var(--yellow)' : 'var(--red)' }}>
                {Math.round(m.uptime_percent || 0)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
