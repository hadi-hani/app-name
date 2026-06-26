const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>App Name</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px">
        <h1>🚀 App is running!</h1>
        <p>Deployed automatically via GitHub Actions + GHCR + Watchtower</p>
        <p><small>Version: ${process.env.npm_package_version || '1.0.0'}</small></p>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
