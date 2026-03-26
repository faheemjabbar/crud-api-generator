require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /api/templates — save a template server-side (for shareable links, Phase 2)
// app.post('/api/templates', ...)
// GET  /api/templates/:id — load by short ID
// app.get('/api/templates/:id', ...)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
