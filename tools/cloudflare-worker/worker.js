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
const ALLOWED_PATHS = [
  /^public\/tasksDB\/[a-zA-Z0-9_-]+\/tasks\.json$/,
  /^public\/tasksDB\/[a-zA-Z0-9_-]+\/tasks\.csv$/,
  /^public\/tasksDB\/[a-zA-Z0-9_-]+\/state\/[a-zA-Z0-9_-]+\.json$/,
  /^public\/tasksDB\/[a-zA-Z0-9_-]+\/history\/[a-zA-Z0-9_-]+\.json$/,
  /^public\/tasksDB\/[a-zA-Z0-9_-]+\/history\/[a-zA-Z0-9_-]+\.ndjson$/
];

// GitHub repo config
const GITHUB_OWNER = 'nlarchive';
const GITHUB_REPO = 'github-task-manager';
const GITHUB_BRANCH = 'main';

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

async function getFileContentAndSha(filePath, token) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
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
  } catch (e) {
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

async function appendNdjsonEvents(projectId, token, events) {
  if (!Array.isArray(events) || events.length === 0) return;
  const historyPath = `public/tasksDB/${projectId}/history/changes.ndjson`;
  const existing = await getFileContentAndSha(historyPath, token);
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
    branch: GITHUB_BRANCH
  };
  if (existing && existing.sha) updateBody.sha = existing.sha;

  await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${historyPath}`,
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
    const token = env.GITHUB_TOKEN;
    if (!token) return jsonResponse({ error: 'GitHub token not configured' }, origin, 500);

    const url = new URL(request.url);
    const projectId = (url.searchParams.get('project') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const taskId = (url.searchParams.get('taskId') || '').trim();
    const limit = Math.max(1, Math.min(500, Number(url.searchParams.get('limit') || '200')));
    if (!projectId) return jsonResponse({ error: 'Missing project parameter' }, origin, 400);

    const historyPath = `public/tasksDB/${projectId}/history/changes.ndjson`;
    const existing = await getFileContentAndSha(historyPath, token);
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

    // Validate content is valid JSON (for .json files)
    if (filePath.endsWith('.json')) {
      try {
        JSON.parse(content);
      } catch (e) {
        return jsonResponse({ error: 'Invalid JSON content' }, origin, 400);
      }
    }

    // Get current file SHA (needed for update)
    const token = env.GITHUB_TOKEN;
    if (!token) {
      return jsonResponse({ error: 'GitHub token not configured' }, origin, 500);
    }

    let sha = null;
    let previousTasksJson = null;
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
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
      branch: GITHUB_BRANCH
    };
    if (sha) {
      updateBody.sha = sha;
    }

    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
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
        appendNdjsonEvents(projectId, token, events).catch(() => {});
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
