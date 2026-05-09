/**
 * Local development server and runtime API bridge for the public TaskDB apps.
 *
 * This module serves the static frontend under `public/`, exposes project and
 * module discovery endpoints for local workflows, and persists `node.tasks.json`,
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
 * Scan a folder structure and extract relations to build code.graph.json
 * @param {string} folderPath
 * @param {number} maxDepth
 * @returns {object}
 */
function scanFolderToGraph(folderPath, maxDepth = 5) {
  const nodes = {};
  const edges = {};
  let edgeCounter = 0;

  function generateId(type, name) {
    return `${type}_${name.replace(/[^a-z0-9]/gi, '_')}`.toLowerCase();
  }

  function scanFolder(currentPath, parentId, depth) {
    if (depth > maxDepth) return;

    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip excluded directories
        if (entry.isDirectory() && ['node_modules', '.git', '.next', 'dist', 'build', '.venv', '.env'].includes(entry.name)) {
          continue;
        }

        const fullPath = path.join(currentPath, entry.name);
        const nodeId = generateId(entry.isDirectory() ? 'layer' : 'file', entry.name);

        if (entry.isDirectory()) {
          // Create layer node for subfolder
          const layerNode = {
            id: nodeId,
            type: 'layer',
            label: entry.name,
            path: fullPath,
            parent: parentId,
            description: '',
            inputs: [],
            outputs: [],
            children: [],
            edgeIds: [],
            meta: { lifecycle: 'discovered', nodeCount: 0, taskCount: 0 }
          };
          nodes[nodeId] = layerNode;

          // Create edge from parent to this layer
          if (parentId) {
            const edgeId = `edge_${edgeCounter++}`;
            edges[edgeId] = {
              id: edgeId,
              source: parentId,
              target: nodeId,
              type: 'contains',
              direction: 'forward'
            };
          }

          // Try to read README
          const readmePath = path.join(fullPath, 'README.md');
          if (fs.existsSync(readmePath)) {
            try {
              const content = fs.readFileSync(readmePath, 'utf8');
              const match = content.match(/^[^\n]+\n(.*?)(?:\n#|\n\n|$)/s);
              layerNode.description = match ? match[1].trim() : content.substring(0, 200);
            } catch {}
          }

          // Try to read tasks
          const tasksPath = path.join(fullPath, 'node.tasks.json');
          if (fs.existsSync(tasksPath)) {
            try {
              const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
              if (tasksData.tasks) {
                layerNode.meta.taskCount = tasksData.tasks.length;
                layerNode.meta.hasTasks = true;
              }
            } catch {}
          }

          // Recursively scan subfolder
          scanFolder(fullPath, nodeId, depth + 1);
        } else {
          // Create file node
          const ext = path.extname(entry.name).toLowerCase();
          let fileType = 'file';
          if (ext === '.js' || ext === '.ts') fileType = 'code';
          if (ext === '.json') fileType = 'config';
          if (ext === '.md') fileType = 'documentation';
          if (ext === '.csv') fileType = 'data';

          const fileNode = {
            id: nodeId,
            type: fileType,
            label: entry.name,
            path: fullPath,
            parent: parentId,
            description: '',
            inputs: [],
            outputs: [],
            dependencies: [],
            exports: [],
            edgeIds: [],
            meta: { lifecycle: 'discovered' }
          };
          nodes[nodeId] = fileNode;

          // Create edge from layer to file
          if (parentId) {
            const edgeId = `edge_${edgeCounter++}`;
            edges[edgeId] = {
              id: edgeId,
              source: parentId,
              target: nodeId,
              type: 'contains',
              direction: 'forward'
            };
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning folder ${currentPath}:`, error.message);
    }
  }

  // Create root layer node
  const rootId = generateId('layer', path.basename(folderPath) || 'root');
  nodes[rootId] = {
    id: rootId,
    type: 'layer',
    label: path.basename(folderPath) || 'root',
    path: folderPath,
    parent: null,
    description: '',
    inputs: [],
    outputs: [],
    children: [],
    edgeIds: [],
    meta: { lifecycle: 'discovered', nodeCount: 0, taskCount: 0 }
  };

  // Start scanning
  scanFolder(folderPath, rootId, 0);

  return {
    rootId,
    nodes,
    edges,
    metadata: {
      scanDate: new Date().toISOString(),
      rootPath: folderPath,
      nodeCount: Object.keys(nodes).length,
      edgeCount: Object.keys(edges).length,
      warnings: []
    }
  };
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

const ALLOWED_API_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3100',
  'http://127.0.0.1:3100',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://nlarchive.github.io'
]);

/**
 * Apply CORS headers for API endpoints using a strict allowlist.
 * Requests without Origin (same-origin or CLI) are allowed.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean}
 */
function applyApiCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (!ALLOWED_API_ORIGINS.has(origin)) return false;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, If-None-Match');
  res.setHeader('Access-Control-Expose-Headers', 'ETag');
  res.setHeader('Vary', 'Origin');
  return true;
}

/**
 * Return ETag for a project's canonical node.tasks.json file.
 *
 * @param {string} projectDir
 * @returns {string}
 */
function getProjectETag(projectDir) {
  try {
    const targetFile = path.join(projectDir, 'node.tasks.json');
    const stats = fs.statSync(targetFile);
    return `"${Math.floor(stats.mtimeMs)}"`;
  } catch {
    return '"0"';
  }
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
const TASK_FILE_CANDIDATES = ['node.tasks.json', 'TODO_project_task.json'];

/** Directories skipped while scanning project modules and derived artifacts. */
const DISCOVERY_IGNORED_DIRS = new Set(['history', 'state', 'tour', 'node_modules', '.git']);

/** Directories skipped while scanning the broader repository tree for project-index.html. */
const PROJECT_TREE_IGNORED_DIRS = new Set([
  ...DISCOVERY_IGNORED_DIRS,
  'playwright-report',
  'test-results',
  '.wrangler'
]);

/** Text preview cap for file-content responses. */
const TEXT_PREVIEW_MAX_BYTES = 160000;

/** Extensions that are safe to preview as text without further inspection. */
const TEXT_PREVIEW_EXTENSIONS = new Set([
  '.agent',
  '.bat',
  '.cjs',
  '.cmd',
  '.css',
  '.csv',
  '.env',
  '.gitignore',
  '.html',
  '.instructions',
  '.java',
  '.js',
  '.json',
  '.jsonl',
  '.jsx',
  '.less',
  '.log',
  '.md',
  '.mjs',
  '.ps1',
  '.prompt',
  '.py',
  '.scss',
  '.sh',
  '.skill',
  '.sql',
  '.svg',
  '.toml',
  '.ts',
  '.tsx',
  '.txt',
  '.xml',
  '.yaml',
  '.yml'
]);

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
 * Get a lowercase file extension for project tree summaries.
 *
 * @param {string} fileName
 * @returns {string}
 */
function getProjectFileExtension(fileName) {
  return String(path.extname(String(fileName || '')) || '').toLowerCase();
}

/**
 * Determine whether a repository directory should be skipped from project tree scans.
 *
 * @param {import('fs').Dirent} entry
 * @returns {boolean}
 */
function shouldSkipProjectTreeEntry(entry) {
  return Boolean(entry && entry.isDirectory && entry.isDirectory() && PROJECT_TREE_IGNORED_DIRS.has(entry.name));
}

/**
 * Recursively count descendant files/directories for a repository folder snapshot.
 *
 * @param {string} dirPath
 * @returns {{directFileCount: number, directDirectoryCount: number, descendantFileCount: number, descendantDirectoryCount: number, totalFileCount: number, totalDirectoryCount: number, totalNodeCount: number}}
 */
function countProjectTreeStats(dirPath) {
  const entries = readDirectoryEntries(dirPath);
  let directFileCount = 0;
  let directDirectoryCount = 0;
  let descendantFileCount = 0;
  let descendantDirectoryCount = 0;

  for (const entry of entries) {
    if (!entry) continue;
    if (entry.isDirectory()) {
      if (shouldSkipProjectTreeEntry(entry)) continue;
      directDirectoryCount += 1;
      const childStats = countProjectTreeStats(path.join(dirPath, entry.name));
      descendantDirectoryCount += 1 + childStats.descendantDirectoryCount;
      descendantFileCount += childStats.directFileCount + childStats.descendantFileCount;
      continue;
    }
    if (entry.isFile()) directFileCount += 1;
  }

  const totalFileCount = directFileCount + descendantFileCount;
  const totalDirectoryCount = directDirectoryCount + descendantDirectoryCount;
  return {
    directFileCount,
    directDirectoryCount,
    descendantFileCount,
    descendantDirectoryCount,
    totalFileCount,
    totalDirectoryCount,
    totalNodeCount: totalFileCount + totalDirectoryCount
  };
}

/**
 * Build a file node summary for the project explorer.
 *
 * @param {string} rootDir
 * @param {string} filePath
 * @returns {object}
 */
function buildProjectFileSummary(rootDir, filePath) {
  const stat = fs.statSync(filePath);
  const relativePath = normalizeRelativePath(path.relative(rootDir, filePath));
  const extension = getProjectFileExtension(filePath);
  return {
    kind: 'file',
    name: path.basename(filePath),
    relativePath,
    extension,
    sizeBytes: stat.size,
    totalNodeCount: 1,
    contentType: contentTypeFor(filePath)
  };
}

/**
 * Build a folder node summary for the project explorer.
 *
 * @param {string} rootDir
 * @param {string} dirPath
 * @returns {object}
 */
function buildProjectDirectorySummary(rootDir, dirPath) {
  const stats = countProjectTreeStats(dirPath);
  const relativePath = normalizeRelativePath(path.relative(rootDir, dirPath));
  return {
    kind: 'directory',
    name: relativePath ? path.basename(dirPath) : path.basename(rootDir),
    relativePath,
    directFileCount: stats.directFileCount,
    directDirectoryCount: stats.directDirectoryCount,
    descendantFileCount: stats.descendantFileCount,
    descendantDirectoryCount: stats.descendantDirectoryCount,
    totalFileCount: stats.totalFileCount,
    totalDirectoryCount: stats.totalDirectoryCount,
    totalNodeCount: stats.totalNodeCount
  };
}

/**
 * Build a one-level directory snapshot with child metadata and descendant counts.
 *
 * @param {string} rootDir
 * @param {string} relativePath
 * @returns {{directory: object, breadcrumbs: { name: string, relativePath: string }[]}}
 */
function buildProjectTreeSnapshot(rootDir, relativePath = '') {
  const normalizedRelativePath = normalizeRelativePath(relativePath);
  const targetDir = normalizedRelativePath ? safeJoin(rootDir, normalizedRelativePath) : rootDir;
  if (!targetDir || !fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    throw new Error('Directory snapshot target is invalid.');
  }

  const children = readDirectoryEntries(targetDir)
    .filter((entry) => entry && (entry.isDirectory() || entry.isFile()))
    .filter((entry) => !shouldSkipProjectTreeEntry(entry))
    .sort((left, right) => {
      const leftRank = left.isDirectory() ? 0 : 1;
      const rightRank = right.isDirectory() ? 0 : 1;
      if (leftRank !== rightRank) return leftRank - rightRank;
      return left.name.localeCompare(right.name);
    })
    .map((entry) => {
      const entryPath = path.join(targetDir, entry.name);
      return entry.isDirectory()
        ? buildProjectDirectorySummary(rootDir, entryPath)
        : buildProjectFileSummary(rootDir, entryPath);
    });

  const breadcrumbs = [{ name: path.basename(rootDir), relativePath: '' }];
  if (normalizedRelativePath) {
    const parts = normalizedRelativePath.split('/');
    parts.forEach((part, index) => {
      breadcrumbs.push({
        name: part,
        relativePath: parts.slice(0, index + 1).join('/')
      });
    });
  }

  return {
    directory: {
      ...buildProjectDirectorySummary(rootDir, targetDir),
      children
    },
    breadcrumbs
  };
}

/**
 * Determine whether a file buffer should be treated as text for preview.
 *
 * @param {string} filePath
 * @param {Buffer} buffer
 * @returns {boolean}
 */
function isTextPreviewFile(filePath, buffer) {
  const extension = getProjectFileExtension(filePath);
  if (TEXT_PREVIEW_EXTENSIONS.has(extension)) return true;
  const sample = buffer.subarray(0, Math.min(buffer.length, 1024));
  for (const byte of sample) {
    if (byte === 0) return false;
  }
  return true;
}

/**
 * Read a safe text preview payload for a repository file.
 *
 * @param {string} rootDir
 * @param {string} relativePath
 * @returns {object}
 */
function buildProjectFilePreview(rootDir, relativePath) {
  const normalizedRelativePath = normalizeRelativePath(relativePath);
  const filePath = normalizedRelativePath ? safeJoin(rootDir, normalizedRelativePath) : null;
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error('File preview target is invalid.');
  }

  const stat = fs.statSync(filePath);
  const buffer = fs.readFileSync(filePath);
  const isText = isTextPreviewFile(filePath, buffer);
  const previewContent = isText
    ? buffer.toString('utf8', 0, TEXT_PREVIEW_MAX_BYTES)
    : `[Binary preview unavailable for ${path.basename(filePath)}]`;

  return {
    ...buildProjectFileSummary(rootDir, filePath),
    isText,
    truncated: isText && buffer.length > TEXT_PREVIEW_MAX_BYTES,
    content: previewContent
  };
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
  if (normalized === 'src/node.tasks.json') score += 120;
  if (normalized === 'src/TODO_project_task.json') score += 115;
  if (normalized === 'node.tasks.json') score += 105;
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

  for (const candidate of ['src/node.tasks.json', 'src/TODO_project_task.json', 'node.tasks.json', 'TODO_project_task.json']) {
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
  if (tasksIndexData) return 'node.tasks.json';
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
    if (relativePath === 'node.tasks.json') continue;
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
  const rootDir = normalizeRelativePath(rootModuleRelative || 'src/node.tasks.json').replace(/\/[^\/]*$/, '');
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
  const tasksJsonPath = path.join(projectDir, 'node.tasks.json');
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
        : resolveRootModuleRelative(projectDir, fullData) || 'node.tasks.json'
  );
  const tasksJsonPath = path.join(projectDir, 'node.tasks.json');
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
    const registrySrc = path.join(fallbackDir, 'registry.json');
    const registryDst = path.join(tasksDbDir, 'registry.json');
    if (!fs.existsSync(registryDst) && fs.existsSync(registrySrc)) {
      fs.copyFileSync(registrySrc, registryDst);
    }

    // Prefer bootstrapping the default project folder (multi-project layout)
    const defaultProject = 'github-task-manager';
    const preferredProjectLayouts = [
      {
        srcDir: path.join(fallbackDir, 'external', defaultProject),
        dstDir: path.join(tasksDbDir, 'external', defaultProject)
      },
      {
        srcDir: path.join(fallbackDir, defaultProject),
        dstDir: path.join(tasksDbDir, defaultProject)
      }
    ];

    const bootstrapPair = (srcDir, dstDir) => {
      ensureDir(dstDir);
      const jsonSrc = path.join(srcDir, 'node.tasks.json');
      const csvSrc = path.join(srcDir, 'tasks.csv');
      const jsonDst = path.join(dstDir, 'node.tasks.json');
      const csvDst = path.join(dstDir, 'tasks.csv');
      if (!fs.existsSync(jsonDst) && fs.existsSync(jsonSrc)) fs.copyFileSync(jsonSrc, jsonDst);
      if (!fs.existsSync(csvDst) && fs.existsSync(csvSrc)) fs.copyFileSync(csvSrc, csvDst);
    };

    for (const layout of preferredProjectLayouts) {
      if (!fs.existsSync(layout.srcDir)) continue;
      bootstrapPair(layout.srcDir, layout.dstDir);
      return;
    }

    // Legacy fallback (single-project layout)
    const jsonPath = path.join(tasksDbDir, 'node.tasks.json');
    const csvPath = path.join(tasksDbDir, 'tasks.csv');
    if (!fs.existsSync(jsonPath) && fs.existsSync(path.join(fallbackDir, 'node.tasks.json'))) {
      fs.copyFileSync(path.join(fallbackDir, 'node.tasks.json'), jsonPath);
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
 * @param {{ publicDir: string, tasksDbDir: string, graphDir: string, repoRoot?: string }} options
 * @returns {import('http').Server}
 */
function createServer({ publicDir, tasksDbDir, graphDir, repoRoot }) {
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
  const effectiveRepoRoot = repoRoot ? path.resolve(repoRoot) : path.resolve(publicDir, '..');

  function resolveProjectExplorerTarget(rootKey, relativePath = '') {
    const normalizedRootKey = String(rootKey || 'repo').trim().toLowerCase();
    const baseDir = {
      repo: effectiveRepoRoot,
      public: path.resolve(publicDir),
      tasksdb: path.resolve(tasksDbDir),
      graph: path.resolve(effectiveGraphDir)
    }[normalizedRootKey];

    if (!baseDir) {
      return { error: 'Unsupported project root. Use repo, public, tasksdb, or graph.' };
    }

    const normalizedRelativePath = normalizeRelativePath(relativePath);
    const targetPath = normalizedRelativePath ? safeJoin(baseDir, normalizedRelativePath) : baseDir;
    if (!targetPath) {
      return { error: 'Invalid project path.' };
    }

    return {
      rootKey: normalizedRootKey,
      baseDir,
      normalizedRelativePath,
      targetPath
    };
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const pathname = url.pathname;

      if (pathname.startsWith('/api/')) {
        const corsAllowed = applyApiCors(req, res);
        if (!corsAllowed) {
          return sendJson(res, 403, { ok: false, error: 'Forbidden origin' });
        }

        if (req.method === 'OPTIONS') {
          res.writeHead(204, { 'Access-Control-Max-Age': '86400' });
          return res.end();
        }
      }

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

      // GET /api/project-tree?root=repo&path=relative/path — browse one directory level at a time.
      if (pathname === '/api/project-tree' && req.method === 'GET') {
        const target = resolveProjectExplorerTarget(url.searchParams.get('root'), url.searchParams.get('path') || '');
        if (target.error) {
          return sendJson(res, 400, { ok: false, error: target.error });
        }
        if (!fs.existsSync(target.targetPath) || !fs.statSync(target.targetPath).isDirectory()) {
          return sendJson(res, 404, { ok: false, error: 'Directory not found' });
        }

        const snapshot = buildProjectTreeSnapshot(target.baseDir, target.normalizedRelativePath);
        return sendJson(res, 200, {
          ok: true,
          root: target.rootKey,
          directory: snapshot.directory,
          breadcrumbs: snapshot.breadcrumbs
        });
      }

      // GET /api/file-content?root=repo&path=relative/path — preview a text file inside an allowed root.
      if (pathname === '/api/file-content' && req.method === 'GET') {
        const rawPath = url.searchParams.get('path') || '';
        if (!rawPath) {
          return sendJson(res, 400, { ok: false, error: 'path parameter is required' });
        }

        const target = resolveProjectExplorerTarget(url.searchParams.get('root'), rawPath);
        if (target.error) {
          return sendJson(res, 400, { ok: false, error: target.error });
        }
        if (!fs.existsSync(target.targetPath) || !fs.statSync(target.targetPath).isFile()) {
          return sendJson(res, 404, { ok: false, error: 'File not found' });
        }

        return sendJson(res, 200, {
          ok: true,
          root: target.rootKey,
          file: buildProjectFilePreview(target.baseDir, target.normalizedRelativePath)
        });
      }

      // GET /api/scan-path?path=relative/or/absolute — scan a folder for node.tasks.json files
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

        // Discover all node.tasks.json files under the path
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
        const rootModuleRelative = resolveRootModuleRelative(resolvedNorm, readJsonFile(path.join(resolvedNorm, 'node.tasks.json')));
        const rootData = readJsonFile(path.join(resolvedNorm, 'node.tasks.json'));
        const projectName = (() => {
          if (rootData && rootData.project && rootData.project.name) return rootData.project.name;
          return path.basename(resolvedNorm);
        })();

        // Compute URL path accessible from the browser (relative to publicDir)
        const relativeToPublic = path.relative(publicDir, resolvedNorm);
        const serverRelDir = relativeToPublic.split(path.sep).join('/');
        const rootModuleName = rootModuleRelative || 'node.tasks.json';
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

      // POST /api/create-project — create a new local project with a starter node.tasks.json
      if (pathname === '/api/create-project' && req.method === 'POST') {
        const body = await readBody(req);
        let requestBody;
        try { requestBody = JSON.parse(body || '{}'); } catch { return sendJson(res, 400, { ok: false, error: 'Invalid JSON body' }); }
        const rawName = String(requestBody.projectName || '').trim();
        if (!rawName) return sendJson(res, 400, { ok: false, error: 'projectName is required' });
        const projectId = rawName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '') || null;
        if (!projectId) return sendJson(res, 400, { ok: false, error: 'Invalid project name' });
        // Always create under local/
        const projectRelDir = path.join('local', projectId);
        const projectDir = path.join(tasksDbDir, projectRelDir);
        if (fs.existsSync(projectDir)) {
          return sendJson(res, 409, { ok: false, error: `Project "${projectId}" already exists` });
        }
        const starterPayload = {
          project: { name: rawName, description: '', start_date: new Date().toISOString().slice(0, 10), status: 'Not Started' },
          categories: [{ name: 'General', parent_category_name: null }],
          workers: [],
          tasks: [
            { task_id: 1, task_name: 'Project Setup', description: 'Initial project setup', priority: 'High', status: 'Not Started', estimated_hours: 4, dependencies: [], subtasks: [] }
          ]
        };
        ensureDir(projectDir);
        writeProjectPayload(projectDir, starterPayload);
        fs.writeFileSync(path.join(projectDir, 'tasks.csv'), generatePersistedCSV(starterPayload.tasks), 'utf8');
        writeStateFiles(projectDir, starterPayload);
        return sendJson(res, 201, { ok: true, projectId, templateId: `${projectId}-tasks`, scope: 'local', path: `local/${projectId}` });
      }

      // POST /api/scanner/scan — scan a folder structure and extract relations to build code.graph.json
      if (pathname === '/api/scanner/scan' && req.method === 'POST') {
        const body = await readBody(req);
        let requestBody;
        try { requestBody = JSON.parse(body || '{}'); } catch { return sendJson(res, 400, { ok: false, error: 'Invalid JSON body' }); }
        
        const rawFolderPath = String(requestBody.folderPath || './').trim();
        const maxDepth = Math.min(parseInt(requestBody.maxDepth || 5), 10);
        
        // Resolve path safely
        let resolvedPath = path.resolve(rawFolderPath);
        
        // Ensure path is within allowed directories
        const allowedRoots = [publicDir, tasksDbDir, path.dirname(publicDir)];
        const isAllowed = allowedRoots.some(root => resolvedPath.startsWith(path.resolve(root)));
        
        if (!isAllowed) {
          return sendJson(res, 403, { ok: false, error: 'Path not allowed' });
        }
        
        if (!fs.existsSync(resolvedPath)) {
          return sendJson(res, 404, { ok: false, error: 'Folder not found' });
        }
        
        try {
          const graph = scanFolderToGraph(resolvedPath, maxDepth);
          return sendJson(res, 200, graph);
        } catch (error) {
          return sendJson(res, 500, { ok: false, error: error.message });
        }
      }

      // PATCH /api/task — update a single task by task_id
      if (pathname === '/api/task' && req.method === 'PATCH') {
        applyApiCors(req, res);
        const projectId = sanitizeProjectId(url.searchParams.get('project'));
        const taskIdParam = parseInt(url.searchParams.get('task_id'), 10);
        if (!projectId || !Number.isFinite(taskIdParam)) {
          return sendJson(res, 400, { ok: false, error: 'Missing project or task_id query param' });
        }
        const effectiveDir = resolveProjectDir(projectId);
        const body = await readBody(req);
        let updates;
        try { updates = JSON.parse(body || '{}'); } catch { return sendJson(res, 400, { ok: false, error: 'Invalid JSON body' }); }
        const tasksFilePath = path.join(effectiveDir, 'node.tasks.json');
        const current = readJsonFile(tasksFilePath);
        if (!current || !Array.isArray(current.tasks)) {
          return sendJson(res, 404, { ok: false, error: 'Project not found' });
        }
        const idx = current.tasks.findIndex(t => t && t.task_id === taskIdParam);
        if (idx === -1) return sendJson(res, 404, { ok: false, error: `Task ${taskIdParam} not found` });
        // Prevent overwriting the task_id itself
        const { task_id: _ignored, ...safeUpdates } = updates;
        current.tasks[idx] = { ...current.tasks[idx], ...safeUpdates };
        ensureDir(effectiveDir);
        writeProjectPayload(effectiveDir, current);
        const tasksCsvPath = path.join(effectiveDir, 'tasks.csv');
        fs.writeFileSync(tasksCsvPath, generatePersistedCSV(current.tasks), 'utf8');
        writeStateFiles(effectiveDir, current);
        return sendJson(res, 200, { ok: true, task: current.tasks[idx] });
      }

      // POST /api/create-mcp — mark a list of task IDs as critical path
      if (pathname === '/api/create-mcp' && req.method === 'POST') {
        applyApiCors(req, res);
        const body = await readBody(req);
        let payload;
        try { payload = JSON.parse(body || '{}'); } catch { return sendJson(res, 400, { ok: false, error: 'Invalid JSON body' }); }
        const projectId = sanitizeProjectId(payload.project || url.searchParams.get('project') || '');
        const rawIds = Array.isArray(payload.taskIds) ? payload.taskIds : [];
        const numericIds = rawIds.map(Number).filter(Number.isFinite);
        if (!projectId) return sendJson(res, 400, { ok: false, error: 'Missing project' });
        if (numericIds.length === 0) return sendJson(res, 400, { ok: false, error: 'taskIds must be a non-empty array of numbers' });
        const effectiveDir = resolveProjectDir(projectId);
        const tasksFilePath = path.join(effectiveDir, 'node.tasks.json');
        const current = readJsonFile(tasksFilePath);
        if (!current || !Array.isArray(current.tasks)) {
          return sendJson(res, 404, { ok: false, error: 'Project not found' });
        }
        const idSet = new Set(numericIds);
        const notFound = [...idSet].filter(id => !current.tasks.some(t => t && t.task_id === id));
        if (notFound.length > 0) return sendJson(res, 400, { ok: false, error: `Task IDs not found: ${notFound.join(', ')}` });
        let changed = 0;
        current.tasks = current.tasks.map(task => {
          if (!task || !idSet.has(task.task_id)) return task;
          if (!task.is_critical_path) { changed++; return { ...task, is_critical_path: true }; }
          return task;
        });
        ensureDir(effectiveDir);
        writeProjectPayload(effectiveDir, current);
        const tasksCsvPath = path.join(effectiveDir, 'tasks.csv');
        fs.writeFileSync(tasksCsvPath, generatePersistedCSV(current.tasks), 'utf8');
        writeStateFiles(effectiveDir, current);
        return sendJson(res, 200, { ok: true, updated: changed, taskIds: numericIds });
      }

      // OPTIONS preflight for task mutation endpoints
      if ((pathname === '/api/task' || pathname === '/api/create-mcp') && req.method === 'OPTIONS') {
        applyApiCors(req, res);
        res.writeHead(204, { 'Allow': 'OPTIONS, PATCH, POST' });
        res.end();
        return;
      }

      if (pathname === '/api/tasks') {
        const projectId = sanitizeProjectId(url.searchParams.get('project'));
        const effectiveTasksDbDir = resolveProjectDir(projectId);
        const tasksCsvPath = path.join(effectiveTasksDbDir, 'tasks.csv');
        const etag = getProjectETag(effectiveTasksDbDir);

        if (req.method === 'HEAD') {
          res.writeHead(200, {
            'ETag': etag,
            'Cache-Control': 'no-cache'
          });
          res.end();
          return;
        }

        if (req.method === 'GET') {
          const incomingEtag = req.headers['if-none-match'];
          if (incomingEtag && incomingEtag === etag) {
            res.writeHead(304, {
              'ETag': etag,
              'Cache-Control': 'no-cache'
            });
            res.end();
            return;
          }

          const synchronized = buildProjectPayload(effectiveTasksDbDir);
          if (!synchronized || !synchronized.payload) {
            return sendJson(res, 404, { ok: false, error: 'node.tasks.json not found' });
          }
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache',
            'ETag': etag
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

          const nextEtag = getProjectETag(effectiveTasksDbDir);
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'ETag': nextEtag
          });
          res.end(JSON.stringify({ ok: true, tasks: fullData.tasks.length }, null, 2));
          return;
        }

        res.writeHead(405, { 'Allow': 'HEAD, GET, PUT' });
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

        // Serve synchronized project payloads for node.tasks.json so the graph always sees
        // the canonical root project file plus the generated navigation index.
        if (pathname.endsWith('/node.tasks.json')) {
          const relativeProjectDir = pathname
            .replace(/^\/tasksDB\//, '')
            .replace(/\/node\.tasks\.json$/i, '');
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

  if (process.env.RESET_TASKS_DB_ON_START === '1') {
    try {
      fs.rmSync(tasksDbDir, { recursive: true, force: true });
    } catch {
      // Best-effort reset for isolated test runs.
    }
  }

  const port = Number(process.env.PORT || 3000);
  const server = createServer({ publicDir, tasksDbDir, graphDir });
  server.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
    console.log(`Tasks DB dir: ${tasksDbDir}`);
  });
}

module.exports = { createServer };
