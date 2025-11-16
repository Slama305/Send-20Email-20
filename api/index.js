const express = require('express');
const cors = require('cors');
const { handleDemo } = require('../server/routes/demo.ts');
const { handleSendEmail } = require('../server/routes/send-email.ts');
const { handleBulkSendEmail } = require('../server/routes/bulk-send-email.ts');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/ping', (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? 'ping';
  res.json({ message: ping });
});

app.get('/api/demo', handleDemo);
app.post('/api/send-email', handleSendEmail);
app.post('/api/bulk-send-email', handleBulkSendEmail);

module.exports = app;
