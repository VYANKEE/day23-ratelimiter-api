// backend/server.js
const express = require('express');
const cors = require('cors');
const rateLimiter = require('./ratelimiter');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // Frontend connection allow karo
app.use(express.json());

// API Route par Rate Limiter lagao
app.use('/api', rateLimiter);

// Test Endpoint
app.get('/api/data', (req, res) => {
  res.json({
    id: Date.now(),
    message: "Success! Access Granted to Protected Data.",
    status: "OK"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});