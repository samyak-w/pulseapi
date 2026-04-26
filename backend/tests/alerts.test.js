process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../src/index');
const db = require('../src/db');

beforeEach(() => {
  db.exec('DELETE FROM checks');
  db.exec('DELETE FROM alerts');
  db.exec('DELETE FROM monitors');
});

afterAll(() => {
  db.close();
});

function createMonitor(name = 'Test API', url = 'https://example.com', status = 'unknown') {
  const result = db.prepare(
    'INSERT INTO monitors (name, url, status) VALUES (?, ?, ?)'
  ).run(name, url, status);
  return db.prepare('SELECT * FROM monitors WHERE id = ?').get(result.lastInsertRowid);
}

function createAlert(monitorId, type = 'down', resolved = 0) {
  const result = db.prepare(
    'INSERT INTO alerts (monitor_id, type, message, resolved) VALUES (?, ?, ?, ?)'
  ).run(monitorId, type, `Monitor ${monitorId} is ${type}`, resolved);
  return db.prepare('SELECT * FROM alerts WHERE id = ?').get(result.lastInsertRowid);
}

describe('Alerts API', () => {

  describe('GET /api/alerts', () => {
    it('should return empty array when no alerts exist', async () => {
      const res = await request(app).get('/api/alerts');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all alerts with monitor info', async () => {
      const monitor = createMonitor();
      createAlert(monitor.id);
      const res = await request(app).get('/api/alerts');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].monitor_name).toBe('Test API');
      expect(res.body[0].type).toBe('down');
    });

    it('should return both resolved and unresolved alerts', async () => {
      const monitor = createMonitor();
      createAlert(monitor.id, 'down', 0);
      createAlert(monitor.id, 'down', 1);
      const res = await request(app).get('/api/alerts');
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /api/alerts/active', () => {
    it('should return only unresolved alerts', async () => {
      const monitor = createMonitor();
      createAlert(monitor.id, 'down', 0);
      createAlert(monitor.id, 'down', 1);
      const res = await request(app).get('/api/alerts/active');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].resolved).toBe(0);
    });

    it('should return empty when all alerts resolved', async () => {
      const monitor = createMonitor();
      createAlert(monitor.id, 'down', 1);
      const res = await request(app).get('/api/alerts/active');
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /api/alerts/stats', () => {
    it('should return correct stats with no monitors', async () => {
      const res = await request(app).get('/api/alerts/stats');
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.up).toBe(0);
      expect(res.body.down).toBe(0);
      expect(res.body.activeAlerts).toBe(0);
    });

    it('should return correct stats with monitors', async () => {
      createMonitor('API 1', 'https://one.com', 'up');
      createMonitor('API 2', 'https://two.com', 'down');
      const monitor = createMonitor('API 3', 'https://three.com', 'down');
      createAlert(monitor.id, 'down', 0);

      const res = await request(app).get('/api/alerts/stats');
      expect(res.body.total).toBe(3);
      expect(res.body.up).toBe(1);
      expect(res.body.down).toBe(2);
      expect(res.body.activeAlerts).toBe(1);
    });
  });
});
