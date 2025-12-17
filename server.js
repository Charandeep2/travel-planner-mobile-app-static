const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Handle all routes by serving index.html (for SPA)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Travel Planner app is running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the server`);
});