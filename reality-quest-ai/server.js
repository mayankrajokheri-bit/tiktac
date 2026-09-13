const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webm': 'video/webm'
};

const server = http.createServer((req, res) => {
  let reqUrl = decodeURI(req.url.split('?')[0]);
  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, reqUrl);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + reqUrl);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(`🚀 REALITY QUEST AI - ALL 7 LEVELS RUNNING!`);
  console.log(`👉 Level 1 Gate:          http://localhost:${PORT}/gate.html`);
  console.log(`👉 Level 2 Arena:         http://localhost:${PORT}/level2.html`);
  console.log(`👉 Level 3 Corridor:      http://localhost:${PORT}/level3.html`);
  console.log(`👉 Level 4 Six Boxes:     http://localhost:${PORT}/level4.html`);
  console.log(`👉 Level 5 Judgement:     http://localhost:${PORT}/level5.html`);
  console.log(`👉 Level 6 The Traitor:   http://localhost:${PORT}/level6.html`);
  console.log(`👉 Level 7 Final Battle:  http://localhost:${PORT}/level7.html`);
  console.log(`===========================================\n`);
});
