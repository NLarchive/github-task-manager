/**
 * server.js — Local bridge server
 * ─────────────────────────────────
 * Run once:  node server.js
 * That's it. Browser opens automatically.
 *
 * Zero npm dependencies — uses only Node.js built-ins (>=18).
 */

import http  from 'http';
import path  from 'path';
import fs    from 'fs/promises';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

import { createBridgeRouter }            from './server/bridge-router.js';
import { writeJSON, writeAtomic, readJSON } from './server/file-editor.js';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const PORT       = 7700;
const TASKS_FILE = path.resolve(__dirname, 'node.tasks.json');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

// ─── Configure the bridge router ─────────────────────────────────────────────

const bridge = createBridgeRouter({
  tasksFile: TASKS_FILE,

  // Whitelist: add your GitHub Pages URL here
  allowedOrigins: [
    'http://localhost:7700',
    'http://127.0.0.1:7700',
    'http://localhost:3000',
    'http://127.0.0.1:5500',  // VS Code Live Server
    // 'https://yourname.github.io', ← uncomment and set your GitHub Pages URL
  ],

  backup: false, // set true to keep .bak files on every write

  // onAfterSave: called every time tasks are written to disk
  // Use this to regenerate CSV exports, state files, etc.
  onAfterSave: async (tasks) => {
    // Example: write a CSV export alongside the JSON
    // const csv = tasksToCSV(tasks);
    // await writeAtomic(path.resolve(__dirname, 'exports/tasks.csv'), csv);

    // Example: write a state summary
    // await writeJSON(path.resolve(__dirname, 'state/meta.json'), {
    //   count: tasks.length,
    //   updatedAt: new Date().toISOString(),
    // });
  },
});

// ─── Static file MIME types ───────────────────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
};

// ─── HTTP Server ──────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // Let the bridge handle all /api/* routes
  if (await bridge.handle(req, res)) return;

  // Static file serving for everything else
  try {
    const url      = new URL(req.url, `http://localhost:${PORT}`);
    const reqPath  = url.pathname === '/' ? '/index.html' : url.pathname;
    const filePath = path.join(PUBLIC_DIR, reqPath);

    // Security: block path traversal outside public/
    if (!filePath.startsWith(PUBLIC_DIR + path.sep) &&
         filePath !== PUBLIC_DIR) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const content = await fs.readFile(filePath);
    const ext     = path.extname(filePath);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.writeHead(200);
    res.end(content);

  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404);
      res.end('Not found');
    } else {
      console.error('[server] Static error:', err.message);
      res.writeHead(500);
      res.end('Server error');
    }
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n✅  Task bridge running`);
  console.log(`    UI:    ${url}`);
  console.log(`    File:  ${TASKS_FILE}`);
  console.log(`    Press Ctrl+C to stop\n`);
  openBrowser(url);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  Port ${PORT} is already in use.`);
    console.error(`    Stop the other process or change PORT in server.js\n`);
  } else {
    console.error('[server] Error:', err.message);
  }
  process.exit(1);
});

function openBrowser(url) {
  const cmd = process.platform === 'win32'  ? `start ${url}`
            : process.platform === 'darwin' ? `open ${url}`
            : `xdg-open ${url}`;
  exec(cmd, (err) => {
    if (err) console.warn('[server] Could not auto-open browser:', err.message);
  });
}
