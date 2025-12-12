const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

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

  const makeStatusPayload = (status) => ({
    status,
    generated_at: now,
    tasks: byStatus[status] || []
  });

  return {
    summary,
    notStarted: makeStatusPayload('Not Started'),
    inProgress: makeStatusPayload('In Progress'),
    completed: makeStatusPayload('Completed')
  };
}

function main() {
  const repoRoot = path.join(__dirname, '..', '..');
  const projectId = (process.argv[2] || 'github-task-manager').replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
  const tasksJsonPath = path.join(repoRoot, 'public', 'tasksDB', projectId, 'tasks.json');
  const stateDir = path.join(repoRoot, 'public', 'tasksDB', projectId, 'state');

  if (!fs.existsSync(tasksJsonPath)) {
    console.error(`tasks.json not found at: ${tasksJsonPath}`);
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
