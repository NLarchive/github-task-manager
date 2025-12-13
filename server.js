const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes('"')) return `"${str.replace(/"/g, '""')}"`;
  if (str.includes(',') || str.includes('\n') || str.includes('\r')) return `"${str}"`;
  return str;
}

function generatePersistedCSV(tasks = []) {
  const fields = [
    'task_id',
    'task_name',
    'description',
    'start_date',
    'end_date',
    'priority',
    'status',
    'progress_percentage',
    'estimated_hours',
    'actual_hours',
    'is_critical_path',
    'category_name',
    'parent_task_id',
    'creator_id',
    'created_date',
    'completed_date'
  ];

  const header = fields.join(',');
  const rows = (tasks || []).map((task) => fields.map((f) => escapeCsvValue(task ? task[f] : '')).join(','));
  return [header, ...rows].join('\n') + '\n';
}

function getDuplicateTaskIds(tasks = []) {
  const seen = new Set();
  const dupes = new Set();
  for (const task of tasks || []) {
    const id = task && task.task_id;
    if (typeof id !== 'number') continue;
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return Array.from(dupes).sort((a, b) => a - b);
}

function safeJoin(root, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const cleaned = decoded.replace(/^\/+/, '');
  const resolved = path.resolve(root, cleaned);
  if (!resolved.startsWith(path.resolve(root))) return null;
  return resolved;
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.csv') return 'text/csv; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sanitizeProjectId(value) {
  if (!value) return null;
  const id = String(value).trim();
  if (!id) return null;
  // Allow only safe folder characters to avoid traversal.
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return safe || null;
}

function maybeBootstrapTasksDb(tasksDbDir, fallbackDir) {
  try {
    ensureDir(tasksDbDir);
    // Prefer bootstrapping the default project folder (multi-project layout)
    const defaultProject = 'github-task-manager';
    const fallbackProjectDir = path.join(fallbackDir, defaultProject);
    const targetProjectDir = path.join(tasksDbDir, defaultProject);

    const bootstrapPair = (srcDir, dstDir) => {
      ensureDir(dstDir);
      const jsonSrc = path.join(srcDir, 'tasks.json');
      const csvSrc = path.join(srcDir, 'tasks.csv');
      const jsonDst = path.join(dstDir, 'tasks.json');
      const csvDst = path.join(dstDir, 'tasks.csv');
      if (!fs.existsSync(jsonDst) && fs.existsSync(jsonSrc)) fs.copyFileSync(jsonSrc, jsonDst);
      if (!fs.existsSync(csvDst) && fs.existsSync(csvSrc)) fs.copyFileSync(csvSrc, csvDst);
    };

    if (fs.existsSync(fallbackProjectDir)) {
      bootstrapPair(fallbackProjectDir, targetProjectDir);
      return;
    }

    // Legacy fallback (single-project layout)
    const jsonPath = path.join(tasksDbDir, 'tasks.json');
    const csvPath = path.join(tasksDbDir, 'tasks.csv');
    if (!fs.existsSync(jsonPath) && fs.existsSync(path.join(fallbackDir, 'tasks.json'))) {
      fs.copyFileSync(path.join(fallbackDir, 'tasks.json'), jsonPath);
    }
    if (!fs.existsSync(csvPath) && fs.existsSync(path.join(fallbackDir, 'tasks.csv'))) {
      fs.copyFileSync(path.join(fallbackDir, 'tasks.csv'), csvPath);
    }
  } catch {
    // Best-effort only.
  }
}

function writeStateFiles(tasksDbDir, fullData) {
  const stateDir = path.join(tasksDbDir, 'state');
  ensureDir(stateDir);

  const tasks = (fullData && Array.isArray(fullData.tasks)) ? fullData.tasks : [];
  const now = new Date().toISOString();
  const byStatus = {};
  for (const task of tasks) {
    const status = (task && task.status) ? String(task.status) : 'Unknown';
    byStatus[status] = byStatus[status] || [];
    byStatus[status].push(task);
  }

  const summary = {
    generated_at: now,
    total_tasks: tasks.length,
    counts_by_status: Object.fromEntries(Object.entries(byStatus).map(([k, v]) => [k, v.length])),
    tasks_by_status: byStatus
  };

  fs.writeFileSync(path.join(stateDir, 'tasks-by-status.json'), JSON.stringify(summary, null, 2), 'utf8');

  const makeStatusFile = (status, filename) => {
    const payload = {
      status,
      generated_at: now,
      tasks: byStatus[status] || []
    };
    fs.writeFileSync(path.join(stateDir, filename), JSON.stringify(payload, null, 2), 'utf8');
  };

  makeStatusFile('Not Started', 'tasks-not-started.json');
  makeStatusFile('In Progress', 'tasks-in-progress.json');
  makeStatusFile('Completed', 'tasks-completed.json');
}

function createServer({ publicDir, tasksDbDir }) {
  const fallbackTasksDbDir = path.join(publicDir, 'tasksDB');
  maybeBootstrapTasksDb(tasksDbDir, fallbackTasksDbDir);

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const pathname = url.pathname;

      if (pathname === '/api/health') {
        return sendJson(res, 200, { ok: true });
      }

      if (pathname === '/api/tasks') {
        const projectId = sanitizeProjectId(url.searchParams.get('project'));
        const effectiveTasksDbDir = projectId ? path.join(tasksDbDir, projectId) : tasksDbDir;
        const tasksJsonPath = path.join(effectiveTasksDbDir, 'tasks.json');
        const tasksCsvPath = path.join(effectiveTasksDbDir, 'tasks.csv');

        if (req.method === 'GET') {
          if (!fs.existsSync(tasksJsonPath)) {
            return sendJson(res, 404, { ok: false, error: 'tasks.json not found' });
          }
          const raw = fs.readFileSync(tasksJsonPath, 'utf8');
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
          });
          res.end(raw);
          return;
        }

        if (req.method === 'PUT') {
          const body = await readBody(req);
          const fullData = JSON.parse(body || '{}');

          if (!fullData || !Array.isArray(fullData.tasks)) {
            return sendJson(res, 400, { ok: false, error: 'Expected payload with { tasks: [...] }' });
          }

          const dupes = getDuplicateTaskIds(fullData.tasks);
          if (dupes.length > 0) {
            return sendJson(res, 400, { ok: false, error: `Duplicate task_id detected: ${dupes.join(', ')}` });
          }

          ensureDir(effectiveTasksDbDir);
          fs.writeFileSync(tasksJsonPath, JSON.stringify(fullData, null, 2), 'utf8');
          fs.writeFileSync(tasksCsvPath, generatePersistedCSV(fullData.tasks), 'utf8');
          writeStateFiles(effectiveTasksDbDir, fullData);

          return sendJson(res, 200, { ok: true, tasks: fullData.tasks.length });
        }

        res.writeHead(405, { 'Allow': 'GET, PUT' });
        res.end();
        return;
      }

      // Static serving (special-case tasksDB to come from tasksDbDir)
      let serveRoot = publicDir;
      let effectivePath = pathname === '/' ? '/index.html' : pathname;
      
      // Only route tasksDB *data* requests to the external TASKS_DB_DIR.
      // Keep static assets like /tasksDB/task-database.js served from /public.
      const isTasksDbDataRequest = pathname.startsWith('/tasksDB/') && (
        pathname.endsWith('.json') ||
        pathname.endsWith('.csv') ||
        pathname.includes('/state/') ||
        pathname.includes('/history/')
      );

      if (isTasksDbDataRequest) {
        serveRoot = tasksDbDir;
        // Remove the /tasksDB/ prefix since we're serving from tasksDbDir
        effectivePath = pathname.replace(/^\/tasksDB/, '');
        if (!effectivePath) effectivePath = '/';
      }
      
      const filePath = safeJoin(serveRoot, effectivePath);
      if (!filePath) {
        res.writeHead(400);
        res.end('Bad request');
        return;
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ct = contentTypeFor(filePath);
      const isTasksDbAsset = pathname.startsWith('/tasksDB/') && (filePath.endsWith('.json') || filePath.endsWith('.csv'));
      res.writeHead(200, {
        'Content-Type': ct,
        ...(isTasksDbAsset ? { 'Cache-Control': 'no-store' } : {})
      });
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(String(err && err.message ? err.message : err));
    }
  });

  return server;
}

if (require.main === module) {
  const repoRoot = __dirname;
  const publicDir = path.join(repoRoot, 'public');
  const tasksDbDir = process.env.TASKS_DB_DIR
    ? path.resolve(process.env.TASKS_DB_DIR)
    : path.join(publicDir, 'tasksDB');

  const port = Number(process.env.PORT || 3000);
  const server = createServer({ publicDir, tasksDbDir });
  server.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
    console.log(`Tasks DB dir: ${tasksDbDir}`);
  });
}

module.exports = { createServer };
