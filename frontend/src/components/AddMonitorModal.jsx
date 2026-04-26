import { useState } from 'react'

export default function AddMonitorModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', url: '', interval_seconds: 60, timeout_seconds: 10 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Name is required')
    if (!form.url.trim()) return setError('URL is required')
    try { new URL(form.url) } catch { return setError('Enter a valid URL (e.g. https://example.com)') }
    setLoading(true)
    try {
      await onAdd({ ...form, interval_seconds: Number(form.interval_seconds), timeout_seconds: Number(form.timeout_seconds) })
    } catch {
      setError('Failed to add monitor. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add New Monitor</span>
          <button className="modal-close" id="btn-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Monitor Name *</label>
            <input
              id="input-monitor-name"
              className="form-input"
              placeholder="e.g. GitHub API"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">URL to Monitor *</label>
            <input
              id="input-monitor-url"
              className="form-input"
              placeholder="https://api.example.com/health"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Check Interval (seconds)</label>
              <input
                id="input-monitor-interval"
                className="form-input"
                type="number" min="10" max="3600"
                value={form.interval_seconds}
                onChange={e => setForm(f => ({ ...f, interval_seconds: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Timeout (seconds)</label>
              <input
                id="input-monitor-timeout"
                className="form-input"
                type="number" min="1" max="60"
                value={form.timeout_seconds}
                onChange={e => setForm(f => ({ ...f, timeout_seconds: e.target.value }))}
              />
            </div>
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginBottom: 12 }}>{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button id="btn-submit-monitor" type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
