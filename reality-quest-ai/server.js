const http = require('http');
const fs = require('fs');
const path = require('path');

const PRIMARY_PORT = parseInt(process.env.PORT, 10) || 8080;
const SECONDARY_PORT = 3000;

const REALITY_QUEST_DIR = __dirname;
const ROOT_WORKSPACE_DIR = path.resolve(__dirname, '..');

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
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm'
};

function getHubHtml(currentPort) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arcade Game Hub — Local Dev Server</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: radial-gradient(circle at 50% 20%, #151828 0%, #08090e 100%);
      color: #f1f5f9;
      font-family: 'Rajdhani', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      background: rgba(0, 255, 200, 0.12);
      border: 1px solid rgba(0, 255, 200, 0.4);
      color: #00ffc8;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      font-family: 'Orbitron', sans-serif;
      font-size: 2.8rem;
      font-weight: 900;
      letter-spacing: 1px;
      background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    p.sub {
      color: #94a3b8;
      font-size: 1.15rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      max-width: 1100px;
      width: 100%;
    }
    .card {
      background: rgba(18, 22, 36, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(12px);
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
      opacity: 0.7;
    }
    .card-horror::before { background: linear-gradient(90deg, #ff2a2a, #f59e0b); }
    .card-tictactoe::before { background: linear-gradient(90deg, #00f0ff, #a855f7); }
    .card-subway::before { background: linear-gradient(90deg, #10b981, #3b82f6); }
    .card:hover {
      transform: translateY(-6px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
    }
    .card-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.4rem;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .card-desc {
      color: #94a3b8;
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 20px;
      flex-grow: 1;
    }
    .quick-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 22px;
    }
    .pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.2s;
    }
    .pill:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-horror { background: #ff2a2a; color: #fff; box-shadow: 0 0 20px rgba(255, 42, 42, 0.4); }
    .btn-horror:hover { background: #e02424; box-shadow: 0 0 30px rgba(255, 42, 42, 0.6); }
    .btn-tictactoe { background: #00f0ff; color: #050b14; box-shadow: 0 0 20px rgba(0, 240, 255, 0.4); }
    .btn-tictactoe:hover { background: #00d4e0; box-shadow: 0 0 30px rgba(0, 240, 255, 0.6); }
    .btn-subway { background: #10b981; color: #022013; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
    .btn-subway:hover { background: #0d9668; box-shadow: 0 0 30px rgba(16, 185, 129, 0.6); }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">Local Game Server Active</div>
    <h1>LOCAL ARCADE HUB</h1>
    <p class="sub">Select a game below to launch directly in your browser</p>
  </div>

  <div class="grid">
    <!-- Apocalypse: Reality Quest AI -->
    <div class="card card-horror">
      <h2 class="card-title">💀 The Apocalypse</h2>
      <p class="card-desc">7-Level survival horror mystery set in GMN College Ambala Cantt. Features ancient cursed grimoire, dark radar world map, survivor lore, and 7 deadly trials.</p>
      <div class="quick-links">
        <a class="pill" href="/splash.html">Splash Intro</a>
        <a class="pill" href="/ghost.html">Ghost Gate</a>
        <a class="pill" href="/gate.html">L1: Gate</a>
        <a class="pill" href="/level2.html">L2: Arena</a>
        <a class="pill" href="/level3.html">L3: Corridor</a>
        <a class="pill" href="/level4.html">L4: Six Boxes</a>
        <a class="pill" href="/level5.html">L5: Judgement</a>
        <a class="pill" href="/level6.html">L6: Traitor</a>
        <a class="pill" href="/level7.html">L7: Treasure</a>
      </div>
      <a class="btn btn-horror" href="/index.html">Launch Prologue & Map ➔</a>
    </div>

    <!-- Tic Tac Toe -->
    <div class="card card-tictactoe">
      <h2 class="card-title">⚡ Neon Tic-Tac-Toe</h2>
      <p class="card-desc">Modern cyber edition with PvP & Unbeatable Minimax AI, dynamic sound effects, particle glow, and custom ranking progression.</p>
      <div class="quick-links">
        <a class="pill" href="/tictactoe/">Main Board</a>
        <a class="pill" href="/tictactoe/">AI Mode</a>
        <a class="pill" href="/tictactoe/">2-Player PvP</a>
      </div>
      <a class="btn btn-tictactoe" href="/tictactoe/">Play Tic Tac Toe ➔</a>
    </div>

    <!-- Subway Surfers -->
    <div class="card card-subway">
      <h2 class="card-title">🛹 Subway Surfers 3D</h2>
      <p class="card-desc">3D endless cyberpunk runner built with Three.js. Dodge trains, slide under hurdles, jump over barriers, and collect coins & powerups.</p>
      <div class="quick-links">
        <a class="pill" href="/subway-surfers/">Run Arcade</a>
      </div>
      <a class="btn btn-subway" href="/subway-surfers/">Play Subway Surfers ➔</a>
    </div>
  </div>
</body>
</html>`;
}

function createRequestHandler(isSecondaryPort) {
  return function requestHandler(req, res) {
    let rawPath = decodeURI(req.url.split('?')[0]);

    // Handle redirects for root folders lacking trailing slashes
    if (rawPath === '/tictactoe' || rawPath === '/tic-tac-toe') {
      res.writeHead(301, { Location: '/tictactoe/' });
      res.end();
      return;
    }
    if (rawPath === '/subway-surfers') {
      res.writeHead(301, { Location: '/subway-surfers/' });
      res.end();
      return;
    }
    if (rawPath === '/reality-quest-ai' || rawPath === '/the-apocalypse') {
      res.writeHead(301, { Location: '/reality-quest-ai/' });
      res.end();
      return;
    }

    // Interactive Launcher Hub
    if (rawPath === '/hub' || rawPath === '/games' || rawPath === '/menu' || rawPath === '/launcher') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getHubHtml());
      return;
    }

    let filePath;

    if (rawPath.startsWith('/tictactoe/')) {
      const subPath = rawPath.replace('/tictactoe/', '') || 'index.html';
      filePath = path.join(ROOT_WORKSPACE_DIR, subPath);
    } else if (rawPath.startsWith('/subway-surfers/')) {
      const subPath = rawPath.replace('/subway-surfers/', '') || 'index.html';
      filePath = path.join(ROOT_WORKSPACE_DIR, 'subway-surfers', subPath);
    } else if (rawPath.startsWith('/reality-quest-ai/')) {
      const subPath = rawPath.replace('/reality-quest-ai/', '') || 'index.html';
      filePath = path.join(REALITY_QUEST_DIR, subPath);
    } else {
      // Root behavior:
      // If port 3000 (secondary) and accessing '/', serve Tic Tac Toe
      // If port 8080 (primary) and accessing '/', serve Reality Quest AI
      if (isSecondaryPort && (rawPath === '/' || rawPath === '')) {
        filePath = path.join(ROOT_WORKSPACE_DIR, 'index.html');
      } else {
        let reqUrl = (rawPath === '/' || rawPath === '') ? '/index.html' : rawPath;
        filePath = path.join(REALITY_QUEST_DIR, reqUrl);
      }
    }

    // Fallback for horror_gmn.png if missing
    if (path.basename(filePath).toLowerCase() === 'horror_gmn.png' && !fs.existsSync(filePath)) {
      const fallback = path.join(REALITY_QUEST_DIR, 'gmnclg.png');
      if (fs.existsSync(fallback)) filePath = fallback;
    }

    // Security: prevent directory traversal outside ROOT_WORKSPACE_DIR
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(ROOT_WORKSPACE_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(resolved, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found: ' + rawPath);
        return;
      }

      let targetPath = resolved;
      if (stats.isDirectory()) {
        targetPath = path.join(resolved, 'index.html');
        if (!fs.existsSync(targetPath)) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found: ' + rawPath);
          return;
        }
      }

      const ext = path.extname(targetPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });

      const stream = fs.createReadStream(targetPath);
      stream.pipe(res);
    });
  };
}

// Start Primary Server (Default 8080)
const primaryServer = http.createServer(createRequestHandler(false));
primaryServer.listen(PRIMARY_PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🎮 LOCAL GAME SERVER RUNNING ON PORT ${PRIMARY_PORT}!`);
  console.log(`=============================================================`);
  console.log(`🕹️ ARCADE HUB (All Games): http://localhost:${PRIMARY_PORT}/games`);
  console.log(`\n🔥 THE APOCALYPSE: REALITY QUEST AI:`);
  console.log(`👉 Main Game (Prologue & Map): http://localhost:${PRIMARY_PORT}/`);
  console.log(`👉 Splash Screen Intro:        http://localhost:${PRIMARY_PORT}/splash.html`);
  console.log(`👉 Ghost Gate (Level 1 Prep):  http://localhost:${PRIMARY_PORT}/ghost.html`);
  console.log(`👉 Level 1 Gate:               http://localhost:${PRIMARY_PORT}/gate.html`);
  console.log(`👉 Level 2 Arena:              http://localhost:${PRIMARY_PORT}/level2.html`);
  console.log(`👉 Level 3 Corridor:           http://localhost:${PRIMARY_PORT}/level3.html`);
  console.log(`👉 Level 4 Six Boxes:          http://localhost:${PRIMARY_PORT}/level4.html`);
  console.log(`👉 Level 5 Judgement:          http://localhost:${PRIMARY_PORT}/level5.html`);
  console.log(`👉 Level 6 The Traitor:        http://localhost:${PRIMARY_PORT}/level6.html`);
  console.log(`👉 Level 7 Final Battle:       http://localhost:${PRIMARY_PORT}/level7.html`);
  console.log(`\n⚡ OTHER WORKSPACE GAMES:`);
  console.log(`👉 Tic-Tac-Toe (Neon Edition): http://localhost:${PRIMARY_PORT}/tictactoe/`);
  console.log(`👉 Subway Surfers 3D:          http://localhost:${PRIMARY_PORT}/subway-surfers/`);
  console.log(`=============================================================\n`);
});

primaryServer.on('error', (err) => {
  console.error(`Error starting primary server on port ${PRIMARY_PORT}:`, err.message);
});

// Start Secondary Server (Port 3000) for standard web port convenience
if (PRIMARY_PORT !== SECONDARY_PORT) {
  const secondaryServer = http.createServer(createRequestHandler(true));
  secondaryServer.listen(SECONDARY_PORT, () => {
    console.log(`⚡ Secondary Server active on http://localhost:${SECONDARY_PORT}/ (Default: Tic Tac Toe)`);
  });
  secondaryServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // Port 3000 in use by another app, gracefully ignore
    } else {
      console.warn(`Secondary server warning:`, err.message);
    }
  });
}
