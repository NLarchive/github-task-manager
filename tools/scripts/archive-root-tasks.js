const fs = require('fs');
const path = require('path');

function pad2(n) {
  return String(n).padStart(2, '0');
}

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

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
  const rows = tasks.map((task) => fields.map((f) => escapeCsvValue(task ? task[f] : '')).join(','));
  return [header, ...rows].join('\n') + '\n';
}

function main() {
  const repoRoot = path.join(__dirname, '..', '..');
  const legacyPath = path.join(repoRoot, 'tasks.json');
  const historyDir = path.join(repoRoot, 'public', 'tasksDB', 'history');

  if (!fs.existsSync(legacyPath)) {
    console.error('Legacy tasks.json not found at:', legacyPath);
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(historyDir, { recursive: true });

  const raw = fs.readFileSync(legacyPath, 'utf8');
  const stamp = timestamp();
  const outJson = path.join(historyDir, `tasks-root-legacy-${stamp}.json`);
  fs.writeFileSync(outJson, raw, 'utf8');

  // Best-effort: also write a CSV snapshot if JSON parses cleanly.
  try {
    const parsed = JSON.parse(raw);
    const tasks = Array.isArray(parsed) ? parsed : (parsed && parsed.tasks) ? parsed.tasks : [];
    const outCsv = path.join(historyDir, `tasks-root-legacy-${stamp}.csv`);
    fs.writeFileSync(outCsv, generatePersistedCSV(tasks), 'utf8');
  } catch {
    // Keep JSON snapshot only.
  }

  console.log('Archived legacy tasks.json to:', outJson);
}

main();
