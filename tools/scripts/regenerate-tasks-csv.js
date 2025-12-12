const fs = require('fs');
const path = require('path');

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes('"')) return `"${str.replace(/"/g, '""')}"`;
  if (str.includes(',') || str.includes('\n') || str.includes('\r')) return `"${str}"`;
  return str;
}

function main() {
  const repoRoot = path.join(__dirname, '..', '..');
  const projectId = (process.argv[2] || 'github-task-manager').replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
  const tasksJsonPath = path.join(repoRoot, 'public', 'tasksDB', projectId, 'tasks.json');
  const tasksCsvPath = path.join(repoRoot, 'public', 'tasksDB', projectId, 'tasks.csv');

  const raw = fs.readFileSync(tasksJsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  const tasks = (parsed && Array.isArray(parsed.tasks)) ? parsed.tasks : [];

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
  const csv = [header, ...rows].join('\n') + '\n';

  fs.writeFileSync(tasksCsvPath, csv, 'utf8');
  console.log(`Regenerated tasks.csv with ${tasks.length} rows -> ${tasksCsvPath}`);
}

main();
