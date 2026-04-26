import { useState, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import MonitorCard from './components/MonitorCard'
import AddMonitorModal from './components/AddMonitorModal'
import AlertLog from './components/AlertLog'

const API = import.meta.env.VITE_API_URL || ''

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [monitors, setMonitors] = useState([])
  const [stats, setStats] = useState({ total: 0, up: 0, down: 0, activeAlerts: 0, avgUptime: 0 })
  const [alerts, setAlerts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [mRes, sRes, aRes] = await Promise.all([
        fetch(`${API}/api/monitors`),
        fetch(`${API}/api/alerts/stats`),
        fetch(`${API}/api/alerts`)
      ])
      setMonitors(await mRes.json())
      setStats(await sRes.json())
      setAlerts(await aRes.json())
    } catch (e) {
      console.error('Failed to fetch data', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 15000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const handleAddMonitor = async (data) => {
    await fetch(`${API}/api/monitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    setShowModal(false)
    fetchAll()
  }

  const handleDelete = async (id) => {
    await fetch(`${API}/api/monitors/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="brand-pulse" />
          <span className="brand-name">PulseAPI</span>
          <span className="brand-tag">Health Monitor</span>
        </div>
        <nav className="nav">
          {['dashboard', 'monitors', 'alerts'].map(p => (
            <button
              key={p}
              id={`nav-${p}`}
              className={`nav-btn ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </nav>
        <button id="btn-add-monitor" className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Monitor
        </button>
      </header>

      <main className="main">
        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p>Loading PulseAPI...</p>
          </div>
        ) : (
          <>
            {page === 'dashboard' && <Dashboard stats={stats} monitors={monitors} />}
            {page === 'monitors' && (
              <div>
                <div className="page-header">
                  <h1>API Monitors</h1>
                  <p>{monitors.length} monitor{monitors.length !== 1 ? 's' : ''} configured</p>
                </div>
                {monitors.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📡</div>
                    <h3>No monitors yet</h3>
                    <p>Add your first API endpoint to start monitoring</p>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Monitor</button>
                  </div>
                ) : (
                  <div className="monitors-grid">
                    {monitors.map(m => (
                      <MonitorCard key={m.id} monitor={m} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </div>
            )}
            {page === 'alerts' && <AlertLog alerts={alerts} />}
          </>
        )}
      </main>

      {showModal && (
        <AddMonitorModal onAdd={handleAddMonitor} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
