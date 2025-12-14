/**
 * TaskDB Task Schema Validator
 *
 * Validates TaskDB project files under public/tasksDB/<projectId>/tasks.json.
 * Focus:
 * - required fields present
 * - date formats + ordering
 * - duplicate task_id
 * - timestamp pollution in task_name (10+ digit sequences)
 * - optional test-task convention: if is_test === true then tags include "e2e-test"
 *
 * Usage:
 *   node tools/scripts/validate-tasks-schema.js ai-career-roadmap
 *   node tools/scripts/validate-tasks-schema.js --all
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function parseArgs(argv) {
  const args = { projects: [], all: false };
  for (const a of argv.slice(2)) {
    if (a === '--all') args.all = true;
    else if (!a.startsWith('-')) args.projects.push(a);
  }
  return args;
}

function sanitizeProjectId(s) {
  return String(s || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

function loadTasksJson(projectId) {
  const tasksPath = path.join(__dirname, '../../public/tasksDB', projectId, 'tasks.json');
  const content = fs.readFileSync(tasksPath, 'utf8');
  return { tasksPath, data: JSON.parse(content) };
}

function isValidDateYYYYMMDD(dateStr) {
  return typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

function hasTimestampPollution(taskName) {
  if (typeof taskName !== 'string') return false;
  // common pattern from earlier test tasks: "... - 1765725892303" (10+ digits)
  return /\b\d{10,}\b/.test(taskName);
}

function validateProjectFile(projectId, tasksJson) {
  const errors = [];
  const warnings = [];

  const PROJECT_STATUS = ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
  const TASK_STATUS = ['Not Started', 'In Progress', 'On Hold', 'Blocked', 'Completed', 'Cancelled', 'Pending Review'];
  const TASK_PRIORITY = ['Low', 'Medium', 'High', 'Critical'];
  const DEPENDENCY_TYPES = ['FS', 'SS', 'FF', 'SF'];

  function requireField(obj, fieldPath) {
    const [root, ...rest] = fieldPath.split('.');
    let cur = obj;
    for (const p of [root, ...rest]) {
      if (cur == null || typeof cur !== 'object' || !(p in cur)) {
        errors.push(`Missing required field: ${fieldPath}`);
        return;
      }
      cur = cur[p];
    }
    if (cur === null || cur === undefined || cur === '') {
      errors.push(`Missing required field: ${fieldPath}`);
    }
  }

  function enumField(value, valid, fieldPath) {
    if (value == null) return;
    if (!valid.includes(value)) errors.push(`Invalid ${fieldPath}: "${value}". Valid values: ${valid.join(', ')}`);
  }

  function dateField(value, fieldPath) {
    if (value == null) return;
    if (!isValidDateYYYYMMDD(value)) errors.push(`Invalid date format for ${fieldPath}: "${value}" (expected YYYY-MM-DD)`);
  }

  // Top-level
  if (!tasksJson || typeof tasksJson !== 'object') {
    errors.push('tasks.json root is not an object');
    return { errors, warnings };
  }

  if (!tasksJson.project || typeof tasksJson.project !== 'object') {
    errors.push('Missing project object');
  } else {
    requireField(tasksJson, 'project.name');
    requireField(tasksJson, 'project.start_date');
    requireField(tasksJson, 'project.end_date');
    requireField(tasksJson, 'project.status');
    enumField(tasksJson.project.status, PROJECT_STATUS, 'project.status');
    dateField(tasksJson.project.start_date, 'project.start_date');
    dateField(tasksJson.project.end_date, 'project.end_date');
    if (isValidDateYYYYMMDD(tasksJson.project.start_date) && isValidDateYYYYMMDD(tasksJson.project.end_date)) {
      if (tasksJson.project.start_date > tasksJson.project.end_date) errors.push('Project start_date is after end_date');
    }
  }

  if (!Array.isArray(tasksJson.tasks)) {
    errors.push('Missing or invalid tasks array');
    return { errors, warnings };
  }

  const taskIds = new Set();

  for (let i = 0; i < tasksJson.tasks.length; i++) {
    const task = tasksJson.tasks[i];
    const prefix = `tasks[${i}]`;
    if (!task || typeof task !== 'object') {
      errors.push(`${prefix} is not an object`);
      continue;
    }

    // Required fields
    const required = ['task_id', 'task_name', 'description', 'start_date', 'end_date', 'priority', 'status', 'estimated_hours', 'category_name'];
    for (const f of required) {
      if (task[f] === undefined || task[f] === null || task[f] === '') errors.push(`Missing required field: ${prefix}.${f}`);
    }

    // Types
    if (typeof task.task_id !== 'number' || !Number.isInteger(task.task_id) || task.task_id <= 0) {
      errors.push(`${prefix}.task_id must be a positive integer`);
    } else {
      if (taskIds.has(task.task_id)) errors.push(`Duplicate task_id: ${task.task_id}`);
      taskIds.add(task.task_id);
    }

    enumField(task.status, TASK_STATUS, `${prefix}.status`);
    enumField(task.priority, TASK_PRIORITY, `${prefix}.priority`);

    dateField(task.start_date, `${prefix}.start_date`);
    dateField(task.end_date, `${prefix}.end_date`);
    if (isValidDateYYYYMMDD(task.start_date) && isValidDateYYYYMMDD(task.end_date) && task.start_date > task.end_date) {
      errors.push(`${prefix}.start_date is after end_date`);
    }

    if (typeof task.estimated_hours !== 'number' || task.estimated_hours < 0) errors.push(`${prefix}.estimated_hours must be a non-negative number`);
    if (task.progress_percentage !== undefined) {
      if (typeof task.progress_percentage !== 'number' || task.progress_percentage < 0 || task.progress_percentage > 100) {
        errors.push(`${prefix}.progress_percentage must be between 0 and 100`);
      }
    }

    // Timestamp pollution (skip for intentional test tasks)
    if (task.is_test !== true && hasTimestampPollution(task.task_name)) {
      errors.push(`${prefix}.task_name contains an embedded timestamp-like number (10+ digits): "${task.task_name}"`);
    }

    // Optional test-task convention
    if (task.is_test === true) {
      const tags = Array.isArray(task.tags) ? task.tags : [];
      if (!tags.includes('e2e-test')) {
        errors.push(`${prefix}.is_test is true but tags does not include "e2e-test"`);
      }
    }

    // Dependencies
    if (Array.isArray(task.dependencies)) {
      for (let d = 0; d < task.dependencies.length; d++) {
        const dep = task.dependencies[d];
        const depPrefix = `${prefix}.dependencies[${d}]`;
        if (!dep || typeof dep !== 'object') {
          errors.push(`${depPrefix} is not an object`);
          continue;
        }
        if (dep.type) enumField(dep.type, DEPENDENCY_TYPES, `${depPrefix}.type`);
        if (dep.predecessor_task_id !== undefined) {
          if (typeof dep.predecessor_task_id !== 'number' || dep.predecessor_task_id <= 0) {
            errors.push(`${depPrefix}.predecessor_task_id must be a positive integer`);
          }
        }
      }
    }
  }

  // Dependency reference warning pass (after collecting IDs)
  for (let i = 0; i < tasksJson.tasks.length; i++) {
    const task = tasksJson.tasks[i];
    if (!task || typeof task !== 'object') continue;
    if (!Array.isArray(task.dependencies)) continue;
    for (let d = 0; d < task.dependencies.length; d++) {
      const dep = task.dependencies[d];
      if (!dep || typeof dep !== 'object') continue;
      if (typeof dep.predecessor_task_id === 'number' && !taskIds.has(dep.predecessor_task_id)) {
        warnings.push(`tasks[${i}].dependencies[${d}] references non-existent task_id: ${dep.predecessor_task_id}`);
      }
    }
  }

  return { errors, warnings };
}

function main() {
  const args = parseArgs(process.argv);

  const defaultProjects = ['github-task-manager', 'ai-career-roadmap'];
  const projects = args.all
    ? defaultProjects
    : (args.projects.length ? args.projects : ['ai-career-roadmap']);

  const resolved = projects.map(sanitizeProjectId).filter(Boolean);

  console.log(`${colors.blue}📋 TaskDB Task Schema Validation${colors.reset}`);
  console.log('='.repeat(60));

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const projectId of resolved) {
    console.log(`\n${colors.cyan}Project:${colors.reset} ${projectId}`);
    try {
      const { tasksPath, data } = loadTasksJson(projectId);
      console.log(`${colors.green}✓${colors.reset} Parsed ${path.relative(process.cwd(), tasksPath)}`);

      const { errors, warnings } = validateProjectFile(projectId, data);
      totalErrors += errors.length;
      totalWarnings += warnings.length;

      if (errors.length) {
        console.log(`${colors.red}❌ Errors (${errors.length})${colors.reset}`);
        for (const e of errors) console.log(`  ${colors.red}•${colors.reset} ${e}`);
      } else {
        console.log(`${colors.green}✅ No errors${colors.reset}`);
      }

      if (warnings.length) {
        console.log(`${colors.yellow}⚠ Warnings (${warnings.length})${colors.reset}`);
        for (const w of warnings) console.log(`  ${colors.yellow}•${colors.reset} ${w}`);
      }
    } catch (e) {
      totalErrors += 1;
      console.log(`${colors.red}✗ Failed to validate ${projectId}: ${e && e.message ? e.message : String(e)}${colors.reset}`);
    }
  }

  console.log(`\n${'-'.repeat(60)}`);
  if (totalErrors > 0) {
    console.log(`${colors.red}FAILED${colors.reset} (${totalErrors} errors, ${totalWarnings} warnings)`);
    process.exit(1);
  }
  console.log(`${colors.green}PASSED${colors.reset} (${totalWarnings} warnings)`);
  process.exit(0);
}

main();
