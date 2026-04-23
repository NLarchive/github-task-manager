/**
 * Local development server and runtime API bridge for the public TaskDB apps.
 *
 * This module serves the static frontend under `public/`, exposes project and
 * module discovery endpoints for local workflows, and persists `tasks.json`,
 * derived CSV, and state files when the app runs outside GitHub Pages.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

/**
 * Escape a scalar value for inclusion in the persisted CSV export.
 *
 * @param {unknown} value
 * @returns {string}
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes('"')) return `"${str.replace(/"/g, '""')}"`;
  if (str.includes(',') || str.includes('\n') || str.includes('\r')) return `"${str}"`;
  return str;
}

/**
 * Build the repo-side flattened CSV companion for a TaskDB task list.
 *
 * @param {object[]} [tasks=[]]
 * @returns {string}
 */
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

/**
 * Collect duplicate numeric task identifiers before persisting project data.
 *
 * @param {object[]} [tasks=[]]
 * @returns {number[]}
 */
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

/**
 * Resolve a request-relative path within a trusted root, rejecting traversal.
 *
 * @param {string} root
 * @param {string} requestPath
 * @returns {string|null}
 */
function safeJoin(root, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const cleaned = decoded.replace(/^\/+/, '');
  const resolved = path.resolve(root, cleaned);
  if (!resolved.startsWith(path.resolve(root))) return null;
  return resolved;
}

/**
 * Map a file path extension to the HTTP content type used by static serving.
 *
 * @param {string} filePath
 * @returns {string}
 */
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

/**
 * Send a JSON response with no-store caching for API endpoints.
 *
 * @param {import('http').ServerResponse} res
 * @param {number} status
 * @param {unknown} payload
 * @returns {void}
 */
function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

/**
 * Read the full request body into memory with a conservative size guard.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<string>}
 */
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

/**
 * Read and parse a JSON file, returning null when it does not exist or fails.
 *
 * @param {string} filePath
 * @returns {object|null}
 */
function readJsonFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Normalize a project-relative path to forward slashes without leading markers.
 *
 * @param {string} value
 * @returns {string}
 */
function normalizeRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/^\.\//, '');
  if (!normalized) return '';
  return normalized.split('/').filter(Boolean).join('/');
}

/**
 * Infer the department/group label for a discovered module path.
 *
 * @param {string} relativePath
 * @returns {string}
 */
function inferModuleDepartment(relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized) return 'other';
  const withoutSrc = normalized.startsWith('src/') ? normalized.slice('src/'.length) : normalized;
  if (withoutSrc.startsWith('apps/PRIVATE/')) {
    const parts = withoutSrc.split('/');
    return parts[2] || 'other';
  }
  if (withoutSrc.startsWith('SHARED/')) return 'SHARED';
  if (withoutSrc.startsWith('infra/')) return 'infrastructure';
  if (withoutSrc.startsWith('shop-db/')) return 'database';
  const first = withoutSrc.split('/')[0] || 'other';
  return first;
}

/**
 * Infer a coarse module type when the module file does not declare one.
 *
 * @param {string} relativePath
 * @param {object} moduleData
 * @returns {string}
 */
function inferModuleType(relativePath, moduleData) {
  if (moduleData && moduleData.type) return moduleData.type;
  const normalized = normalizeRelativePath(relativePath);
  const withoutSrc = normalized.startsWith('src/') ? normalized.slice('src/'.length) : normalized;
  if (withoutSrc.startsWith('apps/PRIVATE/')) return 'private-app';
  if (withoutSrc.startsWith('SHARED/')) return 'shared-module';
  if (withoutSrc.startsWith('shop-db/')) return 'database-module';
  if (withoutSrc.startsWith('infra/')) return 'infrastructure';
  return 'module';
}

/** Preferred task filenames searched within a TaskDB project tree. */
const TASK_FILE_CANDIDATES = ['tasks.json', 'TODO_project_task.json'];

/** Directories skipped while scanning project modules and derived artifacts. */
const DISCOVERY_IGNORED_DIRS = new Set(['history', 'state', 'tour', 'node_modules', '.git']);

/**
 * Determine whether a filename is a supported TaskDB source file.
 *
 * @param {string} fileName
 * @returns {boolean}
 */
function isTaskFileCandidate(fileName) {
  return TASK_FILE_CANDIDATES.includes(String(fileName || '').trim());
}

/**
 * Read directory entries safely, returning an empty list on filesystem errors.
 *
 * @param {string} dirPath
 * @returns {import('fs').Dirent[]}
 */
function readDirectoryEntries(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

/**
 * Pick the preferred task source file from a directory listing.
 *
 * @param {import('fs').Dirent[]} entries
 * @returns {string}
 */
function pickPreferredTaskFileName(entries) {
  for (const candidate of TASK_FILE_CANDIDATES) {
    const match = (entries || []).find((entry) => entry && entry.isFile() && entry.name === candidate);
    if (match) return match.name;
  }
  return '';
}

/**
 * Recursively discover TaskDB task files under a project directory.
 *
 * @param {string} projectDir
 * @returns {string[]}
 */
function discoverProjectTaskFiles(projectDir) {
  if (!projectDir || !fs.existsSync(projectDir)) return [];

  const discovered = [];

  const walk = (dirPath) => {
    const entries = readDirectoryEntries(dirPath);
    const preferredFile = pickPreferredTaskFileName(entries);
    if (preferredFile) {
      discovered.push(normalizeRelativePath(path.relative(projectDir, path.join(dirPath, preferredFile))));
    }

    for (const entry of entries) {
      if (!entry || !entry.isDirectory()) continue;
      if (DISCOVERY_IGNORED_DIRS.has(entry.name)) continue;
      walk(path.join(dirPath, entry.name));
    }
  };

  walk(projectDir);
  return Array.from(new Set(discovered.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

/**
 * Resolve the canonical task key used for dependency and flow matching.
 *
 * @param {object} task
 * @returns {string}
 */
function getTaskKey(task) {
  if (!task || typeof task !== 'object') return '';
  const name = String(task.task_name || task.title || '').trim();
  if (name) return name;
  const rawId = task.task_id ?? task.id ?? task.taskId;
  return rawId === null || rawId === undefined ? '' : String(rawId).trim();
}

/**
 * Extract the short task code prefix from a task key when present.
 *
 * @param {object} task
 * @returns {string}
 */
function getTaskCode(task) {
  const key = getTaskKey(task);
  if (!key) return '';
  return key.includes(':') ? key.slice(0, key.indexOf(':')).trim() : key;
}

/**
 * Collect predecessor identifiers from a task dependency list.
 *
 * @param {object} task
 * @returns {string[]}
 */
function getTaskPredecessorKeys(task) {
  if (!task || !Array.isArray(task.dependencies)) return [];

  const predecessors = [];
  for (const dependency of task.dependencies) {
    if (!dependency || typeof dependency !== 'object') continue;

    const predecessorName = String(dependency.predecessor_task_name || '').trim();
    if (predecessorName) predecessors.push(predecessorName);

    const predecessorId = dependency.predecessor_task_id;
    if (predecessorId !== null && predecessorId !== undefined && predecessorId !== '') {
      predecessors.push(String(predecessorId).trim());
    }
  }

  return predecessors.filter(Boolean);
}

/**
 * Compute start/end tasks for a task list based on dependency relationships.
 *
 * @param {object[]} tasks
 * @returns {{startTaskKeys: string[], endTaskKeys: string[], startTasks: string[], endTasks: string[]}}
 */
function computeTaskFlowSummary(tasks) {
  const taskList = Array.isArray(tasks) ? tasks.filter(task => task && typeof task === 'object') : [];
  const canonicalKeyByAlias = new Map();
  const labelsByKey = new Map();

  for (const task of taskList) {
    const key = getTaskKey(task);
    if (!key) continue;
    labelsByKey.set(key, String(task.task_name || task.title || key));
    canonicalKeyByAlias.set(key, key);

    const code = getTaskCode(task);
    if (code && !canonicalKeyByAlias.has(code)) canonicalKeyByAlias.set(code, key);
  }

  const predecessorCount = new Map(Array.from(labelsByKey.keys(), key => [key, 0]));
  const successorsByKey = new Map(Array.from(labelsByKey.keys(), key => [key, new Set()]));

  for (const task of taskList) {
    const key = getTaskKey(task);
    if (!key || !predecessorCount.has(key)) continue;

    const normalizedPredecessors = Array.from(new Set(
      getTaskPredecessorKeys(task)
        .map(predecessor => canonicalKeyByAlias.get(predecessor) || predecessor)
        .filter(predecessor => predecessorCount.has(predecessor))
    ));

    predecessorCount.set(key, normalizedPredecessors.length);
    for (const predecessor of normalizedPredecessors) {
      const successors = successorsByKey.get(predecessor);
      if (successors) successors.add(key);
    }
  }

  const startTaskKeys = Array.from(predecessorCount.entries())
    .filter(([, count]) => count === 0)
    .map(([key]) => key);
  const endTaskKeys = Array.from(successorsByKey.entries())
    .filter(([, successors]) => !successors || successors.size === 0)
    .map(([key]) => key);

  return {
    startTaskKeys,
    endTaskKeys,
    startTasks: startTaskKeys.map(key => labelsByKey.get(key) || key),
    endTasks: endTaskKeys.map(key => labelsByKey.get(key) || key)
  };
}

/**
 * Score a candidate tasks file when selecting the root module for a project.
 *
 * @param {string} relativePath
 * @param {object|null} rawData
 * @returns {number}
 */
function scoreRootModuleCandidate(relativePath, rawData) {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized) return -1;

  let score = 0;
  if (normalized === 'src/tasks.json') score += 120;
  if (normalized === 'src/TODO_project_task.json') score += 115;
  if (normalized === 'tasks.json') score += 105;
  if (normalized === 'TODO_project_task.json') score += 100;
  if (normalized.startsWith('src/')) score += 30;

  if (rawData && rawData.template_type === 'project_task_template') score += 40;
  if (rawData && rawData.project && Array.isArray(rawData.tasks)) score += 25;

  score -= normalized.split('/').length;
  return score;
}

/**
 * Resolve the project root module path from navigation metadata or discovered files.
 *
 * @param {string} projectDir
 * @param {object|null} tasksIndexData
 * @returns {string}
 */
function resolveRootModuleRelative(projectDir, tasksIndexData) {
  const explicitRoot = normalizeRelativePath(
    tasksIndexData && tasksIndexData.navigation && tasksIndexData.navigation.rootModule
      ? tasksIndexData.navigation.rootModule
      : ''
  );
  const explicitPath = explicitRoot ? safeJoin(projectDir, explicitRoot) : null;
  if (explicitRoot && explicitPath && fs.existsSync(explicitPath)) return explicitRoot;

  for (const candidate of ['src/tasks.json', 'src/TODO_project_task.json', 'tasks.json', 'TODO_project_task.json']) {
    const absolutePath = safeJoin(projectDir, candidate);
    if (absolutePath && fs.existsSync(absolutePath)) return candidate;
  }

  const candidates = discoverProjectTaskFiles(projectDir)
    .map((relativePath) => {
      const absolutePath = safeJoin(projectDir, relativePath);
      return {
        relativePath,
        rawData: absolutePath ? readJsonFile(absolutePath) : null
      };
    })
    .filter(({ rawData }) => rawData && (
      rawData.template_type === 'project_task_template' ||
      (rawData.project && Array.isArray(rawData.tasks))
    ))
    .sort((a, b) => scoreRootModuleCandidate(b.relativePath, b.rawData) - scoreRootModuleCandidate(a.relativePath, a.rawData));

  if (candidates.length > 0) return candidates[0].relativePath;
  if (tasksIndexData) return 'tasks.json';
  return '';
}

/**
 * Build module metadata entries for all non-root task files in a project.
 *
 * @param {string} projectDir
 * @param {string} rootModuleRelative
 * @returns {object[]}
 */
function collectProjectModules(projectDir, rootModuleRelative) {
  const modules = [];
  const normalizedRootModule = normalizeRelativePath(rootModuleRelative || '');

  for (const relativePath of discoverProjectTaskFiles(projectDir)) {
    if (!relativePath) continue;
    if (relativePath === 'tasks.json') continue;
    if (normalizedRootModule && relativePath === normalizedRootModule) continue;

    const fullPath = safeJoin(projectDir, relativePath);
    if (!fullPath || !fs.existsSync(fullPath)) continue;

    const raw = readJsonFile(fullPath) || {};
    const moduleInfo = (raw && typeof raw.module === 'object' && raw.module) ? raw.module : {};
    const moduleName = String(moduleInfo.name || path.basename(path.dirname(fullPath)) || '').trim();
    const taskList = Array.isArray(raw.tasks) ? raw.tasks : [];
    const taskIds = Array.isArray(moduleInfo.task_ids)
      ? moduleInfo.task_ids.filter(Boolean)
      : (Array.isArray(moduleInfo.taskIds) ? moduleInfo.taskIds.filter(Boolean) : []);
    const flow = computeTaskFlowSummary(taskList);

    modules.push({
      name: moduleName || path.basename(path.dirname(fullPath)),
      label: String(moduleInfo.label || moduleName || path.basename(path.dirname(fullPath)) || '').trim(),
      path: relativePath,
      fileName: path.basename(relativePath),
      modulePath: normalizeRelativePath(moduleInfo.path || path.dirname(relativePath)),
      department: inferModuleDepartment(relativePath),
      type: inferModuleType(relativePath, moduleInfo),
      taskIds: taskIds.length > 0 ? taskIds : Array.from(new Set(taskList.map(getTaskCode).filter(Boolean))),
      taskCount: taskList.length,
      startTasks: flow.startTasks,
      endTasks: flow.endTasks,
      summary: raw && typeof raw.summary === 'object' ? raw.summary : null,
      pipeline: moduleInfo && typeof moduleInfo.pipeline === 'object' ? moduleInfo.pipeline : null,
      description: String(raw.description || '').trim() || null
    });
  }

  modules.sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')));
  return modules;
}

/**
 * Rebase module paths so the root module can reference them relative to itself.
 *
 * @param {object[]} modules
 * @param {string} rootModuleRelative
 * @returns {object[]}
 */
function buildRootRelativeModules(modules, rootModuleRelative) {
  const rootDir = normalizeRelativePath(rootModuleRelative || 'src/tasks.json').replace(/\/[^\/]*$/, '');
  const prefix = rootDir ? `${rootDir}/` : '';

  return (modules || []).map((moduleEntry) => {
    const projectRelativePath = normalizeRelativePath(moduleEntry && moduleEntry.path);
    let rootRelativePath = projectRelativePath;
    if (prefix && projectRelativePath.startsWith(prefix)) {
      rootRelativePath = projectRelativePath.slice(prefix.length);
    }

    return {
      ...moduleEntry,
      path: rootRelativePath || projectRelativePath
    };
  });
}

/**
 * Build the synchronized project payload served to the browser and graph runtime.
 *
 * @param {string} projectDir
 * @returns {{payload: object, tasksJsonPath: string, rootModulePath: string|null, rootModuleRelative: string, modules: object[]}|null}
 */
function buildProjectPayload(projectDir) {
  const tasksJsonPath = path.join(projectDir, 'tasks.json');
  const tasksIndexData = readJsonFile(tasksJsonPath);
  const rootModuleRelative = normalizeRelativePath(resolveRootModuleRelative(projectDir, tasksIndexData));
  const rootModulePath = rootModuleRelative ? safeJoin(projectDir, rootModuleRelative) : null;
  const rootData = rootModulePath ? (readJsonFile(rootModulePath) || null) : null;
  const baseData = rootData || tasksIndexData || null;
  if (!baseData) return null;

  const modules = collectProjectModules(projectDir, rootModuleRelative);
  const payload = {
    ...baseData,
    navigation: {
      ...((baseData && typeof baseData.navigation === 'object' && baseData.navigation) ? baseData.navigation : {}),
      ...((tasksIndexData && typeof tasksIndexData.navigation === 'object' && tasksIndexData.navigation) ? tasksIndexData.navigation : {}),
      rootModule: rootModuleRelative,
      modules
    }
  };

  return {
    payload,
    tasksJsonPath,
    rootModulePath,
    rootModuleRelative,
    modules
  };
}

/**
 * Persist the project index and root module payloads with regenerated navigation.
 *
 * @param {string} projectDir
 * @param {object} fullData
 * @returns {{tasksJsonPath: string, rootModulePath: string|null, modules: object[], rootModuleRelative: string}}
 */
function writeProjectPayload(projectDir, fullData) {
  const current = buildProjectPayload(projectDir);
  const rootModuleRelative = normalizeRelativePath(
    fullData && fullData.navigation && fullData.navigation.rootModule
      ? fullData.navigation.rootModule
      : (current && current.rootModuleRelative)
        ? current.rootModuleRelative
        : resolveRootModuleRelative(projectDir, fullData) || 'tasks.json'
  );
  const tasksJsonPath = path.join(projectDir, 'tasks.json');
  const rootModulePath = safeJoin(projectDir, rootModuleRelative);

  ensureDir(projectDir);
  if (rootModulePath) ensureDir(path.dirname(rootModulePath));

  const modules = collectProjectModules(projectDir, rootModuleRelative);
  const taskIndexPayload = {
    ...fullData,
    navigation: {
      ...((fullData && typeof fullData.navigation === 'object' && fullData.navigation) ? fullData.navigation : {}),
      rootModule: rootModuleRelative,
      modules
    }
  };

  const rootModules = buildRootRelativeModules(modules, rootModuleRelative);
  const rootPayload = {
    ...fullData,
    navigation: {
      ...((fullData && typeof fullData.navigation === 'object' && fullData.navigation) ? fullData.navigation : {}),
      modules: rootModules
    }
  };
  delete rootPayload.navigation.rootModule;

  fs.writeFileSync(tasksJsonPath, JSON.stringify(taskIndexPayload, null, 2), 'utf8');
  if (rootModulePath && path.resolve(rootModulePath) !== path.resolve(tasksJsonPath)) {
    fs.writeFileSync(rootModulePath, JSON.stringify(rootPayload, null, 2), 'utf8');
  }

  return { tasksJsonPath, rootModulePath, modules, rootModuleRelative };
}

/**
 * Ensure a directory exists before writing project artifacts.
 *
 * @param {string} dirPath
 * @returns {void}
 */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Sanitize a project identifier used to address project folders.
 *
 * @param {string} value
 * @returns {string|null}
 */
function sanitizeProjectId(value) {
  if (!value) return null;
  const id = String(value).trim();
  if (!id) return null;
  // Allow only safe folder characters to avoid traversal.
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return safe || null;
}

/**
 * Seed the writable tasks directory from bundled public TaskDB data when needed.
 *
 * @param {string} tasksDbDir
 * @param {string} fallbackDir
 * @returns {void}
 */
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

/**
 * Recursively copy a directory tree into the writable tasks workspace.
 *
 * @param {string} sourceDir
 * @param {string} targetDir
 * @returns {void}
 */
function copyDirRecursive(sourceDir, targetDir) {
  if (!sourceDir || !targetDir) return;
  if (path.resolve(sourceDir) === path.resolve(targetDir)) return;

  if (typeof fs.cpSync === 'function') {
    fs.cpSync(sourceDir, targetDir, { recursive: true });
    return;
  }

  ensureDir(targetDir);
  for (const entry of readDirectoryEntries(sourceDir)) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(sourcePath, targetPath);
      continue;
    }
    if (entry.isFile()) {
      ensureDir(path.dirname(targetPath));
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

/**
 * Regenerate the lightweight status-oriented state files for a project.
 *
 * @param {string} tasksDbDir
 * @param {object} fullData
 * @returns {void}
 */
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

/**
 * Create the local HTTP server used by development, tests, and file-backed saves.
 *
 * @param {{ publicDir: string, tasksDbDir: string, graphDir: string }} options
 * @returns {import('http').Server}
 */
function createServer({ publicDir, tasksDbDir, graphDir }) {
  const fallbackTasksDbDir = path.join(publicDir, 'tasksDB');
  maybeBootstrapTasksDb(tasksDbDir, fallbackTasksDbDir);

  // Auto-discover a project directory under external/ or local/ scopes.
  function resolveProjectRelativeDir(baseDir, projectId) {
    if (!projectId) return '';
    for (const relativeDir of [path.join('external', projectId), path.join('local', projectId), projectId]) {
      if (fs.existsSync(path.join(baseDir, relativeDir))) return relativeDir;
    }
    return '';
  }

  function ensureRelativeProjectDir(relativeDir) {
    const normalized = normalizeRelativePath(relativeDir);
    if (!normalized) return tasksDbDir;

    const relativeFsPath = normalized.split('/').join(path.sep);
    const targetDir = path.join(tasksDbDir, relativeFsPath);
    if (fs.existsSync(targetDir)) return targetDir;

    const fallbackDir = path.join(fallbackTasksDbDir, relativeFsPath);
    if (fs.existsSync(fallbackDir)) {
      ensureDir(path.dirname(targetDir));
      copyDirRecursive(fallbackDir, targetDir);
      return targetDir;
    }

    return targetDir;
  }

  function resolveProjectDir(projectId) {
    if (!projectId) return tasksDbDir;

    const existingRelative = resolveProjectRelativeDir(tasksDbDir, projectId);
    if (existingRelative) return path.join(tasksDbDir, existingRelative);

    const fallbackRelative = resolveProjectRelativeDir(fallbackTasksDbDir, projectId);
    if (fallbackRelative) return ensureRelativeProjectDir(fallbackRelative);

    // Backward-compat: fall back to flat layout
    return path.join(tasksDbDir, projectId);
  }

  // graph-display is published alongside index.html under /public.
  const effectiveGraphDir = graphDir || path.join(publicDir, 'graph-display');

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const pathname = url.pathname;

      if (pathname === '/api/health') {
        return sendJson(res, 200, { ok: true });
      }

      // GET /api/projects — list discovered projects by scanning external/ and local/ dirs
      if (pathname === '/api/projects' && req.method === 'GET') {
        const result = [];
        const seen = new Set();
        for (const baseDir of [tasksDbDir, fallbackTasksDbDir]) {
          for (const scope of ['external', 'local']) {
            const scopeDir = path.join(baseDir, scope);
            if (!fs.existsSync(scopeDir)) continue;
            let entries;
            try { entries = fs.readdirSync(scopeDir, { withFileTypes: true }); } catch { continue; }
            for (const entry of entries) {
              if (!entry.isDirectory()) continue;
              const key = `${scope}:${entry.name}`;
              if (seen.has(key)) continue;
              seen.add(key);
              result.push({ id: entry.name, scope });
            }
          }
        }
        return sendJson(res, 200, { projects: result });
      }

      // GET /api/module?project=P&path=relative/path — safely serve a module task file
      if (pathname === '/api/module' && req.method === 'GET') {
        const projectId = sanitizeProjectId(url.searchParams.get('project'));
        const modulePath = url.searchParams.get('path');
        if (!projectId || !modulePath) {
          return sendJson(res, 400, { ok: false, error: 'project and path are required' });
        }
        const projectDir = resolveProjectDir(projectId);
        const moduleFilePath = safeJoin(projectDir, modulePath);
        if (!moduleFilePath) {
          return sendJson(res, 400, { ok: false, error: 'Invalid module path' });
        }
        if (!fs.existsSync(moduleFilePath)) {
          return sendJson(res, 404, { ok: false, error: 'Module file not found' });
        }
        const raw = fs.readFileSync(moduleFilePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(raw);
        return;
      }

      // GET /api/scan-path?path=relative/or/absolute — scan a folder for tasks.json files
      // Allows the UI to dynamically discover and load projects from a given path.
      if (pathname === '/api/scan-path' && req.method === 'GET') {
        const rawRequestedPath = url.searchParams.get('path') || '';
        if (!rawRequestedPath) {
          return sendJson(res, 400, { ok: false, error: 'path parameter is required' });
        }
        // Resolve to an absolute path; allow both absolute paths (on the server machine) and paths relative to publicDir
        let resolvedScanPath = path.isAbsolute(rawRequestedPath)
          ? rawRequestedPath
          : path.resolve(publicDir, rawRequestedPath.replace(/\\/g, path.sep));
        // Security: must stay within publicDir or tasksDbDir parent to prevent traversal
        const allowedRoots = [
          path.resolve(publicDir),
          path.resolve(tasksDbDir),
          path.resolve(path.join(publicDir, 'tasksDB'))
        ];
        const resolvedNorm = path.resolve(resolvedScanPath);
        const isAllowed = allowedRoots.some(root => resolvedNorm.startsWith(root));
        if (!isAllowed) {
          return sendJson(res, 403, { ok: false, error: 'Path is outside the allowed data roots' });
        }
        if (!fs.existsSync(resolvedNorm) || !fs.statSync(resolvedNorm).isDirectory()) {
          return sendJson(res, 404, { ok: false, error: 'Directory not found: ' + rawRequestedPath });
        }

        // Discover all tasks.json files under the path
        const discovered = discoverProjectTaskFiles(resolvedNorm);
        // Build a module list from discovered files
        const taskFiles = discovered.map(rel => {
          const absPath = path.join(resolvedNorm, rel.split('/').join(path.sep));
          const raw = readJsonFile(absPath) || {};
          const proj = (raw.project && typeof raw.project === 'object') ? raw.project : {};
          const modInfo = (raw.module && typeof raw.module === 'object') ? raw.module : {};
          const taskList = Array.isArray(raw.tasks) ? raw.tasks : [];
          const name = String(modInfo.name || proj.name || path.basename(path.dirname(absPath)) || rel).trim();
          return {
            relativePath: rel,
            name,
            label: String(modInfo.label || name),
            taskCount: taskList.length,
            description: String(raw.description || proj.description || '').trim() || null,
            status: String(proj.status || '').trim() || null,
            department: inferModuleDepartment(rel),
            type: inferModuleType(rel, modInfo)
          };
        });

        // Determine if there is a root module
        const rootModuleRelative = resolveRootModuleRelative(resolvedNorm, readJsonFile(path.join(resolvedNorm, 'tasks.json')));
        const rootData = readJsonFile(path.join(resolvedNorm, 'tasks.json'));
        const projectName = (() => {
          if (rootData && rootData.project && rootData.project.name) return rootData.project.name;
          return path.basename(resolvedNorm);
        })();

        // Compute URL path accessible from the browser (relative to publicDir)
        const relativeToPublic = path.relative(publicDir, resolvedNorm);
        const serverRelDir = relativeToPublic.split(path.sep).join('/');
        const rootModuleName = rootModuleRelative || 'tasks.json';
        const tasksJsonUrl = `/${serverRelDir}/${rootModuleName}`;

        return sendJson(res, 200, {
          ok: true,
          scanPath: rawRequestedPath,
          resolvedPath: resolvedNorm,
          projectName,
          rootModule: rootModuleRelative,
          tasksJsonUrl,
          files: taskFiles
        });
      }

      if (pathname === '/api/tasks') {
        const projectId = sanitizeProjectId(url.searchParams.get('project'));
        const effectiveTasksDbDir = resolveProjectDir(projectId);
        const tasksJsonPath = path.join(effectiveTasksDbDir, 'tasks.json');
        const tasksCsvPath = path.join(effectiveTasksDbDir, 'tasks.csv');

        if (req.method === 'GET') {
          const synchronized = buildProjectPayload(effectiveTasksDbDir);
          if (!synchronized || !synchronized.payload) {
            return sendJson(res, 404, { ok: false, error: 'tasks.json not found' });
          }
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
          });
          res.end(JSON.stringify(synchronized.payload, null, 2));
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
          writeProjectPayload(effectiveTasksDbDir, fullData);
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

        const segments = effectivePath.replace(/^\/+/, '').split('/').filter(Boolean);
        if (segments.length > 0) {
          const relativeProjectDir = (segments[0] === 'external' || segments[0] === 'local')
            ? segments.slice(0, 2).join('/')
            : segments[0];
          if (relativeProjectDir) ensureRelativeProjectDir(relativeProjectDir);
        }

        // Serve synchronized project payloads for tasks.json so the graph always sees
        // the canonical root project file plus the generated navigation index.
        if (pathname.endsWith('/tasks.json')) {
          const relativeProjectDir = pathname
            .replace(/^\/tasksDB\//, '')
            .replace(/\/tasks\.json$/i, '');
          const projectDir = ensureRelativeProjectDir(relativeProjectDir);
          const synchronized = projectDir ? buildProjectPayload(projectDir) : null;
          if (synchronized && synchronized.payload) {
            res.writeHead(200, {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store'
            });
            res.end(JSON.stringify(synchronized.payload, null, 2));
            return;
          }
        }
      }

      // Serve graph-display as a sibling static app (lives outside /public).
      if (pathname.startsWith('/graph-display/')) {
        serveRoot = effectiveGraphDir;
        effectivePath = pathname.replace(/^\/graph-display/, '');
        if (!effectivePath) effectivePath = '/';
        if (effectivePath === '/') effectivePath = '/index.html';
      }
      
      const filePath = safeJoin(serveRoot, effectivePath);
      if (!filePath) {
        res.writeHead(400);
        res.end('Bad request');
        return;
      }

      let resolvedFilePath = filePath;
      if (fs.existsSync(resolvedFilePath) && fs.statSync(resolvedFilePath).isDirectory()) {
        const indexPath = path.join(resolvedFilePath, 'index.html');
        if (fs.existsSync(indexPath)) {
          resolvedFilePath = indexPath;
        }
      }

      if (!fs.existsSync(resolvedFilePath) || fs.statSync(resolvedFilePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ct = contentTypeFor(resolvedFilePath);
      const isTasksDbAsset = pathname.startsWith('/tasksDB/') && (resolvedFilePath.endsWith('.json') || resolvedFilePath.endsWith('.csv'));
      res.writeHead(200, {
        'Content-Type': ct,
        ...(isTasksDbAsset ? { 'Cache-Control': 'no-store' } : {})
      });
      fs.createReadStream(resolvedFilePath).pipe(res);
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
  const graphDir = path.join(publicDir, 'graph-display');
  const tasksDbDir = process.env.TASKS_DB_DIR
    ? path.resolve(process.env.TASKS_DB_DIR)
    : path.join(publicDir, 'tasksDB');

  const port = Number(process.env.PORT || 3000);
  const server = createServer({ publicDir, tasksDbDir, graphDir });
  server.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
    console.log(`Tasks DB dir: ${tasksDbDir}`);
  });
}

module.exports = { createServer };
