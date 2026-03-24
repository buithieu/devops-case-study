const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'local';
const APP_VERSION = process.env.APP_VERSION || 'v1';

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hello DevOps Case Study',
    env: APP_ENV,
    version: APP_VERSION
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

module.exports = app;
