/**
 * CLI and library entrypoint for generating calendar JSON from TaskDB projects.
 *
 * It discovers project descriptors, normalizes task records into appointment
 * data, writes project-level calendar files, and optionally emits worker views.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
  RECURRENCE_VALUES,
  SORT_MODES,
  APPOINTMENT_STATUSES,
  DEFAULT_CALENDAR_ID,
  DEFAULT_SORT_MODE,
  DEFAULT_TIMEZONE,
  DEFAULT_PRIORITY,
  DEFAULT_CALENDAR_COLOR,
  CALENDAR_COLOR_PALETTE
} = require('./calendar-constants');

const {
  TASK_FIELD_SCHEMA,
  CALENDAR_META_FIELD_NAMES,
  TASK_TO_CALENDAR_FIELD_SOURCES,
  CALENDAR_APPOINTMENT_SCHEMA,
  WORKER_FIELD_MAP,
  PRIORITY_MAP,
  STATUS_TO_APPOINTMENT_MAP
} = require('./calendar-appointment-schema');

/** Root-level TaskDB directories excluded from root project discovery. */
/** Excluded root project dirs. */
const EXCLUDED_ROOT_PROJECT_DIRS = new Set(['external', 'local', '_examples', '_schema', '_templates']);
/** Supported CLI values for filtering exported task scope. */
/** Task scope values. */
const TASK_SCOPE_VALUES = Object.freeze(['all', 'pending', 'both']);
/** Task statuses treated as terminal when generating pending-only calendar views. */
/** Terminal task statuses. */
const TERMINAL_TASK_STATUSES = new Set(['done', 'completed', 'cancelled', 'canceled']);

/** Check whether a value is a plain object rather than an array or primitive. */
/** Is plain object. */
function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** Flatten nested or scalar values into a single-level array. */
/** To flat array. */
function toFlatArray(value) {
  if (value === null || value === undefined || value === '') return [];
  if (!Array.isArray(value)) return [value];
  return value.reduce((accumulator, item) => accumulator.concat(toFlatArray(item)), []);
}

/** Return the ordered set of unique normalized string values from mixed inputs. */
/** Unique strings. */
function uniqueStrings(values) {
  const seen = new Set();
  const result = [];

  toFlatArray(values).forEach((item) => {
    let normalized = '';
    if (typeof item === 'string') normalized = item.trim();
    else if (typeof item === 'number' || typeof item === 'boolean') normalized = String(item).trim();
    else if (isPlainObject(item)) {
      normalized = String(item.email || item.name || item.phone || item.url || item.href || item.id || '').trim();
    }

    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

/** Sanitize a project id for descriptor lookup and output naming. */
/** Normalize project id. */
function normalizeProjectId(rawValue) {
  return String(rawValue || '').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
}

/** Normalize a requested task scope to the supported export values. */
/** Normalize task scope. */
function normalizeTaskScope(value, { allowBoth = false } = {}) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return allowBoth ? 'both' : 'all';
  if (allowBoth && normalized === 'both') return 'both';
  return normalized === 'pending' ? 'pending' : 'all';
}

/** Convert text into a filesystem-friendly slug. */
/** Slugify. */
function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';
}

/** Convert an identifier into a human-readable title. */
/** Prettify identifier. */
function prettifyIdentifier(value) {
  return String(value || '')
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase()) || 'Default';
}

/** Check whether a value is a date-only string in YYYY-MM-DD form. */
/** Is date only string. */
function isDateOnlyString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '').trim());
}

/** Check whether a value includes an explicit time component. */
/** Has explicit time. */
function hasExplicitTime(value) {
  return /T\d{2}:\d{2}/.test(String(value || '').trim());
}

/** Normalize a date-like value into an ISO date-time string. */
/** To iso date time. */
function toIsoDateTime(value, { endOfDay = false } = {}) {
  const rawValue = String(value || '').trim();
  if (!rawValue) return null;

  if (isDateOnlyString(rawValue)) {
    const [year, month, day] = rawValue.split('-').map(Number);
    const hours = endOfDay ? 23 : 0;
    const minutes = endOfDay ? 59 : 0;
    const seconds = endOfDay ? 59 : 0;
    const milliseconds = endOfDay ? 999 : 0;
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds)).toISOString();
  }

  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

/** Parse an optional numeric value, optionally forcing integer conversion. */
/** Normalize nullable number. */
function normalizeNullableNumber(value, { integer = false } = {}) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = integer ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Parse a positive integer count or return null when invalid. */
/** Normalize positive count. */
function normalizePositiveCount(value) {
  const parsed = normalizeNullableNumber(value, { integer: true });
  return parsed && parsed > 0 ? parsed : null;
}

/** Parse reminder minutes, keeping only non-negative integer values. */
/** Normalize reminder minutes. */
function normalizeReminderMinutes(value) {
  const parsed = normalizeNullableNumber(value, { integer: true });
  return parsed !== null && parsed >= 0 ? parsed : null;
}

/** Resolve a dotted property path from a nested object. */
/** Get nested field value. */
function getNestedFieldValue(obj, path) {
  if (!obj || typeof obj !== 'object' || !path) return undefined;
  return String(path).split('.').reduce((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return current[segment];
    }
    return undefined;
  }, obj);
}

/** Check whether a candidate value should be treated as present. */
/** Is defined value. */
function isDefinedValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

/** Resolve the first defined appointment field value from task and meta sources. */
/** Resolve task field value. */
function resolveTaskFieldValue(task, meta, sources) {
  if (!Array.isArray(sources)) return null;

  for (const sourcePath of sources) {
    if (!sourcePath) continue;
    let value;
    const normalizedPath = String(sourcePath).trim();
    const pathSegments = normalizedPath.split('.');
    const root = pathSegments[0];

    if (CALENDAR_META_FIELD_NAMES.includes(root)) {
      value = getNestedFieldValue(meta, pathSegments.slice(1).join('.'));
    } else {
      value = getNestedFieldValue(task, normalizedPath);
    }

    if (isDefinedValue(value)) {
      return value;
    }
  }

  return null;
}

/** Normalize recurrence input to the supported recurrence enum. */
/** Normalize recurrence. */
function normalizeRecurrence(value) {
  const normalized = String(value || 'none').trim().toLowerCase();
  return RECURRENCE_VALUES.includes(normalized) ? normalized : 'none';
}

/** Normalize appointment status input to the supported status enum. */
/** Normalize appointment status. */
function normalizeAppointmentStatus(value, fallback = 'tentative') {
  const normalized = String(value || '').trim().toLowerCase();
  return APPOINTMENT_STATUSES.includes(normalized) ? normalized : fallback;
}

/** Map a TaskDB task status to the calendar appointment status model. */
/** Map task status to appointment status. */
function mapTaskStatusToAppointmentStatus(taskStatus) {
  const normalized = String(taskStatus || '').trim().toLowerCase().replace(/_/g, ' ');
  if (!normalized) return 'tentative';
  return STATUS_TO_APPOINTMENT_MAP[normalized] || 'confirmed';
}

/** Resolve a numeric appointment priority from explicit or task-level priority values. */
/** Map priority to number. */
function mapPriorityToNumber(explicitPriority, taskPriority) {
  const explicitNumber = normalizeNullableNumber(explicitPriority);
  if (explicitNumber !== null) {
    return Math.max(1, Math.min(10, Math.round(explicitNumber)));
  }

  const normalized = String(taskPriority || '').trim().toLowerCase();
  return PRIORITY_MAP[normalized] || DEFAULT_PRIORITY;
}

/** Resolve a calendar color with the configured fallback chain. */
/** Normalize color. */
function normalizeColor(color, fallback) {
  const candidate = String(color || '').trim();
  return candidate || fallback || DEFAULT_CALENDAR_COLOR;
}

/** Check whether a string appears to be an email address. */
/** Looks like email. */
function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

/** Create a deterministic opaque worker id from a private seed value. */
/** Create opaque worker id. */
function createOpaqueWorkerId(seed) {
  const normalized = String(seed || '').trim().toLowerCase();
  if (!normalized) return null;
  return `worker-${crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 12)}`;
}

/** Resolve the worker contact email used in calendar contact fields. */
/** Resolve worker contact. */
function resolveWorkerContact(worker) {
  if (isPlainObject(worker)) {
    const email = String(worker[WORKER_FIELD_MAP.contactEmail] || worker.email || '').trim();
    return looksLikeEmail(email) ? email : '';
  }

  const normalized = String(worker || '').trim();
  return looksLikeEmail(normalized) ? normalized : '';
}

/** Resolve the public-facing worker label used for professional or resource views. */
/** Resolve worker professional label. */
function resolveWorkerProfessionalLabel(worker) {
  if (!isPlainObject(worker)) {
    const normalized = String(worker || '').trim();
    return normalized && !looksLikeEmail(normalized) ? normalized : '';
  }

  return String(
    worker[WORKER_FIELD_MAP.professional]
    || worker[WORKER_FIELD_MAP.attendeeName]
    || worker.worker_id
    || worker.workerId
    || worker.id
    || ''
  ).trim();
}

/** Resolve the attendee label used in appointment attendee lists. */
/** Resolve worker attendee label. */
function resolveWorkerAttendeeLabel(worker) {
  if (!isPlainObject(worker)) {
    return String(worker || '').trim();
  }

  return String(
    worker[WORKER_FIELD_MAP.attendeeName]
    || worker.name
    || worker[WORKER_FIELD_MAP.professional]
    || worker.worker_id
    || worker.workerId
    || worker.id
    || resolveWorkerContact(worker)
    || ''
  ).trim();
}

/** Resolve a stable worker identifier suitable for calendar exports. */
/** Resolve worker professional id. */
function resolveWorkerProfessionalId(worker) {
  if (!worker) return null;

  if (!isPlainObject(worker)) {
    const normalized = String(worker || '').trim();
    if (!normalized) return null;
    return looksLikeEmail(normalized) ? createOpaqueWorkerId(normalized) : normalized;
  }

  const fallbackFields = Array.isArray(WORKER_FIELD_MAP.professionalIdFallbacks)
    ? WORKER_FIELD_MAP.professionalIdFallbacks.filter((field) => !String(field).includes('hash('))
    : [];

  for (const fieldName of [WORKER_FIELD_MAP.professionalId, ...fallbackFields]) {
    const candidate = String(worker[fieldName] || '').trim();
    if (candidate) return candidate;
  }

  const email = resolveWorkerContact(worker);
  if (email) return createOpaqueWorkerId(email);

  const fallbackSeed = String(worker[WORKER_FIELD_MAP.attendeeName] || worker.name || worker[WORKER_FIELD_MAP.professional] || '').trim();
  return fallbackSeed ? createOpaqueWorkerId(fallbackSeed) : null;
}

/** Extract embedded calendar metadata overrides from a task record. */
/** Extract task calendar meta. */
function extractTaskCalendarMeta(task) {
  const candidates = [
    task && task.calendar,
    task && task.appointment,
    task && task.calendar_event,
    task && task.calendarEvent,
    task && task.meta && task.meta.calendar
  ];

  return candidates.find((candidate) => isPlainObject(candidate)) || {};
}

/** Pick the first non-empty URL-like value from a mixed list of candidates. */
/** Pick first url. */
function pickFirstUrl(values) {
  const flattened = toFlatArray(values);
  for (const entry of flattened) {
    if (typeof entry === 'string' && entry.trim()) return entry.trim();
    if (isPlainObject(entry)) {
      const candidate = String(entry.url || entry.href || entry.link || '').trim();
      if (candidate) return candidate;
    }
  }
  return '';
}

/** Build the appointment attendee list for a task. */
/** Build attendees. */
function buildAttendees(task, meta) {
  if (Array.isArray(meta.attendees) && meta.attendees.length > 0) {
    return uniqueStrings(meta.attendees);
  }

  const attendeeCandidates = Array.isArray(task && task.assigned_workers)
    ? task.assigned_workers.map((worker) => resolveWorkerAttendeeLabel(worker))
    : [];

  return uniqueStrings(attendeeCandidates);
}

/** Build the appointment contact list for a task. */
/** Build contacts. */
function buildContacts(task, meta) {
  if (Array.isArray(meta.contact) && meta.contact.length > 0) {
    return uniqueStrings(meta.contact);
  }

  const contactCandidates = [];
  if (Array.isArray(task && task.assigned_workers)) {
    task.assigned_workers.forEach((worker) => {
      const contact = resolveWorkerContact(worker);
      if (contact) contactCandidates.push(contact);
    });
  }

  if (isPlainObject(task && task.reviewer)) {
    const reviewerEmail = String(task.reviewer.email || '').trim();
    if (looksLikeEmail(reviewerEmail)) contactCandidates.push(reviewerEmail);
  }

  if (task && looksLikeEmail(task.creator_id)) {
    contactCandidates.push(task.creator_id);
  }

  return uniqueStrings(contactCandidates);
}

/** Build a normalized calendar appointment object from a TaskDB task. */
/** Build appointment. */
function buildAppointment(task, context) {
  if (!isPlainObject(task)) return null;

  const meta = extractTaskCalendarMeta(task);
  const timezone = String(resolveTaskFieldValue(task, meta, ['calendar.timezone', 'appointment.timezone', 'timezone']) || context.projectTimezone || DEFAULT_TIMEZONE).trim() || DEFAULT_TIMEZONE;
  const startSource = resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.date);
  const endSource = resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.endDate);
  const date = toIsoDateTime(startSource, { endOfDay: false }) || new Date().toISOString();
  const endDate = toIsoDateTime(endSource, { endOfDay: !hasExplicitTime(endSource) });
  const allDay = isDefinedValue(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.allDay))
    ? Boolean(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.allDay))
    : Boolean(isDateOnlyString(startSource) && (!endSource || isDateOnlyString(endSource)));
  const calendarId = String(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.calendarId) || DEFAULT_CALENDAR_ID).trim() || DEFAULT_CALENDAR_ID;
  const appointmentId = String(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.id) || `${context.projectId}:${task.task_id || slugify(task.task_name || task.title)}`).trim();
  const status = normalizeAppointmentStatus(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.status), mapTaskStatusToAppointmentStatus(task.status));
  const title = String(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.title) || 'Untitled appointment').trim();
  const createdAt = toIsoDateTime(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.createdAt) || task.start_date) || new Date().toISOString();

  if (meta.calendarName || meta.calendarColor || calendarId !== DEFAULT_CALENDAR_ID) {
    context.calendarMetaById.set(calendarId, {
      name: String(meta.calendarName || meta.name || '').trim(),
      color: String(meta.calendarColor || meta.color || '').trim()
    });
  }

  const assignedWorkers = Array.isArray(task && task.assigned_workers) ? task.assigned_workers : [];
  const firstAssignedWorker = assignedWorkers.find((worker) => isPlainObject(worker) || typeof worker === 'string');
  // professional   = public worker label (prefer role, fallback name)
  // professionalId = stable worker identifier (prefer worker_id/id, else opaque hash(email))
  const professionalCandidate = meta.professional || resolveWorkerProfessionalLabel(firstAssignedWorker);
  const professionalIdCandidate = meta.professionalId || resolveWorkerProfessionalId(firstAssignedWorker);

  return {
    id: appointmentId,
    date,
    endDate,
    recurrence: normalizeRecurrence(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.recurrence) || meta.recurrence),
    title,
    description: String(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.description) || '').trim(),
    location: String(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.location) || '').trim(),
    url: String(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.url) || pickFirstUrl(task.links) || pickFirstUrl(task.attachments) || '').trim(),
    status,
    attendees: buildAttendees(task, meta),
    contact: buildContacts(task, meta),
    category: String(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.category) || 'General').trim() || 'General',
    tags: uniqueStrings([resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.tags) || task.tags, meta.tags]),
    priority: mapPriorityToNumber(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.priority), task.priority),
    allDay,
    timezone,
    calendarId,
    reminderMinutes: normalizeReminderMinutes(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.reminderMinutes)),
    recurrenceCount: normalizePositiveCount(resolveTaskFieldValue(task, meta, TASK_TO_CALENDAR_FIELD_SOURCES.recurrenceCount)),
    professional: String(professionalCandidate || '').trim() || null,
    professionalId: professionalIdCandidate === null || professionalIdCandidate === undefined || professionalIdCandidate === ''
      ? null
      : String(professionalIdCandidate).trim(),
    createdAt
  };
}

/** Build calendar definitions for the calendar ids referenced by appointments. */
/** Build calendars. */
function buildCalendars(appointments, calendarMetaById, projectName) {
  const calendarIds = uniqueStrings(appointments.map((appointment) => appointment.calendarId));
  const ids = calendarIds.length > 0 ? calendarIds : [DEFAULT_CALENDAR_ID];

  return ids.map((calendarId, index) => {
    const meta = calendarMetaById.get(calendarId) || {};
    const fallbackColor = CALENDAR_COLOR_PALETTE[index % CALENDAR_COLOR_PALETTE.length] || DEFAULT_CALENDAR_COLOR;
    return {
      id: calendarId,
      name: meta.name || (calendarId === DEFAULT_CALENDAR_ID ? String(projectName || 'Default Calendar') : prettifyIdentifier(calendarId)),
      color: normalizeColor(meta.color, fallbackColor)
    };
  });
}

/** Check whether a task should be treated as pending for calendar export. */
/** Is pending task. */
function isPendingTask(task) {
  if (!isPlainObject(task)) return false;
  const normalizedStatus = String(task.status || '').trim().toLowerCase().replace(/_/g, ' ');
  return !TERMINAL_TASK_STATUSES.has(normalizedStatus);
}

/** Filter a task list according to the requested calendar task scope. */
/** Filter tasks by scope. */
function filterTasksByScope(tasks, taskScope) {
  const normalizedScope = normalizeTaskScope(taskScope);
  if (normalizedScope === 'pending') {
    return (Array.isArray(tasks) ? tasks : []).filter((task) => isPendingTask(task));
  }
  return Array.isArray(tasks) ? [...tasks] : [];
}

/** Build a full calendar state payload from a TaskDB project payload. */
/** Build calendar state. */
function buildCalendarState(payload, options = {}) {
  const rawTasks = Array.isArray(payload && payload.tasks) ? payload.tasks : [];
  const taskScope = normalizeTaskScope(options.taskScope);
  const tasks = filterTasksByScope(rawTasks, taskScope);
  const project = isPlainObject(payload && payload.project) ? payload.project : {};
  const projectId = normalizeProjectId(options.projectId || project.id || slugify(project.name));
  const projectName = String(options.projectName || project.name || options.projectId || 'Calendar Export').trim();
  const calendarMetaById = new Map();
  const context = {
    projectId,
    projectName,
    projectTimezone: String(project.timezone || DEFAULT_TIMEZONE).trim() || DEFAULT_TIMEZONE,
    calendarMetaById
  };

  const appointments = tasks
    .map((task) => buildAppointment(task, context))
    .filter(Boolean)
    .sort((left, right) => String(left.date).localeCompare(String(right.date)) || String(left.title).localeCompare(String(right.title)));

  const calendars = buildCalendars(appointments, calendarMetaById, projectName);
  const focusDate = appointments[0] ? appointments[0].date : new Date().toISOString();

  return {
    focusDate,
    sortMode: SORT_MODES.includes(options.sortMode) ? options.sortMode : DEFAULT_SORT_MODE,
    calendars,
    appointments,
    generatedAt: new Date().toISOString(),
    source: {
      projectId,
      projectName,
      scope: options.scope || 'external',
      taskScope,
      taskCount: tasks.length
    }
  };
}

/** Read and parse a JSON file from disk. */
/** Read json. */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/** Resolve the root descriptor for a TaskDB project id within the repo. */
/** Resolve project descriptor. */
function resolveProjectDescriptor(projectId, repoRoot) {
  const safeProjectId = normalizeProjectId(projectId);
  const tasksDbRoot = path.join(repoRoot, 'public', 'tasksDB');
  const scopeCandidates = ['external', 'local', ''];

  for (const scope of scopeCandidates) {
    const projectDir = scope
      ? path.join(tasksDbRoot, scope, safeProjectId)
      : path.join(tasksDbRoot, safeProjectId);
    const tasksJsonPath = path.join(projectDir, 'node.tasks.json');
    if (fs.existsSync(tasksJsonPath)) {
      return {
        projectId: safeProjectId,
        rootProjectId: safeProjectId,
        scope: scope || 'root',
        projectDir,
        tasksJsonPath
      };
    }
  }

  return null;
}

/** Normalize a nested task path into a stable id suffix. */
/** Normalize task path id. */
function normalizeTaskPathId(value) {
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/\.json$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** Find nested node.tasks.json files under a project directory. */
/** Find nested task json paths. */
function findNestedTaskJsonPaths(rootDir, excludePath) {
  const results = [];

  /** Traverse. */
  /** Traverse. */
  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        traverse(path.join(dir, entry.name));
        continue;
      }
      if (entry.isFile() && entry.name === 'node.tasks.json') {
        const candidate = path.join(dir, entry.name);
        if (path.resolve(candidate) !== path.resolve(excludePath)) {
          results.push(candidate);
        }
      }
    }
  }

  traverse(rootDir);
  return results;
}

/** Expand a root project descriptor to include nested module task files. */
/** Expand project descriptor. */
function expandProjectDescriptor(descriptor) {
  if (!descriptor) return [];

  const descriptors = [descriptor];
  const nestedPaths = findNestedTaskJsonPaths(descriptor.projectDir, descriptor.tasksJsonPath);
  nestedPaths.forEach((nestedPath) => {
    const relativePath = path.relative(descriptor.projectDir, nestedPath).replace(/\\/g, '/');
    const nestedId = `${descriptor.projectId}-${normalizeTaskPathId(relativePath.replace(/^src\//, ''))}`;
    descriptors.push({
      projectId: nestedId,
      rootProjectId: descriptor.rootProjectId || descriptor.projectId,
      scope: descriptor.scope,
      projectDir: path.dirname(nestedPath),
      tasksJsonPath: nestedPath
    });
  });

  return descriptors;
}

/** List all calendar-exportable TaskDB project descriptors in the repository. */
/** List project descriptors. */
function listProjectDescriptors(repoRoot) {
  const tasksDbRoot = path.join(repoRoot, 'public', 'tasksDB');
  const results = [];

  ['external', 'local'].forEach((scope) => {
    const scopeDir = path.join(tasksDbRoot, scope);
    if (!fs.existsSync(scopeDir)) return;
    fs.readdirSync(scopeDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .forEach((entry) => {
        const rootDescriptor = resolveProjectDescriptor(entry.name, repoRoot);
        if (rootDescriptor && rootDescriptor.scope === scope) {
          expandProjectDescriptor(rootDescriptor).forEach((descriptor) => results.push(descriptor));
        }
      });
  });

  if (fs.existsSync(tasksDbRoot)) {
    fs.readdirSync(tasksDbRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !EXCLUDED_ROOT_PROJECT_DIRS.has(entry.name))
      .forEach((entry) => {
        const rootDescriptor = resolveProjectDescriptor(entry.name, repoRoot);
        if (rootDescriptor && rootDescriptor.scope === 'root') {
          expandProjectDescriptor(rootDescriptor).forEach((descriptor) => results.push(descriptor));
        }
      });
  }

  const deduped = new Map();
  results.forEach((descriptor) => {
    deduped.set(`${descriptor.scope}:${descriptor.projectId}`, descriptor);
  });
  return Array.from(deduped.values()).sort((left, right) => `${left.scope}:${left.projectId}`.localeCompare(`${right.scope}:${right.projectId}`));
}

/** Build the output filename for a generated calendar export. */
/** Get output file name. */
function getOutputFileName(descriptor) {
  return `${descriptor.projectId}.calendar.json`;
}

/** Resolve the base output directory for a project's generated artifacts. */
/** Get project output directory. */
function getProjectOutputDirectory(descriptor, outputDir) {
  const rootProjectId = descriptor.rootProjectId || descriptor.projectId;
  return path.join(outputDir, descriptor.scope, rootProjectId);
}

/** Resolve the output directory for project calendar files at a given task scope. */
/** Get calendar output directory. */
function getCalendarOutputDirectory(descriptor, outputDir, taskScope) {
  return path.join(
    getProjectOutputDirectory(descriptor, outputDir),
    'calendars',
    normalizeTaskScope(taskScope)
  );
}

/** Resolve the output directory for per-worker calendar files. */
/** Get worker output directory. */
function getWorkerOutputDirectory(descriptor, outputDir, taskScope) {
  return path.join(
    getProjectOutputDirectory(descriptor, outputDir),
    'workers-calendar',
    normalizeTaskScope(taskScope)
  );
}

/** Remove legacy output paths from older calendar export layouts. */
/** Cleanup legacy output layout. */
function cleanupLegacyOutputLayout(descriptor, outputDir) {
  const projectOutputDir = getProjectOutputDirectory(descriptor, outputDir);
  const workerOutputDir = path.join(projectOutputDir, 'workers-calendar');
  const legacyPaths = [
    path.join(projectOutputDir, `${descriptor.projectId}.calendar.json`),
    path.join(projectOutputDir, `${descriptor.projectId}.pending.calendar.json`),
    path.join(projectOutputDir, `${descriptor.projectId}.active.calendar.json`),
    path.join(projectOutputDir, `${descriptor.projectId}.critical-path.calendar.json`),
    path.join(projectOutputDir, 'workers-calendar-pending')
  ];

  legacyPaths.forEach((legacyPath) => {
    if (!fs.existsSync(legacyPath)) return;
    fs.rmSync(legacyPath, { recursive: true, force: true });
  });

  if (!fs.existsSync(workerOutputDir)) return;

  fs.readdirSync(workerOutputDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.calendar.json'))
    .forEach((entry) => {
      fs.rmSync(path.join(workerOutputDir, entry.name), { force: true });
    });
}

/** Write a generated calendar state file to disk. */
/** Write calendar file. */
function writeCalendarFile(descriptor, state, outputDir, options = {}) {
  const targetDir = getCalendarOutputDirectory(descriptor, outputDir, options.taskScope);
  fs.mkdirSync(targetDir, { recursive: true });
  const outputPath = path.join(targetDir, getOutputFileName(descriptor));
  fs.writeFileSync(outputPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  return outputPath;
}

/** Load the effective payload used to generate a descriptor's calendar exports. */
/** Load descriptor payload. */
function loadDescriptorPayload(descriptor) {
  const payload = readJson(descriptor.tasksJsonPath);
  const projectName = String(payload.project?.name || descriptor.projectId).trim();

  if (payload && payload.navigation && typeof payload.navigation.rootModule === 'string') {
    const rootModuleRelative = String(payload.navigation.rootModule).replace(/\\/g, '/').replace(/^\/+/, '');
    const rootModulePath = path.join(descriptor.projectDir, rootModuleRelative);
    if (fs.existsSync(rootModulePath)) {
      const rootPayload = readJson(rootModulePath);
      const modules = Array.isArray(payload.navigation.modules) ? payload.navigation.modules : [];
      if (modules.length) {
        rootPayload.navigation = rootPayload.navigation || {};
        rootPayload.navigation.modules = modules;
      }
      return { payload: rootPayload, projectName };
    }
  }

  return { payload, projectName };
}

/**
 * Extracts all unique assigned workers from a tasks array.
 * Returns a Map keyed by stable professionalId → { name, email, role, professionalId, slug }.
 *
 * @param {object[]} tasks
 * @returns {Map<string, {name: string, email: string, role: string, professionalId: string, slug: string}>}
 */
function extractWorkersFromTasks(tasks) {
  const workers = new Map();

  toFlatArray(tasks).forEach((task) => {
    if (!isPlainObject(task)) return;
    const assigned = Array.isArray(task.assigned_workers) ? task.assigned_workers : [];
    assigned.forEach((worker) => {
      let name, email, role, professionalId;
      if (isPlainObject(worker)) {
        name = String(worker.name || '').trim();
        email = resolveWorkerContact(worker);
        role = String(worker.role || 'Team Member').trim();
        professionalId = resolveWorkerProfessionalId(worker);
      } else {
        const normalized = String(worker || '').trim();
        name = looksLikeEmail(normalized) ? '' : normalized;
        email = resolveWorkerContact(normalized);
        role = 'Team Member';
        professionalId = resolveWorkerProfessionalId(normalized);
      }
      const dedupeKey = String(professionalId || email || name).trim();
      if (!dedupeKey) return;
      if (!workers.has(dedupeKey)) {
        workers.set(dedupeKey, {
          name: name || role || dedupeKey,
          email,
          role,
          professionalId: professionalId || dedupeKey,
          slug: slugify(name || role || dedupeKey)
        });
      }
    });
  });

  return workers;
}

/**
 * Builds a calendar state scoped to a single worker.
 * Filters appointments where the worker appears by stable professionalId,
 * or by legacy contact/name fallbacks.
 * The returned state includes a top-level `worker` object with the
 * professionalId so the backend can identify/replace the worker.
 *
 * @param {{name: string, email: string, role: string, professionalId: string}} workerInfo
 * @param {object[]} appointments - All appointments from the project's global calendar state.
 * @param {object} options
 * @returns {object} Calendar state object
 */
function buildWorkerCalendarState(workerInfo, appointments, options = {}) {
  const workerAppointments = appointments.filter((apt) => {
    if (String(apt.professionalId || '').trim() === String(workerInfo.professionalId || '').trim()) return true;
    if (Array.isArray(apt.contact) && apt.contact.some((c) => String(c).trim() === workerInfo.email)) return true;
    if (Array.isArray(apt.attendees) && apt.attendees.some((a) => String(a).trim() === workerInfo.name)) return true;
    return false;
  });

  const sorted = [...workerAppointments].sort(
    (l, r) => String(l.date).localeCompare(String(r.date)) || String(l.title).localeCompare(String(r.title))
  );

  const focusDate = sorted.length > 0 ? sorted[0].date : new Date().toISOString();
  const calendarIds = uniqueStrings(sorted.map((a) => a.calendarId));
  const ids = calendarIds.length > 0 ? calendarIds : [DEFAULT_CALENDAR_ID];

  const calendars = ids.map((calendarId, index) => {
    const fallbackColor = CALENDAR_COLOR_PALETTE[index % CALENDAR_COLOR_PALETTE.length] || DEFAULT_CALENDAR_COLOR;
    return {
      id: calendarId,
      name: calendarId === DEFAULT_CALENDAR_ID
        ? `${workerInfo.name} (${workerInfo.role})`
        : prettifyIdentifier(calendarId),
      color: fallbackColor
    };
  });

  return {
    // worker block included only in per-worker files (not in the global calendar)
    worker: {
      name: workerInfo.name,
      role: workerInfo.role,
      professionalId: workerInfo.professionalId
    },
    focusDate,
    sortMode: SORT_MODES.includes(options.sortMode) ? options.sortMode : DEFAULT_SORT_MODE,
    calendars,
    appointments: sorted,
    generatedAt: new Date().toISOString(),
    source: {
      projectId: options.projectId || '',
      projectName: options.projectName || '',
      scope: options.scope || 'external'
    }
  };
}

/**
 * Generates per-worker calendar files into a `workers-calendar/` subfolder
 * inside the project's output directory.
 *
 * @param {object} descriptor - Project descriptor
 * @param {object} globalState - Result of buildCalendarState
 * @param {object[]} tasks - Original tasks array from the project payload
 * @param {object} options
 * @returns {{ workerInfo, outputPath, appointmentCount }[]}
 */
function generateWorkerCalendarFiles(descriptor, globalState, tasks, options = {}) {
  if ((descriptor.rootProjectId || descriptor.projectId) !== descriptor.projectId) {
    return [];
  }

  const workers = extractWorkersFromTasks(tasks);
  if (workers.size === 0) return [];

  const workerOutputDir = getWorkerOutputDirectory(descriptor, options.outputDir, options.taskScope);

  const results = [];

  workers.forEach((workerInfo) => {
    const state = buildWorkerCalendarState(workerInfo, globalState.appointments, {
      projectId: descriptor.projectId,
      projectName: options.projectName || descriptor.projectId,
      scope: descriptor.scope,
      sortMode: options.sortMode
    });

    if (state.appointments.length === 0) return;

    fs.mkdirSync(workerOutputDir, { recursive: true });
    const outputPath = path.join(workerOutputDir, `${workerInfo.slug}.calendar.json`);
    fs.writeFileSync(outputPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
    results.push({ workerInfo, outputPath, appointmentCount: state.appointments.length });
  });

  return results;
}

/** Generate all requested calendar variants for a single project descriptor. */
/** Generate calendar file. */
function generateCalendarFile(descriptor, options = {}) {
  const { payload, projectName } = loadDescriptorPayload(descriptor);
  const taskScopes = normalizeTaskScope(options.taskScope, { allowBoth: true }) === 'both'
    ? ['all', 'pending']
    : [normalizeTaskScope(options.taskScope)];

  cleanupLegacyOutputLayout(descriptor, options.outputDir);

  const variants = taskScopes.map((taskScope) => {
    const scopedTasks = filterTasksByScope(payload && payload.tasks, taskScope);
    const scopedPayload = { ...payload, tasks: scopedTasks };
    const state = buildCalendarState(scopedPayload, {
      projectId: descriptor.projectId,
      projectName,
      scope: descriptor.scope,
      sortMode: options.sortMode,
      taskScope
    });
    const outputPath = writeCalendarFile(descriptor, state, options.outputDir, { taskScope });

    const workerCalendars = generateWorkerCalendarFiles(descriptor, state, scopedTasks, {
      outputDir: options.outputDir,
      projectName,
      sortMode: options.sortMode,
      taskScope
    });

    return {
      taskScope,
      state,
      outputPath,
      workerCalendars
    };
  });

  return {
    descriptor,
    variants
  };
}

/** Parse CLI arguments for the calendar generation command. */
/** Parse cli args. */
function parseCliArgs(argv) {
  const args = [...argv];
  const projectIds = [];
  let runAll = false;
  let outputDir = path.join(__dirname, 'output');
  let sortMode = DEFAULT_SORT_MODE;
  let taskScope = 'both';

  while (args.length > 0) {
    const next = args.shift();
    if (next === '--all') {
      runAll = true;
      continue;
    }
    if (next === '--output-dir') {
      outputDir = path.resolve(args.shift() || outputDir);
      continue;
    }
    if (next === '--sort-mode') {
      const candidate = String(args.shift() || '').trim();
      if (SORT_MODES.includes(candidate)) sortMode = candidate;
      continue;
    }
    if (next === '--task-scope') {
      taskScope = normalizeTaskScope(args.shift(), { allowBoth: true });
      continue;
    }
    projectIds.push(next);
  }

  return {
    runAll,
    outputDir,
    sortMode,
    taskScope,
    projectIds: projectIds.length > 0 ? projectIds.map(normalizeProjectId) : ['github-task-manager']
  };
}

/** Run the calendar generation CLI for one or more TaskDB projects. */
function main(argv = process.argv.slice(2)) {
  const repoRoot = path.join(__dirname, '..', '..');
  const options = parseCliArgs(argv);
  const descriptors = options.runAll
    ? listProjectDescriptors(repoRoot)
    : options.projectIds
        .map((projectId) => resolveProjectDescriptor(projectId, repoRoot))
        .filter(Boolean)
        .flatMap((descriptor) => expandProjectDescriptor(descriptor));

  if (!descriptors.length) {
    console.error('No matching TaskDB projects were found for calendar export.');
    process.exitCode = 1;
    return;
  }

  let generated = 0;
  let skipped = 0;

  descriptors.forEach((descriptor) => {
    try {
      const result = generateCalendarFile(descriptor, {
        outputDir: options.outputDir,
        sortMode: options.sortMode,
        taskScope: options.taskScope
      });

      result.variants.forEach((variant) => {
        console.log(`Generated calendar export for ${descriptor.scope}/${descriptor.projectId} [${variant.taskScope}] -> ${variant.outputPath}`);
        if (variant.workerCalendars && variant.workerCalendars.length > 0) {
          variant.workerCalendars.forEach(({ workerInfo, outputPath, appointmentCount }) => {
            console.log(`  Worker: ${workerInfo.name} (${workerInfo.role}) [${appointmentCount} tasks] -> ${outputPath}`);
          });
        }
      });

      generated += 1;
    } catch (error) {
      console.warn(`Skipped ${descriptor.scope}/${descriptor.projectId}: ${error && error.message ? error.message : String(error)}`);
      skipped += 1;
    }
  });

  if (generated === 0 && skipped > 0) {
    process.exitCode = 1;
  }
}

/**
 * Groups appointments by assigned worker, returning a Map keyed by worker
 * identifier (professionalId → fallback professional → 'unassigned').
 *
 * Useful for generating a per-worker schedule view from a single project's
 * calendar state:
 *
 *   const byWorker = groupAppointmentsByWorker(state.appointments);
 *   for (const [workerId, appts] of byWorker) { ... }
 *
 * @param {object[]} appointments - Normalized appointment objects from buildCalendarState.
 * @returns {Map<string, object[]>}
 */
function groupAppointmentsByWorker(appointments) {
  const grouped = new Map();

  toFlatArray(appointments).forEach((appointment) => {
    if (!isPlainObject(appointment)) return;

    const workerId = String(appointment.professionalId || appointment.professional || 'unassigned').trim() || 'unassigned';

    if (!grouped.has(workerId)) {
      grouped.set(workerId, []);
    }
    grouped.get(workerId).push(appointment);
  });

  return grouped;
}

module.exports = {
  buildAppointment,
  buildCalendarState,
  buildWorkerCalendarState,
  extractWorkersFromTasks,
  filterTasksByScope,
  generateCalendarFile,
  groupAppointmentsByWorker,
  listProjectDescriptors,
  normalizeTaskScope,
  parseCliArgs,
  resolveProjectDescriptor,
  toIsoDateTime,
  uniqueStrings
};

if (require.main === module) {
  main();
}