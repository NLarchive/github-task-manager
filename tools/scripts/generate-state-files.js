/**
 * generate-state-files.js
 * -----------------------
 * Generates derived state JSON files from public/tasksDB/<scope>/<project>/node.tasks.json
 * Output: public/tasksDB/<scope>/<project>/state/*.json
 * Usage: node tools/scripts/generate-state-files.js <projectId>
 */
const fs = require('fs');
const path = require('path');

/** Ensure that a directory exists before writing derived files. */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/** Write a JSON file with pretty-printed output. */
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/** Generate derived state payloads from a task list. */
function generateStateData(tasks) {
  const now = new Date().toISOString();
  const byStatus = {};

  for (const task of tasks || []) {
    const status = (task && task.status) ? String(task.status) : 'Unknown';
    byStatus[status] = byStatus[status] || [];
    byStatus[status].push(task);
  }

  const summary = {
    generated_at: now,
    total_tasks: (tasks || []).length,
    counts_by_status: Object.fromEntries(Object.entries(byStatus).map(([k, v]) => [k, v.length])),
    tasks_by_status: byStatus
  };

  const makeStatusPayload = (status, aliases = []) => ({
    status,
    generated_at: now,
    tasks: [status, ...aliases].flatMap((value) => byStatus[value] || [])
  });

  return {
    summary,
    notStarted: makeStatusPayload('Not Started'),
    inProgress: makeStatusPayload('In Progress'),
    completed: makeStatusPayload('Done', ['Completed'])
  };
}

/** Run the script entrypoint for this file. */
function main() {
  const repoRoot = path.join(__dirname, '..', '..');
  const projectId = (process.argv[2] || 'github-task-manager').replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
  const tasksDbRoot = path.join(repoRoot, 'public', 'tasksDB');
  // Auto-discover scope
  let projectDir = null;
  for (const scope of ['external', 'local', '']) {
    const candidate = scope ? path.join(tasksDbRoot, scope, projectId) : path.join(tasksDbRoot, projectId);
    if (fs.existsSync(path.join(candidate, 'node.tasks.json'))) { projectDir = candidate; break; }
  }
  if (!projectDir) { console.error(`node.tasks.json not found for project: ${projectId}`); process.exit(1); }
  const tasksJsonPath = path.join(projectDir, 'node.tasks.json');
  const stateDir = path.join(projectDir, 'state');

  if (!fs.existsSync(tasksJsonPath)) {
    console.error(`node.tasks.json not found at: ${tasksJsonPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(tasksJsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  const tasks = (parsed && Array.isArray(parsed.tasks)) ? parsed.tasks : (Array.isArray(parsed) ? parsed : []);

  ensureDir(stateDir);

  const { summary, notStarted, inProgress, completed } = generateStateData(tasks);
  writeJson(path.join(stateDir, 'tasks-by-status.json'), summary);
  writeJson(path.join(stateDir, 'tasks-not-started.json'), notStarted);
  writeJson(path.join(stateDir, 'tasks-in-progress.json'), inProgress);
  writeJson(path.join(stateDir, 'tasks-completed.json'), completed);

  console.log(`Generated state files in: ${stateDir}`);
  console.log(`Total tasks: ${tasks.length}`);
}

main();
