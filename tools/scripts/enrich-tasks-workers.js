/**
 * enrich-tasks-workers.js
 * ----------------------
 * Adds/normalizes tasks/workers expectation fields on a TaskDB JSON file.
 *
 * What it does (non-destructive):
 * - If `skills_required` is missing/empty, derives defaults from `required_roles` and tags.
 * - Normalizes `requisites` into a non-empty string array (converts numeric IDs into readable strings).
 * - If `tracking` is missing, adds a minimal structure for review/verification.
 *
 * Usage:
 *   node tools/scripts/enrich-tasks-workers.js public/tasksDB/ai-career-roadmap/tasks.json
 *   node tools/scripts/enrich-tasks-workers.js public/tasksDB/ai-career-roadmap/integration-tasks-v2.json
 */

const fs = require('fs');
const path = require('path');

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function uniq(arr) {
  return Array.from(new Set((Array.isArray(arr) ? arr : []).map(x => String(x || '').trim()).filter(Boolean)));
}

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function saveJson(filePath, obj) {
  const content = JSON.stringify(obj, null, 2) + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
}

function buildTasksById(tasks) {
  const m = new Map();
  for (const t of Array.isArray(tasks) ? tasks : []) {
    if (!t || typeof t !== 'object') continue;
    const id = t.task_id;
    if (typeof id === 'number' && Number.isFinite(id)) m.set(id, t);
  }
  return m;
}

function taskRefToRequisiteString(ref, tasksById) {
  if (isNonEmptyString(ref)) return String(ref).trim();

  if (typeof ref === 'number' && Number.isFinite(ref)) {
    const hit = tasksById && tasksById.get(ref);
    const name = hit && isNonEmptyString(hit.task_name) ? String(hit.task_name).trim() : '';
    return name ? `Complete task ${ref}: ${name}` : `Complete task ${ref}`;
  }

  if (ref && typeof ref === 'object') {
    const id = ref.task_id ?? ref.predecessor_task_id;
    const name = ref.task_name ?? ref.predecessor_task_name;
    if (typeof id === 'number' && Number.isFinite(id)) {
      const hit = tasksById && tasksById.get(id);
      const resolvedName = (hit && isNonEmptyString(hit.task_name))
        ? String(hit.task_name).trim()
        : (isNonEmptyString(name) ? String(name).trim() : '');
      return resolvedName ? `Complete task ${id}: ${resolvedName}` : `Complete task ${id}`;
    }
    if (isNonEmptyString(name)) return String(name).trim();
  }

  return '';
}

function normalizeRequisites(task, tasksById) {
  const deps = Array.isArray(task && task.dependencies) ? task.dependencies : [];
  const derivedFromDeps = deps
    .map(d => taskRefToRequisiteString(d, tasksById))
    .filter(Boolean);

  const raw = Array.isArray(task && task.requisites) ? task.requisites : [];
  const normalizedExisting = raw
    .map(r => taskRefToRequisiteString(r, tasksById))
    .filter(Boolean);

  let result = uniq([...normalizedExisting, ...derivedFromDeps]);

  if (result.length === 0) {
    result = uniq([
      ...categoryToRequisites(task && task.category_name),
      ...tagsToRequisites(task && task.tags)
    ]);
  }

  if (result.length === 0) result = ['No prerequisites'];
  return result;
}

function roleToSkills(role) {
  const r = String(role || '').toLowerCase();
  if (r.includes('project manager') || r.includes('pm')) {
    return ['Project planning', 'Stakeholder communication', 'Requirements'];
  }
  if (r.includes('ux') || r.includes('designer')) {
    return ['UX research', 'Information architecture', 'Wireframing'];
  }
  if (r.includes('frontend')) {
    return ['JavaScript', 'HTML/CSS', 'UI engineering'];
  }
  if (r.includes('backend') || r.includes('api')) {
    return ['API design', 'Data modeling', 'Security basics'];
  }
  if (r.includes('qa') || r.includes('test')) {
    return ['Test planning', 'Automation basics', 'Bug triage'];
  }
  if (r.includes('content') || r.includes('writer') || r.includes('community')) {
    return ['Technical writing', 'Content strategy', 'Community enablement'];
  }
  return [];
}

function categoryToRequisites(categoryName) {
  const c = String(categoryName || '').toLowerCase();
  if (c.includes('discovery') || c.includes('exploration')) {
    return ['Access to existing roadmap content and links', 'Agreement on target audience and scope'];
  }
  if (c.includes('creation') || c.includes('design') || c.includes('prototype')) {
    return ['Brand/UI constraints (if any)', 'Figma access (or alternative wireframing tool)'];
  }
  if (c.includes('validation') || c.includes('qa') || c.includes('test')) {
    return ['Test environment or staging URL', 'Definition of Done / acceptance criteria'];
  }
  if (c.includes('delivery') || c.includes('implementation') || c.includes('deploy')) {
    return ['Local dev environment set up', 'Access to repo and build instructions'];
  }
  return ['Access to repo and relevant docs'];
}

function tagsToRequisites(tags) {
  const t = new Set((Array.isArray(tags) ? tags : []).map(x => String(x || '').toLowerCase().trim()).filter(Boolean));
  const req = [];
  if (t.has('survey') || t.has('research')) req.push('Access to survey tool and distribution channel');
  if (t.has('figma') || t.has('ux') || t.has('design')) req.push('Design file link(s) or wireframes');
  if (t.has('frontend')) req.push('UI spec + API contract');
  if (t.has('backend') || t.has('api')) req.push('API contract + data model draft');
  if (t.has('analytics') || t.has('instrumentation')) req.push('Analytics event spec + tracking destination');
  if (t.has('playwright') || t.has('testing')) req.push('Test plan / target scenarios');
  return req;
}

function inferReviewerRole(task) {
  const rr = Array.isArray(task.required_roles) ? task.required_roles : [];
  const first = rr.find(r => r && isNonEmptyString(r.role));
  return first ? String(first.role).trim() : 'Project Manager';
}

function main(argv = process.argv) {
  const arg = argv[2];
  if (!arg) {
    console.error('Missing file path.');
    process.exit(1);
  }

  const filePath = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);
  const data = loadJson(filePath);

  if (!data || typeof data !== 'object' || !Array.isArray(data.tasks)) {
    console.error('Invalid TaskDB JSON: missing tasks array.');
    process.exit(1);
  }

  let updated = 0;
  const tasksById = buildTasksById(data.tasks);

  for (const task of data.tasks) {
    if (!task || typeof task !== 'object') continue;

    // Field rename: migrate legacy naming to a neutral field.
    if (task.volunteer_capacity !== undefined) {
      if (task.assignee_capacity === undefined) {
        task.assignee_capacity = task.volunteer_capacity;
      }
      delete task.volunteer_capacity;
      updated++;
    }

    const requiredRoles = Array.isArray(task.required_roles) ? task.required_roles : [];
    const roleSkills = uniq(requiredRoles.flatMap(r => roleToSkills(r && r.role)));

    const currentSkills = Array.isArray(task.skills_required) ? task.skills_required : [];
    if (uniq(currentSkills).length === 0) {
      task.skills_required = roleSkills.length ? roleSkills : ['Communication', 'Problem solving'];
      updated++;
    }

    const normalizedReq = normalizeRequisites(task, tasksById);
    const beforeReq = Array.isArray(task.requisites)
      ? task.requisites
      : (task.requisites === undefined ? undefined : task.requisites);

    if (JSON.stringify(beforeReq) !== JSON.stringify(normalizedReq)) {
      task.requisites = normalizedReq;
      updated++;
    }

    if (!task.tracking || typeof task.tracking !== 'object') {
      task.tracking = {
        reviewer_role: inferReviewerRole(task),
        acceptance_criteria: isNonEmptyString(task.expected_output) ? [task.expected_output] : [],
        verification_steps: [
          'Peer review output against goal + expected_output',
          'Confirm dependencies are satisfied (if any)'
        ]
      };
      updated++;
    }
  }

  saveJson(filePath, data);
  console.log(`Enriched ${updated} field group(s) -> ${path.relative(process.cwd(), filePath)}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
