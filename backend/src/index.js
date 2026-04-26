const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const monitorsRouter = require('./monitors');
const alertsRouter = require('./alerts');

app.use('/api/monitors', monitorsRouter);
app.use('/api/alerts', alertsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });
});

if (process.env.NODE_ENV !== 'test') {
  const { startChecker } = require('./checker');
  startChecker();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PulseAPI Backend running on port ${PORT}`);
  });
}

module.exports = app;
