/**
 * bridge-router.js — HTTP request router for the local bridge server
 * Drop this into your existing server.js createServer() handler.
 *
 * Routes handled:
 *   HEAD   /api/tasks          — lightweight ETag check (no body)
 *   GET    /api/tasks          — load tasks (304 if ETag matches)
 *   POST   /api/tasks          — replace all tasks + write related files
 *   PUT    /api/tasks/:id      — update a single task
 *   DELETE /api/tasks/:id      — remove a single task
 *   GET    /api/status         — health check (is bridge alive?)
 *
 * Usage in your server.js:
 *
 *   import { createBridgeRouter } from './server/bridge-router.js';
 *
 *   const bridge = createBridgeRouter({
 *     tasksFile:  path.resolve('./node.tasks.json'),
 *     allowedOrigins: ['https://yourname.github.io', 'http://localhost:3000'],
 *     // optional — extra files to write on every save:
 *     onAfterSave: async (tasks) => {
 *       await writeJSON('./exports/tasks-backup.json', tasks);
 *       await writeAtomic('./exports/tasks.csv', tasksToCSV(tasks));
 *     }
 *   });
 *
 *   const server = http.createServer(async (req, res) => {
 *     if (await bridge.handle(req, res)) return; // bridge handled it
 *     // ... your existing static file serving below
 *   });
 */

import { readJSON, writeJSON, writeBatch, getETag, etagMatches, safePath } from './file-editor.js';
import path from 'path';
import os   from 'os';

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createBridgeRouter(config = {}) {
  const {
    tasksFile,
    allowedOrigins = [],
    onAfterSave    = null,   // async (tasks) => void — hook for CSV, state, etc.
    backup         = false,  // set true to keep .bak files on every write
  } = config;

  if (!tasksFile) throw new Error('bridge-router: tasksFile is required');

  // ─── CORS ────────────────────────────────────────────────────────────────

  function setCORS(req, res) {
    const origin = req.headers.origin;

    // Strict whitelist — never echo arbitrary origins
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.length === 0) {
      // Dev-only fallback when no origins configured
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    // If origin not in whitelist — no CORS header = browser blocks the request

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match');
    res.setHeader('Access-Control-Expose-Headers', 'ETag');
    res.setHeader('Vary', 'Origin');
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function sendJSON(res, status, data, extraHeaders = {}) {
    const body = JSON.stringify(data);
    Object.entries(extraHeaders).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(status);
    res.end(body);
  }

  function sendError(res, status, message) {
    sendJSON(res, status, { error: message });
  }

  function readBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 10 * 1024 * 1024) { // 10 MB guard
          req.destroy();
          reject(new Error('Request body too large'));
        }
      });
      req.on('end',   () => resolve(body));
      req.on('error', reject);
    });
  }

  function parseURL(req) {
    return new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  }

  // ─── Route Handlers ───────────────────────────────────────────────────────

  async function handleHead(req, res) {
    const etag = await getETag(tasksFile);
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'no-cache');
    res.writeHead(200);
    res.end();
  }

  async function handleGet(req, res) {
    const clientEtag = req.headers['if-none-match'];

    // 304 short-circuit — no body needed
    if (clientEtag && await etagMatches(tasksFile, clientEtag)) {
      res.writeHead(304);
      res.end();
      return;
    }

    const tasks = await readJSON(tasksFile, []);
    const etag  = await getETag(tasksFile);
    sendJSON(res, 200, tasks, {
      'ETag':          etag,
      'Cache-Control': 'no-cache',
    });
  }

  async function handlePost(req, res) {
    let tasks;
    try {
      tasks = JSON.parse(await readBody(req));
    } catch {
      return sendError(res, 400, 'Invalid JSON body');
    }

    if (!Array.isArray(tasks)) {
      return sendError(res, 400, 'Body must be a JSON array of tasks');
    }

    await writeJSON(tasksFile, tasks, { backup });

    // Run caller-provided multi-file hook (CSV, state files, etc.)
    if (onAfterSave) {
      await onAfterSave(tasks).catch(err =>
        console.error('[bridge] onAfterSave error:', err.message)
      );
    }

    const etag = await getETag(tasksFile);
    sendJSON(res, 200, { ok: true, count: tasks.length }, { 'ETag': etag });
  }

  async function handlePut(req, res, taskId) {
    let patch;
    try {
      patch = JSON.parse(await readBody(req));
    } catch {
      return sendError(res, 400, 'Invalid JSON body');
    }

    const tasks = await readJSON(tasksFile, []);
    const idx   = tasks.findIndex(t => String(t.id) === taskId);

    if (idx === -1) return sendError(res, 404, `Task "${taskId}" not found`);

    // Merge patch — id is immutable
    tasks[idx] = { ...tasks[idx], ...patch, id: tasks[idx].id };
    await writeJSON(tasksFile, tasks, { backup });

    if (onAfterSave) {
      await onAfterSave(tasks).catch(err =>
        console.error('[bridge] onAfterSave error:', err.message)
      );
    }

    const etag = await getETag(tasksFile);
    sendJSON(res, 200, tasks[idx], { 'ETag': etag });
  }

  async function handleDelete(req, res, taskId) {
    const tasks    = await readJSON(tasksFile, []);
    const filtered = tasks.filter(t => String(t.id) !== taskId);

    if (filtered.length === tasks.length) {
      return sendError(res, 404, `Task "${taskId}" not found`);
    }

    await writeJSON(tasksFile, filtered, { backup });

    if (onAfterSave) {
      await onAfterSave(filtered).catch(err =>
        console.error('[bridge] onAfterSave error:', err.message)
      );
    }

    const etag = await getETag(tasksFile);
    res.setHeader('ETag', etag);
    res.writeHead(204);
    res.end();
  }

  async function handleStatus(req, res) {
    const etag = await getETag(tasksFile);
    sendJSON(res, 200, {
      ok:        true,
      file:      tasksFile,
      etag,
      timestamp: new Date().toISOString(),
      platform:  os.platform(),
    });
  }

  // ─── Main Handle Function ─────────────────────────────────────────────────

  /**
   * Call this at the top of your createServer() handler.
   * Returns true if the route was handled (so you can skip static file serving).
   * Returns false if the request is not a bridge API route.
   */
  async function handle(req, res) {
    const url    = parseURL(req);
    const method = req.method.toUpperCase();
    const p      = url.pathname;

    // Only handle /api/* routes
    if (!p.startsWith('/api/')) return false;

    setCORS(req, res);

    // Preflight
    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return true;
    }

    try {
      // /api/status
      if (p === '/api/status' && method === 'GET') {
        await handleStatus(req, res);
        return true;
      }

      // /api/tasks (collection)
      if (p === '/api/tasks') {
        if (method === 'HEAD')  { await handleHead(req, res);  return true; }
        if (method === 'GET')   { await handleGet(req, res);   return true; }
        if (method === 'POST')  { await handlePost(req, res);  return true; }
      }

      // /api/tasks/:id (single task)
      const match = p.match(/^\/api\/tasks\/(.+)$/);
      if (match) {
        const taskId = decodeURIComponent(match[1]);
        if (method === 'PUT')    { await handlePut(req, res, taskId);    return true; }
        if (method === 'DELETE') { await handleDelete(req, res, taskId); return true; }
      }

      // Known prefix but unknown route
      sendError(res, 404, `No API route for ${method} ${p}`);
      return true;

    } catch (err) {
      console.error('[bridge] Unhandled error:', err);
      sendError(res, 500, err.message || 'Internal server error');
      return true;
    }
  }

  return { handle };
}
