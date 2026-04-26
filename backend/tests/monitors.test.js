const request = require('supertest');
process.env.NODE_ENV = 'test';
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

describe('Monitor API', () => {

  describe('GET /api/monitors', () => {
    it('should return empty array when no monitors exist', async () => {
      const res = await request(app).get('/api/monitors');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all created monitors', async () => {
      await request(app).post('/api/monitors').send({ name: 'Google', url: 'https://google.com' });
      const res = await request(app).get('/api/monitors');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Google');
    });
  });

  describe('POST /api/monitors', () => {
    it('should create a monitor with valid data', async () => {
      const res = await request(app).post('/api/monitors').send({
        name: 'GitHub',
        url: 'https://github.com',
        interval_seconds: 30
      });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('GitHub');
      expect(res.body.url).toBe('https://github.com');
      expect(res.body.id).toBeDefined();
    });

    it('should reject monitor with missing URL', async () => {
      const res = await request(app).post('/api/monitors').send({ name: 'No URL' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/URL/);
    });

    it('should reject monitor with missing name', async () => {
      const res = await request(app).post('/api/monitors').send({ url: 'https://example.com' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Name/);
    });

    it('should reject monitor with invalid URL format', async () => {
      const res = await request(app).post('/api/monitors').send({
        name: 'Bad URL',
        url: 'not-a-url'
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid URL/);
    });

    it('should reject URL without http/https protocol', async () => {
      const res = await request(app).post('/api/monitors').send({
        name: 'FTP URL',
        url: 'ftp://example.com'
      });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/monitors/:id', () => {
    it('should delete an existing monitor', async () => {
      const createRes = await request(app).post('/api/monitors').send({
        name: 'To Delete',
        url: 'https://example.com'
      });
      const deleteRes = await request(app).delete(`/api/monitors/${createRes.body.id}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toMatch(/deleted/);

      const listRes = await request(app).get('/api/monitors');
      expect(listRes.body.length).toBe(0);
    });

    it('should return 404 for non-existent monitor', async () => {
      const res = await request(app).delete('/api/monitors/9999');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/monitors/:id', () => {
    it('should update monitor interval', async () => {
      const createRes = await request(app).post('/api/monitors').send({
        name: 'Test',
        url: 'https://example.com',
        interval_seconds: 60
      });
      const updateRes = await request(app)
        .put(`/api/monitors/${createRes.body.id}`)
        .send({ interval_seconds: 30 });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.interval_seconds).toBe(30);
    });

    it('should return 404 updating non-existent monitor', async () => {
      const res = await request(app).put('/api/monitors/9999').send({ name: 'Ghost' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/health', () => {
    it('should return OK status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
