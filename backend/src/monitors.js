const express = require('express');
const router = express.Router();
const db = require('./db');

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// GET all monitors
router.get('/', (req, res) => {
  try {
    const monitors = db.prepare('SELECT * FROM monitors ORDER BY created_at DESC').all();
    res.json(monitors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// GET single monitor
router.get('/:id', (req, res) => {
  try {
    const monitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    res.json(monitor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monitor' });
  }
});

// GET monitor check history
router.get('/:id/history', (req, res) => {
  try {
    const monitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    const checks = db.prepare(
      'SELECT * FROM checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT 50'
    ).all(req.params.id);
    res.json(checks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST create monitor
router.post('/', (req, res) => {
  const { name, url, interval_seconds = 60, timeout_seconds = 10 } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'URL is required' });
  }
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format. Must start with http:// or https://' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO monitors (name, url, interval_seconds, timeout_seconds) VALUES (?, ?, ?, ?)'
    ).run(name.trim(), url.trim(), interval_seconds, timeout_seconds);
    const monitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(monitor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

// PUT update monitor
router.put('/:id', (req, res) => {
  const { name, url, interval_seconds, timeout_seconds } = req.body;
  try {
    const monitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    if (url && !isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    db.prepare(
      'UPDATE monitors SET name = ?, url = ?, interval_seconds = ?, timeout_seconds = ? WHERE id = ?'
    ).run(
      name || monitor.name,
      url || monitor.url,
      interval_seconds || monitor.interval_seconds,
      timeout_seconds || monitor.timeout_seconds,
      req.params.id
    );
    const updated = db.prepare('SELECT * FROM monitors WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update monitor' });
  }
});

// DELETE monitor
router.delete('/:id', (req, res) => {
  try {
    const monitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    db.prepare('DELETE FROM monitors WHERE id = ?').run(req.params.id);
    res.json({ message: 'Monitor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete monitor' });
  }
});

module.exports = router;
