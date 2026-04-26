const axios = require('axios');
const cron = require('node-cron');
const db = require('./db');

let checkerJob = null;

async function performCheck(monitor) {
  const startTime = Date.now();
  let status = 'down';
  let statusCode = null;
  let responseTime = null;
  let errorMessage = null;

  try {
    const response = await axios.get(monitor.url, {
      timeout: (monitor.timeout_seconds || 10) * 1000,
      validateStatus: (s) => s < 600
    });
    responseTime = Date.now() - startTime;
    statusCode = response.status;
    status = response.status < 400 ? 'up' : 'down';
  } catch (err) {
    responseTime = Date.now() - startTime;
    errorMessage = err.code === 'ECONNABORTED' ? 'Connection timeout' : err.message;
    status = 'down';
  }

  db.prepare(
    'INSERT INTO checks (monitor_id, status, response_time, status_code, error_message) VALUES (?, ?, ?, ?, ?)'
  ).run(monitor.id, status, responseTime, statusCode, errorMessage);

  const recentChecks = db.prepare(
    'SELECT status FROM checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT 100'
  ).all(monitor.id);

  const upCount = recentChecks.filter(c => c.status === 'up').length;
  const uptimePercent = recentChecks.length > 0 ? (upCount / recentChecks.length) * 100 : 0;

  const avgResult = db.prepare(
    "SELECT AVG(response_time) as avg FROM checks WHERE monitor_id = ? AND status = 'up' ORDER BY checked_at DESC LIMIT 100"
  ).get(monitor.id);

  db.prepare(
    "UPDATE monitors SET status = ?, uptime_percent = ?, avg_response_time = ?, last_checked = datetime('now') WHERE id = ?"
  ).run(status, uptimePercent, avgResult?.avg || 0, monitor.id);

  handleAlerts(monitor, status);

  return { status, responseTime, statusCode, errorMessage };
}

function handleAlerts(monitor, newStatus) {
  const prevStatus = monitor.status;

  if (newStatus === 'down' && prevStatus !== 'down') {
    const existing = db.prepare(
      'SELECT id FROM alerts WHERE monitor_id = ? AND resolved = 0'
    ).get(monitor.id);
    if (!existing) {
      db.prepare(
        'INSERT INTO alerts (monitor_id, type, message) VALUES (?, ?, ?)'
      ).run(monitor.id, 'down', `${monitor.name} is DOWN — ${monitor.url}`);
    }
  }

  if (newStatus === 'up' && prevStatus === 'down') {
    db.prepare(
      "UPDATE alerts SET resolved = 1, resolved_at = datetime('now') WHERE monitor_id = ? AND resolved = 0"
    ).run(monitor.id);
  }
}

function startChecker() {
  console.log('Starting PulseAPI health checker...');
  checkerJob = cron.schedule('* * * * *', async () => {
    const monitors = db.prepare('SELECT * FROM monitors').all();
    for (const monitor of monitors) {
      const lastChecked = monitor.last_checked ? new Date(monitor.last_checked) : null;
      const intervalMs = (monitor.interval_seconds || 60) * 1000;
      if (!lastChecked || (Date.now() - lastChecked.getTime()) >= intervalMs) {
        performCheck(monitor).catch(console.error);
      }
    }
  });
}

function stopChecker() {
  if (checkerJob) {
    checkerJob.stop();
    checkerJob = null;
  }
}

module.exports = { startChecker, stopChecker, performCheck, handleAlerts };
