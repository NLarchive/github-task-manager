import os from 'os';
import { readJSON, writeJSON, getETag, etagMatches } from './file-editor.js';

export function createBridgeRouter(config = {}) {
  const {
    tasksFile,
    allowedOrigins = [],
    onAfterSave = null,
    backup = false
  } = config;

  if (!tasksFile) throw new Error('bridge-router: tasksFile is required');

  function setCORS(req, res) {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.length === 0) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match');
    res.setHeader('Access-Control-Expose-Headers', 'ETag');
    res.setHeader('Vary', 'Origin');
  }

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
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 10 * 1024 * 1024) {
          req.destroy();
          reject(new Error('Request body too large'));
        }
      });
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });
  }

  function parseURL(req) {
    return new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  }

  async function handleHead(_req, res) {
    const etag = await getETag(tasksFile);
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'no-cache');
    res.writeHead(200);
    res.end();
  }

  async function handleGet(req, res) {
    const clientEtag = req.headers['if-none-match'];

    if (clientEtag && await etagMatches(tasksFile, clientEtag)) {
      res.writeHead(304);
      res.end();
      return;
    }

    const tasks = await readJSON(tasksFile, []);
    const etag = await getETag(tasksFile);
    sendJSON(res, 200, tasks, {
      ETag: etag,
      'Cache-Control': 'no-cache'
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

    if (onAfterSave) {
      await onAfterSave(tasks).catch((err) => {
        console.error('[bridge] onAfterSave error:', err.message);
      });
    }

    const etag = await getETag(tasksFile);
    sendJSON(res, 200, { ok: true, count: tasks.length }, { ETag: etag });
  }

  async function handlePut(req, res, taskId) {
    let patch;
    try {
      patch = JSON.parse(await readBody(req));
    } catch {
      return sendError(res, 400, 'Invalid JSON body');
    }

    const tasks = await readJSON(tasksFile, []);
    const idx = tasks.findIndex((task) => String(task.id) === taskId);

    if (idx === -1) return sendError(res, 404, `Task "${taskId}" not found`);

    tasks[idx] = { ...tasks[idx], ...patch, id: tasks[idx].id };
    await writeJSON(tasksFile, tasks, { backup });

    if (onAfterSave) {
      await onAfterSave(tasks).catch((err) => {
        console.error('[bridge] onAfterSave error:', err.message);
      });
    }

    const etag = await getETag(tasksFile);
    sendJSON(res, 200, tasks[idx], { ETag: etag });
  }

  async function handleDelete(_req, res, taskId) {
    const tasks = await readJSON(tasksFile, []);
    const filtered = tasks.filter((task) => String(task.id) !== taskId);

    if (filtered.length === tasks.length) {
      return sendError(res, 404, `Task "${taskId}" not found`);
    }

    await writeJSON(tasksFile, filtered, { backup });

    if (onAfterSave) {
      await onAfterSave(filtered).catch((err) => {
        console.error('[bridge] onAfterSave error:', err.message);
      });
    }

    const etag = await getETag(tasksFile);
    res.setHeader('ETag', etag);
    res.writeHead(204);
    res.end();
  }

  async function handleStatus(_req, res) {
    const etag = await getETag(tasksFile);
    sendJSON(res, 200, {
      ok: true,
      file: tasksFile,
      etag,
      timestamp: new Date().toISOString(),
      platform: os.platform()
    });
  }

  async function handle(req, res) {
    const url = parseURL(req);
    const method = req.method.toUpperCase();
    const p = url.pathname;

    if (!p.startsWith('/api/')) return false;

    setCORS(req, res);

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return true;
    }

    try {
      if (p === '/api/status' && method === 'GET') {
        await handleStatus(req, res);
        return true;
      }

      if (p === '/api/tasks') {
        if (method === 'HEAD') { await handleHead(req, res); return true; }
        if (method === 'GET') { await handleGet(req, res); return true; }
        if (method === 'POST') { await handlePost(req, res); return true; }
      }

      const match = p.match(/^\/api\/tasks\/(.+)$/);
      if (match) {
        const taskId = decodeURIComponent(match[1]);
        if (method === 'PUT') { await handlePut(req, res, taskId); return true; }
        if (method === 'DELETE') { await handleDelete(req, res, taskId); return true; }
      }

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
