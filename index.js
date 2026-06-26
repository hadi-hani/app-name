const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>App Name</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;background:#f0f4ff">
        <h1>✅😀😀😀 Auto-Deploy is Working!</h1>
        <p>هذا التحديث تم تلقائياً عبر Perplexity → GitHub → GHCR → Watchtower</p>
        <p style="color:green"><b>Pipeline يعمل بشكل مثالي 🎉</b></p>
        <p><small>Updated: ${new Date().toLocaleString('ar-DZ')}</small></p>
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
