/**
 * validate-tasks-workers.js
 * ------------------------
 * Validates tasks/workers expectation fields on TaskDB projects.
 *
 * Why:
 * - Core schema validation (tools/scripts/validate-tasks-schema.js) ensures required PM fields exist.
 * - Projects also benefit from explicit expectations so tasks are understandable end-to-end,
 *   even before an individual is assigned.
 * - This script reports gaps and optionally fails CI/local runs in --strict mode.
 *
 * Usage:
 *   node tools/scripts/validate-tasks-workers.js ai-career-roadmap
 *   node tools/scripts/validate-tasks-workers.js github-task-manager --strict
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { projectId: '', strict: false };
  for (const a of argv.slice(2)) {
    if (a === '--strict') args.strict = true;
    else if (!a.startsWith('-') && !args.projectId) args.projectId = a;
  }
  return args;
}

function sanitizeProjectId(s) {
  return String(s || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

function loadProjectTasks(projectId) {
  const tasksPath = path.join(__dirname, '../../public/tasksDB', projectId, 'tasks.json');
  const content = fs.readFileSync(tasksPath, 'utf8');
  return { tasksPath, data: JSON.parse(content) };
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isNonEmptyStringArray(v) {
  return Array.isArray(v) && v.some(x => isNonEmptyString(x));
}

function isNonEmptyArray(v) {
  return Array.isArray(v) && v.length > 0;
}

function validate(projectId, tasksJson, { strict }) {
  const errors = [];
  const warnings = [];

  const tasks = Array.isArray(tasksJson && tasksJson.tasks) ? tasksJson.tasks : [];
  const workers = Array.isArray(tasksJson && tasksJson.workers) ? tasksJson.workers : [];

  const workersById = new Map();
  const workersByEmail = new Map();
  for (const w of workers) {
    if (!w || typeof w !== 'object') continue;
    const id = w.worker_id ? String(w.worker_id).trim() : '';
    const email = w.email ? String(w.email).trim() : '';
    if (id) workersById.set(id, w);
    if (email) workersByEmail.set(email, w);
  }

  const fields = [
    { key: 'goal', kind: 'string' },
    { key: 'expected_output', kind: 'string' },
    { key: 'tools', kind: 'string[]' },
    { key: 'skills_required', kind: 'string[]' },
    { key: 'requisites', kind: 'string[]' },
    { key: 'complexity', kind: 'string' },
    { key: 'time_estimate_hours', kind: 'number' }
  ];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const prefix = `tasks[${i}]#${t && t.task_id ? t.task_id : '?'}"${t && t.task_name ? t.task_name : ''}"`;

    if (!t || typeof t !== 'object') {
      errors.push(`${prefix}: task is not an object`);
      continue;
    }

    for (const f of fields) {
      const v = t[f.key];
      let ok = true;
      if (f.kind === 'string') ok = isNonEmptyString(v);
      else if (f.kind === 'string[]') ok = isNonEmptyStringArray(v);
      else if (f.kind === 'number') ok = typeof v === 'number' && Number.isFinite(v) && v >= 0;

      if (!ok) {
        const msg = `${prefix}: missing/invalid expectation field "${f.key}"`;
        if (strict) errors.push(msg);
        else warnings.push(msg);
      }
    }

    // Suggested roles: recommended (not strictly required)
    if (!isNonEmptyArray(t.required_roles)) {
      const msg = `${prefix}: missing "required_roles" (recommended for pick-up clarity, even when unassigned)`;
      if (strict) errors.push(msg);
      else warnings.push(msg);
    }

    // Validate assigned worker references when present (email remains optional)
    if (Array.isArray(t.assigned_workers)) {
      for (let j = 0; j < t.assigned_workers.length; j++) {
        const aw = t.assigned_workers[j];
        if (!aw || typeof aw !== 'object') {
          errors.push(`${prefix}: assigned_workers[${j}] is not an object`);
          continue;
        }
        const wid = aw.worker_id ? String(aw.worker_id).trim() : '';
        const email = aw.email ? String(aw.email).trim() : '';
        if (wid && !workersById.has(wid)) {
          warnings.push(`${prefix}: assigned_workers[${j}] references unknown worker_id "${wid}"`);
        }
        if (email && !workersByEmail.has(email)) {
          warnings.push(`${prefix}: assigned_workers[${j}] references unknown email "${email}"`);
        }
      }
    }
  }

  // Validate workers minimal shape (worker_id preferred; email optional/legacy)
  for (let i = 0; i < workers.length; i++) {
    const w = workers[i];
    const prefix = `workers[${i}]`;
    if (!w || typeof w !== 'object') {
      errors.push(`${prefix}: worker is not an object`);
      continue;
    }
    const wid = w.worker_id ? String(w.worker_id).trim() : '';
    const email = w.email ? String(w.email).trim() : '';
    if (!wid && !email) errors.push(`${prefix}: missing worker_id (preferred) or email (optional/legacy)`);
    if (!isNonEmptyString(w.name) && !isNonEmptyString(w.role)) errors.push(`${prefix}: missing name or role`);
    if (!isNonEmptyStringArray(w.skills)) warnings.push(`${prefix}: missing/empty skills (recommended)`);
    if (w.tools !== undefined && !isNonEmptyStringArray(w.tools)) warnings.push(`${prefix}: tools present but empty/invalid (recommended to be non-empty if provided)`);
  }

  return { errors, warnings };
}

function main(argv = process.argv) {
  const args = parseArgs(argv);
  const projectId = sanitizeProjectId(args.projectId || 'ai-career-roadmap') || 'ai-career-roadmap';

  const { tasksPath, data } = loadProjectTasks(projectId);
  const { errors, warnings } = validate(projectId, data, { strict: args.strict });

  const rel = path.relative(process.cwd(), tasksPath);
  console.log(`Tasks/workers validation: ${projectId}`);
  console.log(`File: ${rel}`);
  console.log('-'.repeat(60));

  if (errors.length) {
    console.log(`ERRORS (${errors.length})`);
    for (const e of errors) console.log(`- ${e}`);
  }
  if (warnings.length) {
    console.log(`WARNINGS (${warnings.length})`);
    for (const w of warnings) console.log(`- ${w}`);
  }

  if (errors.length) process.exit(1);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main, validate };
