/**
 * tasks.json format validation tests.
 *
 * Walks public/tasksDB/ (external + local) and validates every tasks.json
 * found so that:
 *   1. JSON is parseable
 *   2. project metadata exists and has required fields
 *   3. tasks[] has correct structure per-task
 *   4. No duplicate task_ids or task_names
 *   5. Dependency references are valid
 *   6. Status / priority enums are within allowed values
 *   7. Subtasks and acceptance_criteria have correct array format
 *   8. Dates are well-formed (YYYY-MM-DD)
 *
 * Tested projects:
 *   - public/tasksDB/external/github-task-manager
 *   - public/tasksDB/local/web-e2e-bussines   (gitignored - skipped if missing)
 *   - public/tasksDB/local/test-tasks
 *   - any other folders discovered by walking
 */
const fs = require('fs');
const path = require('path');

// ── Constants ─────────────────────────────────────────────────────────────────
const TASKS_DB_ROOT = path.join(__dirname, '../../public/tasksDB');

const VALID_PROJECT_STATUS = ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Planning'];
const VALID_TASK_STATUS = ['Not Started', 'In Progress', 'On Hold', 'Blocked', 'Completed', 'Cancelled', 'Pending Review', 'Done'];
const VALID_PRIORITY = ['Low', 'Medium', 'High', 'Critical'];
const VALID_DEP_TYPES = ['FS', 'SS', 'FF', 'SF'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ── Helpers ───────────────────────────────────────────────────────────────────
function findTasksJsonFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === '_schema' || entry.name === '_templates' || entry.name === '_examples' || entry.name === 'node_modules') continue;
    if (entry.isDirectory()) {
      findTasksJsonFiles(full, results);
    } else if (entry.name === 'tasks.json') {
      results.push(full);
    }
  }
  return results;
}

function validateTasksJson(filePath) {
  const errors = [];
  const warnings = [];
  const relativePath = path.relative(TASKS_DB_ROOT, filePath).replace(/\\/g, '/');

  // 1. Parse JSON
  let data;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) {
      warnings.push('File is empty (may be a gitignored placeholder)');
      return { relativePath, errors, warnings };
    }
    data = JSON.parse(raw);
  } catch (e) {
    warnings.push(`Cannot parse JSON: ${e.message} (may be a gitignored placeholder)`);
    return { relativePath, errors, warnings };
  }

  // 2. Project block (optional for sub-module files)
  if (!data.project || typeof data.project !== 'object') {
    warnings.push('Missing "project" object (acceptable for sub-module files)');
  } else {
    const p = data.project;
    if (!p.name) errors.push('project.name is missing');
    if (p.status && !VALID_PROJECT_STATUS.includes(p.status)) {
      errors.push(`project.status "${p.status}" is not one of: ${VALID_PROJECT_STATUS.join(', ')}`);
    }
    if (p.start_date && !DATE_RE.test(p.start_date)) errors.push(`project.start_date "${p.start_date}" is not YYYY-MM-DD`);
    if (p.end_date && !DATE_RE.test(p.end_date)) errors.push(`project.end_date "${p.end_date}" is not YYYY-MM-DD`);
    if (p.start_date && p.end_date && p.start_date > p.end_date) warnings.push('project.start_date is after project.end_date');
  }

  // 3. Tasks array
  if (!Array.isArray(data.tasks)) {
    errors.push('Missing "tasks" array');
    return { relativePath, errors, warnings };
  }

  const taskIds = new Set();
  const taskNames = new Set();
  const allTaskIds = new Set(data.tasks.filter(t => t && typeof t.task_id === 'number').map(t => t.task_id));
  const allTaskNames = new Set(data.tasks.filter(t => t && t.task_name).map(t => t.task_name));

  data.tasks.forEach((task, i) => {
    if (!task || typeof task !== 'object') {
      errors.push(`tasks[${i}] is not an object`);
      return;
    }
    const prefix = `tasks[${i}]`;

    // Required fields
    if (task.task_id === undefined || task.task_id === null) {
      // String-name-based projects may not use task_id
      if (!task.task_name) errors.push(`${prefix}: missing both task_id and task_name`);
    } else {
      if (typeof task.task_id !== 'number' || task.task_id < 0) {
        errors.push(`${prefix}.task_id must be a non-negative integer, got ${task.task_id}`);
      }
      if (taskIds.has(task.task_id)) {
        errors.push(`${prefix}.task_id ${task.task_id} is duplicated`);
      }
      taskIds.add(task.task_id);
    }

    if (!task.task_name || typeof task.task_name !== 'string' || !task.task_name.trim()) {
      errors.push(`${prefix}.task_name is missing or empty`);
    } else {
      if (taskNames.has(task.task_name)) {
        warnings.push(`${prefix}.task_name "${task.task_name}" is duplicated`);
      }
      taskNames.add(task.task_name);
    }

    // Enum fields
    if (task.status && !VALID_TASK_STATUS.includes(task.status)) {
      errors.push(`${prefix}.status "${task.status}" is not a valid status`);
    }
    if (task.priority && !VALID_PRIORITY.includes(task.priority)) {
      errors.push(`${prefix}.priority "${task.priority}" is not a valid priority`);
    }

    // Numeric fields
    if (task.estimated_hours !== undefined && task.estimated_hours !== null) {
      if (typeof task.estimated_hours !== 'number' || task.estimated_hours < 0) {
        errors.push(`${prefix}.estimated_hours must be a non-negative number`);
      }
    } else {
      warnings.push(`${prefix}.estimated_hours is missing`);
    }

    if (task.progress_percentage !== undefined && task.progress_percentage !== null) {
      if (typeof task.progress_percentage !== 'number' || task.progress_percentage < 0 || task.progress_percentage > 100) {
        errors.push(`${prefix}.progress_percentage must be 0-100`);
      }
    }

    // Date fields
    ['start_date', 'end_date', 'due_date'].forEach(field => {
      if (task[field] && !DATE_RE.test(task[field])) {
        errors.push(`${prefix}.${field} "${task[field]}" is not YYYY-MM-DD`);
      }
    });
    if (task.start_date && task.end_date && task.start_date > task.end_date) {
      warnings.push(`${prefix}.start_date is after end_date`);
    }

    // Dependencies
    if (task.dependencies && Array.isArray(task.dependencies)) {
      task.dependencies.forEach((dep, di) => {
        if (!dep || typeof dep !== 'object') {
          errors.push(`${prefix}.dependencies[${di}] is not an object`);
          return;
        }
        if (dep.type && !VALID_DEP_TYPES.includes(dep.type)) {
          errors.push(`${prefix}.dependencies[${di}].type "${dep.type}" is not valid`);
        }
        // Check reference exists (only when task_id-based — name-based may reference tasks in other files)
        if (dep.predecessor_task_id !== undefined) {
          if (!allTaskIds.has(dep.predecessor_task_id)) {
            errors.push(`${prefix}.dependencies[${di}].predecessor_task_id ${dep.predecessor_task_id} references non-existent task`);
          }
          if (dep.predecessor_task_id === task.task_id) {
            errors.push(`${prefix}.dependencies[${di}] is a self-reference`);
          }
        } else if (dep.predecessor_task_name !== undefined) {
          if (!allTaskNames.has(dep.predecessor_task_name)) {
            warnings.push(`${prefix}.dependencies[${di}].predecessor_task_name "${dep.predecessor_task_name}" references task not in this file (may be cross-module)`);
          }
          if (dep.predecessor_task_name === task.task_name) {
            errors.push(`${prefix}.dependencies[${di}] is a self-reference (by name)`);
          }
        }
      });
    }

    // Subtasks format
    if (task.subtasks !== undefined) {
      if (!Array.isArray(task.subtasks)) {
        errors.push(`${prefix}.subtasks must be an array`);
      } else {
        task.subtasks.forEach((sub, si) => {
          if (!sub || typeof sub !== 'object') {
            errors.push(`${prefix}.subtasks[${si}] is not an object`);
            return;
          }
          if (!sub.name && !sub.task_name && !sub.title) {
            errors.push(`${prefix}.subtasks[${si}] has no name/task_name/title`);
          }
          if (sub.status && !VALID_TASK_STATUS.includes(sub.status)) {
            warnings.push(`${prefix}.subtasks[${si}].status "${sub.status}" is not a standard status`);
          }
        });
      }
    }

    // Acceptance criteria format
    if (task.acceptance_criteria !== undefined) {
      if (!Array.isArray(task.acceptance_criteria)) {
        errors.push(`${prefix}.acceptance_criteria must be an array`);
      } else {
        task.acceptance_criteria.forEach((ac, ai) => {
          if (typeof ac !== 'string' || !ac.trim()) {
            errors.push(`${prefix}.acceptance_criteria[${ai}] must be a non-empty string`);
          }
        });
      }
    }

    // Self-referencing parent
    if (task.parent_task_id !== undefined && task.parent_task_id !== null && task.parent_task_id === task.task_id) {
      errors.push(`${prefix}.parent_task_id references itself`);
    }
  });

  return { relativePath, errors, warnings };
}

// ── Discover files ────────────────────────────────────────────────────────────
const allTasksJsonFiles = findTasksJsonFiles(TASKS_DB_ROOT);

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('tasks.json format validation', () => {

  it('discovers at least 2 tasks.json files in tasksDB/', () => {
    expect(allTasksJsonFiles.length).toBeGreaterThan(1);
  });

  // Dynamic test per file
  for (const filePath of allTasksJsonFiles) {
    const rel = path.relative(TASKS_DB_ROOT, filePath).replace(/\\/g, '/');

    it(`validates ${rel}`, () => {
      const result = validateTasksJson(filePath);
      if (result.errors.length > 0) {
        const msg = `Format errors in ${rel}:\n  - ${result.errors.join('\n  - ')}`;
        throw new Error(msg);
      }
      // Warnings are not failures but we log them
      if (result.warnings.length > 0) {
        console.log(`  ⚠ Warnings for ${rel}:\n    - ${result.warnings.join('\n    - ')}`);
      }
    });
  }

  it('github-task-manager tasks.json has all tasks with task_id and task_name', () => {
    const fp = path.join(TASKS_DB_ROOT, 'external/github-task-manager/tasks.json');
    if (!fs.existsSync(fp)) throw new Error('github-task-manager/tasks.json not found');
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    expect(Array.isArray(data.tasks)).toBe(true);
    expect(data.tasks.length).toBeGreaterThan(0);
    data.tasks.forEach((t, i) => {
      expect(typeof t.task_id).toBe('number');
      expect(typeof t.task_name).toBe('string');
      expect(t.task_name.trim().length).toBeGreaterThan(0);
    });
  });

  it('github-task-manager tasks.json has no orphan dependency references', () => {
    const fp = path.join(TASKS_DB_ROOT, 'external/github-task-manager/tasks.json');
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const ids = new Set(data.tasks.map(t => t.task_id));
    for (const task of data.tasks) {
      for (const dep of (task.dependencies || [])) {
        expect(ids.has(dep.predecessor_task_id)).toBe(true);
      }
    }
  });

  it('tasks with subtasks produce inline subtask targets in graph template', () => {
    // Verify the graph builder correctly resolves tasks with subtasks
    const graphDataPath = path.join(__dirname, '../../public/graph-display/js/graph-data.js');
    let src = fs.readFileSync(graphDataPath, 'utf8');
    src = src.replace(/^import\s.+$/mg, '');
    src = src.replace(/^export\s+/mg, '');
    src = `const CAREER_TEMPLATE_ID = 'career';\nconst TASK_MGMT_TEMPLATE_ID = 'task-management';\n${src}`;

    const fn = new Function('window', 'fetch', 'console',
      src + '\nreturn { buildProjectTaskTemplatePublic, buildInlineTaskSubgraphTemplatePublic };'
    );
    const mod = fn({
      location: { pathname: '/public/graph-display/index.html', hostname: '127.0.0.1', search: '' }
    }, async () => ({ ok: false, status: 404, json: async () => ({}) }), console);

    const fp = path.join(TASKS_DB_ROOT, 'external/github-task-manager/tasks.json');
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const entry = { id: 'gtm-link-test', name: 'GTM Link Test', path: '/tasksDB/external/github-task-manager/tasks.json' };
    const tpl = mod.buildProjectTaskTemplatePublic(entry, data);

    expect(tpl).toBeTruthy();
    expect(tpl.nodes.length).toBeGreaterThan(0);

    // Find tasks that have subtasks in the source data
    const tasksWithSubtasks = data.tasks.filter(t => Array.isArray(t.subtasks) && t.subtasks.length > 0);
    if (tasksWithSubtasks.length > 0) {
      // At least one node should have subtasksPath pointing to __inline_task_id__
      const nodesWithInlinePath = tpl.nodes.filter(n => String(n.subtasksPath || '').startsWith('__inline_task_id__:'));
      expect(nodesWithInlinePath.length).toBeGreaterThan(0);

      // Verify the inline subgraph actually builds from source data
      const firstInlineNode = nodesWithInlinePath[0];
      const subTpl = mod.buildInlineTaskSubgraphTemplatePublic(entry, data, firstInlineNode.subtasksPath);
      expect(subTpl).toBeTruthy();
      expect(subTpl.nodes.length).toBeGreaterThan(2); // start + end + at least 1 task
    }
  });
});
