const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html' || ext === '.php') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

function safeJoin(root, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const cleaned = decoded.replace(/^\/+/, '');
  const resolved = path.resolve(root, cleaned);
  if (!resolved.startsWith(path.resolve(root))) return null;
  return resolved;
}

const repoRoot = path.resolve(__dirname, '..', '..');
const graphRoot = path.join(repoRoot, 'graph-display');
const publicRoot = path.join(repoRoot, 'public');
const port = Number(process.env.PW_PORT || process.env.PORT || 3201);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = url.pathname;

    // Serve index by default
    if (pathname === '/' || pathname === '') pathname = '/index.html';

    // Back-compat: older tests/links referenced index.php
    if (pathname === '/index.php') pathname = '/index.html';

    // Allow loading TaskDB JSON from repo /public
    const isPublic = pathname.startsWith('/public/');
    const root = isPublic ? publicRoot : graphRoot;

    const filePath = safeJoin(root, pathname);
    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Bad request');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }

    const body = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentTypeFor(filePath),
      'Cache-Control': 'no-store'
    });
    return res.end(body);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(String(err && err.message ? err.message : err));
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`graph-display test server listening on http://localhost:${port}/`);
});
