const express = require('express');
const router = express.Router();
const db = require('./db');

// GET all alerts with monitor info
router.get('/', (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT a.*, m.name as monitor_name, m.url as monitor_url
      FROM alerts a
      LEFT JOIN monitors m ON a.monitor_id = m.id
      ORDER BY a.created_at DESC LIMIT 100
    `).all();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// GET active (unresolved) alerts
router.get('/active', (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT a.*, m.name as monitor_name, m.url as monitor_url
      FROM alerts a
      LEFT JOIN monitors m ON a.monitor_id = m.id
      WHERE a.resolved = 0
      ORDER BY a.created_at DESC
    `).all();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active alerts' });
  }
});

// GET dashboard stats
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM monitors').get();
    const up = db.prepare('SELECT COUNT(*) as count FROM monitors WHERE status = "up"').get();
    const down = db.prepare('SELECT COUNT(*) as count FROM monitors WHERE status = "down"').get();
    const activeAlerts = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE resolved = 0').get();
    const avgUptime = db.prepare('SELECT AVG(uptime_percent) as avg FROM monitors').get();

    res.json({
      total: total.count,
      up: up.count,
      down: down.count,
      activeAlerts: activeAlerts.count,
      avgUptime: Math.round(avgUptime.avg || 0)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
