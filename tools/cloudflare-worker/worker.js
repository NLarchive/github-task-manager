// Cloudflare Worker for GitHub Task Manager
// This worker acts as a secure proxy for GitHub API writes
// Deploy to Cloudflare Workers (free tier: 100k requests/day)
//
// Setup:
// 1. Create a Cloudflare account and go to Workers
// 2. Create a new Worker with this code
// 3. Add environment variables:
//    - GITHUB_TOKEN: Your fine-grained PAT with contents:write
//    - ACCESS_PASSWORD_MASTER: Master password for all projects
//    - ACCESS_PASSWORD_GITHUB_TASK_MANAGER: Password for github-task-manager project
//    - ACCESS_PASSWORD_AI_CAREER_ROADMAP: Password for ai-career-roadmap project
// 4. Update the ALLOWED_ORIGINS with your GitHub Pages URL
// 5. Set your worker URL in the app config

const ALLOWED_ORIGINS = [
  'https://nlarchive.github.io',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000'
];

// Only allow writes to these paths (regex patterns)
// Supports both repo layouts:
// - github-task-manager: public/tasksDB/<projectId>/...
// - ai-career-roadmap: tasksDB/<projectId>/...
const ALLOWED_PATHS = [
  /^(?:public\/)?tasksDB\/[a-zA-Z0-9_-]+\/tasks\.json$/,
  /^(?:public\/)?tasksDB\/[a-zA-Z0-9_-]+\/tasks\.csv$/,
  /^(?:public\/)?tasksDB\/[a-zA-Z0-9_-]+\/state\/[a-zA-Z0-9_-]+\.json$/,
  /^(?:public\/)?tasksDB\/[a-zA-Z0-9_-]+\/history\/[a-zA-Z0-9_-]+\.json$/,
  /^(?:public\/)?tasksDB\/[a-zA-Z0-9_-]+\/history\/[a-zA-Z0-9_-]+\.ndjson$/
];

function getTokenForProject(projectId, env) {
  const id = safeProjectId(projectId);
  if (!env) return '';

  // Preferred: per-project secret token - support both naming conventions
  //  - GITHUB_TOKEN_AI_CAREER_ROADMAP
  //  - GH_TOKEN_AI_CAREER_ROADMAP
  const perKey1 = `GITHUB_TOKEN_${id.toUpperCase().replace(/-/g, '_')}`;
  const perKey2 = `GH_TOKEN_${id.toUpperCase().replace(/-/g, '_')}`;
  const per1 = env[perKey1];
  if (per1 && String(per1).trim()) return String(per1).trim();
  const per2 = env[perKey2];
  if (per2 && String(per2).trim()) return String(per2).trim();

  // Shared token fallback (both naming conventions)
  const shared1 = env.GITHUB_TOKEN;
  if (shared1 && String(shared1).trim()) return String(shared1).trim();
  const shared2 = env.GH_TOKEN;
  if (shared2 && String(shared2).trim()) return String(shared2).trim();

  return '';
}

function safeProjectId(value) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

function getProjectConfig(projectId, env) {
  const id = safeProjectId(projectId);
  if (!id) return null;

  // Optional env override: JSON mapping { "projectId": { owner, repo, branch, tasksRoot } }
  const raw = env && env.PROJECTS_JSON ? String(env.PROJECTS_JSON) : '';
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const cfg = parsed && parsed[id] ? parsed[id] : null;
      if (cfg && cfg.owner && cfg.repo) {
        return {
          id,
          owner: String(cfg.owner),
          repo: String(cfg.repo),
          branch: String(cfg.branch || 'main'),
          tasksRoot: String(cfg.tasksRoot || 'public/tasksDB').replace(/\/+$/g, '')
        };
      }
    } catch {
      // ignore malformed env JSON
    }
  }

  // Defaults (kept in sync with public/config/template-config.js)
  const defaults = {
    'github-task-manager': { owner: 'nlarchive', repo: 'github-task-manager', branch: 'main', tasksRoot: 'public/tasksDB' },
    'ai-career-roadmap': { owner: 'nlarchive', repo: 'ai-career-roadmap', branch: 'main', tasksRoot: 'tasksDB' }
  };

  const base = defaults[id];
  if (!base) return null;
  return { id, ...base };
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
      return new Response('Forbidden', { status: 403 });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === '/health') {
      return jsonResponse({ status: 'ok' }, origin);
    }

    // Read task history (public/read-only)
    if (path === '/api/task-history' && request.method === 'GET') {
      return handleGetTaskHistory(request, env, origin);
    }

    // Main API: PUT /api/tasks
    if (path === '/api/tasks' && request.method === 'PUT') {
      return handleTasksUpdate(request, env, origin);
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function getFileContentAndShaForRepo({ owner, repo, branch }, filePath, token) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskManager-Worker'
        }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data && data.content ? atob(data.content) : '';
    return { content: raw, sha: data.sha };
  } catch {
    return null;
  }
}

function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function getTaskKey(task) {
  if (!task || typeof task !== 'object') return '';
  const id = (task.task_id ?? task.id ?? task.taskId ?? '').toString();
  return id ? id : '';
}

function summarizeChanges(changes) {
  if (!Array.isArray(changes) || changes.length === 0) return 'No field changes';
  const fields = changes.map(c => c.field).filter(Boolean);
  return fields.slice(0, 6).join(', ') + (fields.length > 6 ? ` (+${fields.length - 6} more)` : '');
}

function diffTasks(oldTasks, newTasks) {
  const oldMap = new Map();
  const newMap = new Map();

  (Array.isArray(oldTasks) ? oldTasks : []).forEach(t => {
    const k = getTaskKey(t);
    if (k) oldMap.set(k, t);
  });

  (Array.isArray(newTasks) ? newTasks : []).forEach(t => {
    const k = getTaskKey(t);
    if (k) newMap.set(k, t);
  });

  const events = [];

  // Creates + updates
  for (const [taskId, afterTask] of newMap.entries()) {
    const beforeTask = oldMap.get(taskId);
    if (!beforeTask) {
      events.push({ action: 'create', taskId, before: null, after: afterTask, changes: null });
      continue;
    }

    const allKeys = new Set([...Object.keys(beforeTask || {}), ...Object.keys(afterTask || {})]);
    const changes = [];
    for (const key of allKeys) {
      // Ignore volatile fields if needed later; for now keep everything.
      const beforeVal = beforeTask[key];
      const afterVal = afterTask[key];
      if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
        changes.push({ field: key, before: beforeVal, after: afterVal });
      }
    }
    if (changes.length > 0) {
      events.push({ action: 'update', taskId, before: beforeTask, after: afterTask, changes });
    }
  }

  // Deletes
  for (const [taskId, beforeTask] of oldMap.entries()) {
    if (!newMap.has(taskId)) {
      events.push({ action: 'delete', taskId, before: beforeTask, after: null, changes: null });
    }
  }

  return events;
}

async function appendNdjsonEvents(projectId, token, events, env) {
  if (!Array.isArray(events) || events.length === 0) return;
  // Default: keep old behavior if project config cannot be resolved.
  const cfg = getProjectConfig(projectId, env) || { owner: 'nlarchive', repo: 'github-task-manager', branch: 'main', tasksRoot: 'public/tasksDB' };
  const historyPath = `${cfg.tasksRoot}/${cfg.id}/history/changes.ndjson`;
  const existing = await getFileContentAndShaForRepo(cfg, historyPath, token);
  const existingContent = existing && typeof existing.content === 'string' ? existing.content : '';

  const nextLines = events.map(e => JSON.stringify(e)).join('\n') + '\n';
  let nextContent = existingContent + nextLines;

  // Basic retention: keep last ~2000 lines to avoid unbounded growth
  const lines = nextContent.split(/\r?\n/).filter(Boolean);
  if (lines.length > 2000) {
    nextContent = lines.slice(lines.length - 2000).join('\n') + '\n';
  }

  const updateBody = {
    message: `Append task history (${projectId})`,
    content: btoa(unescape(encodeURIComponent(nextContent))),
    branch: cfg.branch
  };
  if (existing && existing.sha) updateBody.sha = existing.sha;

  await fetch(
    `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${historyPath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'TaskManager-Worker'
      },
      body: JSON.stringify(updateBody)
    }
  );
}

async function handleGetTaskHistory(request, env, origin) {
  try {
    const url = new URL(request.url);
    const projectId = (url.searchParams.get('project') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const taskId = (url.searchParams.get('taskId') || '').trim();
    const limit = Math.max(1, Math.min(500, Number(url.searchParams.get('limit') || '200')));
    if (!projectId) return jsonResponse({ error: 'Missing project parameter' }, origin, 400);

    const cfg = getProjectConfig(projectId, env);
    if (!cfg) return jsonResponse({ error: `Unknown project: ${projectId}` }, origin, 400);

    const token = getTokenForProject(projectId, env);
    if (!token) return jsonResponse({ error: 'GitHub token not configured' }, origin, 500);

    const historyPath = `${cfg.tasksRoot}/${cfg.id}/history/changes.ndjson`;
    const existing = await getFileContentAndShaForRepo(cfg, historyPath, token);
    const content = existing && typeof existing.content === 'string' ? existing.content : '';
    if (!content.trim()) return jsonResponse({ items: [] }, origin);

    const lines = content.split(/\r?\n/).filter(Boolean);
    const items = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      const evt = safeJsonParse(lines[i], null);
      if (!evt) continue;
      if (taskId && String(evt.taskId) !== String(taskId)) continue;
      items.push(evt);
      if (items.length >= limit) break;
    }

    return jsonResponse({ items }, origin);
  } catch (e) {
    return jsonResponse({ error: e.message }, origin, 500);
  }
}

async function handleTasksUpdate(request, env, origin) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { projectId, accessPassword, filePath, content, message } = body;
    
    if (!projectId || !accessPassword || !filePath || !content) {
      return jsonResponse({ error: 'Missing required fields' }, origin, 400);
    }

    const cfg = getProjectConfig(projectId, env);
    if (!cfg) {
      return jsonResponse({ error: `Unknown project: ${projectId}` }, origin, 400);
    }

    // Validate access password
    const masterPassword = env.ACCESS_PASSWORD_MASTER || '';
    const projectPassword = env[`ACCESS_PASSWORD_${projectId.toUpperCase().replace(/-/g, '_')}`] || '';
    
    if (accessPassword !== masterPassword && accessPassword !== projectPassword) {
      return jsonResponse({ error: 'Invalid access password' }, origin, 401);
    }

    // Validate file path (only allow TaskDB files)
    if (!ALLOWED_PATHS.some(regex => regex.test(filePath))) {
      return jsonResponse({ error: `Path not allowed: ${filePath}` }, origin, 403);
    }

    // Ensure the file path is scoped to the selected project + its configured root.
    // Prevents a client from writing github-task-manager paths while claiming another projectId.
    const expectedPrefix = `${cfg.tasksRoot}/${cfg.id}/`;
    if (!String(filePath).startsWith(expectedPrefix)) {
      return jsonResponse({ error: `File path must start with ${expectedPrefix}` }, origin, 403);
    }

    // Validate content is valid JSON (for .json files)
    if (filePath.endsWith('.json')) {
      try {
        JSON.parse(content);
      } catch (e) {
        return jsonResponse({ error: 'Invalid JSON content' }, origin, 400);
      }
    }

    // Get current file SHA (needed for update)
    const token = getTokenForProject(projectId, env);
    if (!token) {
      return jsonResponse({ error: 'GitHub token not configured' }, origin, 500);
    }

    let sha = null;
    let previousTasksJson = null;
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}?ref=${cfg.branch}`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'TaskManager-Worker'
          }
        }
      );
      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;

        // If we are updating tasks.json, fetch previous content for diff
        if (filePath.endsWith('/tasks.json') && data && data.content) {
          previousTasksJson = atob(data.content);
        }
      }
    } catch (e) {
      // File might not exist yet, that's ok
    }

    // Update file via GitHub API
    const updateBody = {
      message: message || `Update ${filePath}`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: cfg.branch
    };
    if (sha) {
      updateBody.sha = sha;
    }

    const updateResponse = await fetch(
      `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'TaskManager-Worker'
        },
        body: JSON.stringify(updateBody)
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      return jsonResponse({ error: error.message || 'GitHub API error' }, origin, updateResponse.status);
    }

    const result = await updateResponse.json();

    // Record detailed per-task history ONLY when tasks.json changes
    if (filePath.endsWith('/tasks.json')) {
      try {
        const prev = safeJsonParse(previousTasksJson || '', null);
        const next = safeJsonParse(content || '', null);
        const prevTasks = prev && Array.isArray(prev.tasks) ? prev.tasks : [];
        const nextTasks = next && Array.isArray(next.tasks) ? next.tasks : [];

        const rawEvents = diffTasks(prevTasks, nextTasks);
        const actor = (body && body.actor) ? String(body.actor) : '';
        const now = new Date().toISOString();
        const commitSha = result && result.commit && result.commit.sha ? result.commit.sha : (result && result.commit ? result.commit : '');
        const msg = message || `Update ${filePath}`;

        const events = rawEvents.map(ev => {
          const taskName = (ev.after && (ev.after.task_name || ev.after.title)) || (ev.before && (ev.before.task_name || ev.before.title)) || '';
          return {
            ts: now,
            projectId,
            actor,
            origin,
            file: filePath,
            commitSha,
            message: msg,
            action: ev.action,
            taskId: ev.taskId,
            taskName,
            changeSummary: ev.action === 'update' ? summarizeChanges(ev.changes) : ev.action,
            changes: ev.changes,
            before: ev.before,
            after: ev.after
          };
        });

        // Append to history file (best-effort; do not block response)
        appendNdjsonEvents(projectId, token, events, env).catch(() => {});
      } catch {
        // ignore history errors
      }
    }

    return jsonResponse({ 
      success: true, 
      sha: result.content.sha,
      commit: result.commit.sha
    }, origin);

  } catch (e) {
    console.error('Error:', e);
    return jsonResponse({ error: e.message }, origin, 500);
  }
}

function handleCORS(request) {
  const origin = request.headers.get('Origin') || '';
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ? origin : '',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
  return new Response(null, { status: 204, headers });
}

function jsonResponse(data, origin, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ? origin : ''
    }
  });
}
