process.env.NODE_ENV = 'test';
const { performCheck, handleAlerts } = require('../src/checker');
const db = require('../src/db');
const axios = require('axios');

jest.mock('axios');

beforeEach(() => {
  db.exec('DELETE FROM checks');
  db.exec('DELETE FROM alerts');
  db.exec('DELETE FROM monitors');
});

afterAll(() => {
  db.close();
});

function createMonitor(overrides = {}) {
  const result = db.prepare(
    'INSERT INTO monitors (name, url, interval_seconds, timeout_seconds, status) VALUES (?, ?, ?, ?, ?)'
  ).run(
    overrides.name || 'Test API',
    overrides.url || 'https://example.com',
    overrides.interval_seconds || 60,
    overrides.timeout_seconds || 10,
    overrides.status || 'unknown'
  );
  return db.prepare('SELECT * FROM monitors WHERE id = ?').get(result.lastInsertRowid);
}

describe('Health Checker', () => {

  describe('performCheck', () => {
    it('should mark monitor as UP when API returns 200', async () => {
      axios.get.mockResolvedValue({ status: 200 });
      const monitor = createMonitor();
      const result = await performCheck(monitor);
      expect(result.status).toBe('up');
      expect(result.statusCode).toBe(200);
      const updated = db.prepare('SELECT status FROM monitors WHERE id = ?').get(monitor.id);
      expect(updated.status).toBe('up');
    });

    it('should mark monitor as DOWN when API returns 500', async () => {
      axios.get.mockResolvedValue({ status: 500 });
      const monitor = createMonitor();
      const result = await performCheck(monitor);
      expect(result.status).toBe('down');
      expect(result.statusCode).toBe(500);
    });

    it('should mark monitor as DOWN on connection timeout', async () => {
      const err = new Error('timeout exceeded');
      err.code = 'ECONNABORTED';
      axios.get.mockRejectedValue(err);
      const monitor = createMonitor();
      const result = await performCheck(monitor);
      expect(result.status).toBe('down');
      expect(result.errorMessage).toBe('Connection timeout');
    });

    it('should mark monitor as DOWN on network error', async () => {
      axios.get.mockRejectedValue(new Error('Network Error'));
      const monitor = createMonitor();
      const result = await performCheck(monitor);
      expect(result.status).toBe('down');
      expect(result.errorMessage).toBe('Network Error');
    });

    it('should record response time on successful check', async () => {
      axios.get.mockResolvedValue({ status: 200 });
      const monitor = createMonitor();
      const result = await performCheck(monitor);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      const check = db.prepare(
        'SELECT * FROM checks WHERE monitor_id = ? LIMIT 1'
      ).get(monitor.id);
      expect(check.response_time).toBeDefined();
    });

    it('should calculate uptime percentage correctly', async () => {
      axios.get.mockResolvedValue({ status: 200 });
      const monitor = createMonitor();
      await performCheck(monitor);
      await performCheck(monitor);
      await performCheck(monitor);
      const updated = db.prepare('SELECT uptime_percent FROM monitors WHERE id = ?').get(monitor.id);
      expect(updated.uptime_percent).toBe(100);
    });

    it('should store check record in database', async () => {
      axios.get.mockResolvedValue({ status: 200 });
      const monitor = createMonitor();
      await performCheck(monitor);
      const checks = db.prepare('SELECT * FROM checks WHERE monitor_id = ?').all(monitor.id);
      expect(checks.length).toBe(1);
      expect(checks[0].status).toBe('up');
    });
  });

  describe('handleAlerts', () => {
    it('should create alert when monitor goes DOWN', () => {
      const monitor = createMonitor({ status: 'up' });
      handleAlerts(monitor, 'down');
      const alerts = db.prepare('SELECT * FROM alerts WHERE monitor_id = ?').all(monitor.id);
      expect(alerts.length).toBe(1);
      expect(alerts[0].type).toBe('down');
      expect(alerts[0].resolved).toBe(0);
    });

    it('should NOT create duplicate alert for same outage', () => {
      const monitor = createMonitor({ status: 'up' });
      handleAlerts(monitor, 'down');
      handleAlerts(monitor, 'down');
      const alerts = db.prepare('SELECT * FROM alerts WHERE monitor_id = ?').all(monitor.id);
      expect(alerts.length).toBe(1);
    });

    it('should resolve alert when monitor recovers', () => {
      const monitor = createMonitor({ status: 'up' });
      handleAlerts(monitor, 'down');
      const downMonitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(monitor.id);
      db.prepare('UPDATE monitors SET status = ? WHERE id = ?').run('down', monitor.id);
      const updatedMonitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(monitor.id);
      handleAlerts(updatedMonitor, 'up');
      const alerts = db.prepare('SELECT * FROM alerts WHERE monitor_id = ?').all(monitor.id);
      expect(alerts[0].resolved).toBe(1);
      expect(alerts[0].resolved_at).not.toBeNull();
    });
  });
});
