// Calendar schema definitions and task-to-calendar field mappings.
//
// tasks-template-config.js is the single source of truth for task fields,
// enums, and defaults.  This file imports from it and derives calendar-
// specific mappings so that any change to the task schema automatically
// propagates to the calendar layer.

const TEMPLATE_CONFIG = require('../../public/config/tasks-template-config.js');

// ---------------------------------------------------------------------------
// Task field lists — derived from the canonical task schema
// ---------------------------------------------------------------------------

/**
 * All known task field names, flattened from TEMPLATE_CONFIG.FIELD_CATEGORIES.
 * Use this as an authoritative whitelist when iterating over task fields.
 */
const TASK_KNOWN_FIELDS = Object.freeze([
  ...TEMPLATE_CONFIG.FIELD_CATEGORIES.AUTOMATIC,
  ...TEMPLATE_CONFIG.FIELD_CATEGORIES.REQUIRED_INPUT,
  ...TEMPLATE_CONFIG.FIELD_CATEGORIES.OPTIONAL_INPUT
]);

/**
 * Type-annotated schema for documentation purposes.
 * Extends TASK_KNOWN_FIELDS with calendar-alias fields supported by the parser
 * (title, calendar, calendar_event, calendarEvent).
 * Enum-backed fields reference TEMPLATE_CONFIG.ENUMS / TEMPLATE_CONFIG.CATEGORIES.
 */
const TASK_FIELD_SCHEMA = Object.freeze({
  // Automatic fields (TEMPLATE_CONFIG.FIELD_CATEGORIES.AUTOMATIC)
  task_id: 'integer',
  created_date: 'date-time-string',
  creator_id: 'string',
  completed_date: 'date-time-string | null',
  // Required input fields (TEMPLATE_CONFIG.FIELD_CATEGORIES.REQUIRED_INPUT)
  task_name: 'string',
  description: 'string',
  start_date: 'date-string',
  end_date: 'date-string',
  priority: 'string (enum: TEMPLATE_CONFIG.ENUMS.TASK_PRIORITY)',
  status: 'string (enum: TEMPLATE_CONFIG.ENUMS.TASK_STATUS)',
  estimated_hours: 'number',
  category_name: 'string (enum: TEMPLATE_CONFIG.CATEGORIES)',
  // Optional input fields (TEMPLATE_CONFIG.FIELD_CATEGORIES.OPTIONAL_INPUT)
  due_date: 'date-string | null',
  sprint_name: 'string | null',
  complexity: 'string (enum: TEMPLATE_CONFIG.ENUMS.COMPLEXITY) | null',
  blocker_reason: 'string | null',
  acceptance_criteria: 'string[] | string | null',
  reviewer: 'object | null',
  subtasks: 'array',
  links: 'array',
  progress_percentage: 'number',
  actual_hours: 'number',
  is_critical_path: 'boolean',
  tags: 'string[]',
  assigned_workers: 'object[] | string[] (worker_id preferred; email is private contact data)',
  parent_task_id: 'integer | null',
  dependencies: 'array',
  comments: 'array',
  attachments: 'array',
  // Calendar meta aliases — optional inline overrides embedded in a task object
  title: 'string',
  calendar: 'object',
  calendar_event: 'object',
  calendarEvent: 'object'
});

// ---------------------------------------------------------------------------
// Calendar meta field names
// ---------------------------------------------------------------------------

/**
 * Field names that may contain an embedded calendar override inside a task
 * object.  The parser checks these in order and merges the first one found.
 */
const CALENDAR_META_FIELD_NAMES = Object.freeze([
  'calendar',
  'appointment',
  'calendar_event',
  'calendarEvent'
]);

// ---------------------------------------------------------------------------
// Worker field mapping
// ---------------------------------------------------------------------------

/**
 * Defines how an assigned_workers entry maps to calendar appointment fields.
 *
 * Design rationale:
 *   professional   ← role    Public-facing: describes the worker's function (e.g. "Developer").
 *                             Using role instead of name keeps the calendar meaningful even
 *                             after a worker is replaced on the backend.
 *   professionalId ← worker_id
 *                           Preferred stable identifier. Use worker_id / workerId / id when present.
 *                           If legacy data only has email, derive a deterministic opaque ID from it
 *                           so the public calendar shape does not expose raw email as identity.
 *   attendees      ← name    Human-readable participant list for display in scheduler UIs.
 *   contact        ← email   Private contact channel list. Kept semantically separate from
 *                             professionalId so the same email is not reused as public identity.
 */
const WORKER_FIELD_MAP = Object.freeze({
  professional: 'role',
  professionalId: 'worker_id',
  professionalIdFallbacks: Object.freeze(['workerId', 'id', 'privacy-safe-hash(email)']),
  attendeeName: 'name',
  contactEmail: 'email'
});

// ---------------------------------------------------------------------------
// Task-to-appointment value mappings
// ---------------------------------------------------------------------------

/**
 * Maps TEMPLATE_CONFIG.ENUMS.TASK_PRIORITY string values to numeric
 * appointment priority (1–10 scale).  Unknown values fall back to DEFAULT_PRIORITY.
 */
const PRIORITY_MAP = Object.freeze({
  critical: 10,
  high: 8,
  medium: 5,
  low: 3
});

/**
 * Maps TEMPLATE_CONFIG.ENUMS.TASK_STATUS values to calendar appointment status.
 * Status values not present here resolve to 'confirmed'.
 */
const STATUS_TO_APPOINTMENT_MAP = Object.freeze({
  cancelled: 'cancelled',
  canceled: 'cancelled',
  'not started': 'tentative',
  planning: 'tentative',
  blocked: 'tentative',
  'on hold': 'tentative',
  'pending review': 'tentative',
  'in review': 'tentative'
});

// ---------------------------------------------------------------------------
// Appointment output schema
// ---------------------------------------------------------------------------

/**
 * Ordered list of field names in a normalized calendar appointment object.
 * This is the authoritative shape consumed by calendar scheduler UIs.
 *
 * Compared with a minimal scheduler library field list this set adds:
 *   - contact         — private contact channels (worker/reviewer/creator) separate from attendees
 *   - professional    — display name of the primary assigned worker (for resource views)
 *   - professionalId  — stable identifier of the primary assigned worker
 *
 * 'professional' is kept alongside 'professionalId' because scheduler resource
 * views commonly display a name string rather than a raw ID.
 */
const APPOINTMENT_FIELDS = Object.freeze([
  'id',
  'date',
  'endDate',
  'recurrence',
  'title',
  'description',
  'location',
  'url',
  'status',
  'attendees',
  'contact',
  'category',
  'tags',
  'priority',
  'allDay',
  'timezone',
  'calendarId',
  'reminderMinutes',
  'recurrenceCount',
  'professional',
  'professionalId',
  'createdAt'
]);

/**
 * Default values for a normalized appointment, used when a source field is
 * absent or null.  Numeric/string defaults align with constants.js:
 *   priority   5         → DEFAULT_PRIORITY
 *   timezone   null      → resolved at runtime from project settings, then 'UTC'
 *   calendarId 'default' → DEFAULT_CALENDAR_ID
 */
const APPOINTMENT_DEFAULTS = Object.freeze({
  id: null,
  date: null,
  endDate: null,
  recurrence: 'none',
  title: 'Untitled',
  description: '',
  location: '',
  url: '',
  status: 'confirmed',
  attendees: [],
  contact: [],
  category: 'general',
  tags: [],
  priority: 5,
  allDay: false,
  timezone: null,
  calendarId: 'default',
  reminderMinutes: null,
  recurrenceCount: null,
  professional: null,
  professionalId: null,
  createdAt: null
});

const TASK_TO_CALENDAR_FIELD_SOURCES = Object.freeze({
  // ---------------------------------------------------------------------------
  // Task-to-calendar field source paths
  // ---------------------------------------------------------------------------

  // For each appointment field, an ordered list of source paths within a task
  // object.  Paths whose first segment is a CALENDAR_META_FIELD_NAMES value
  // (e.g. 'calendar.date') resolve from the embedded calendar meta object;
  // all other paths resolve directly from the task root.
  //
  // The resolver walks each entry in order and returns the first defined value.
  id: [
    'calendar.id',
    'appointment.id',
    'calendarEvent.id',
    'id'
  ],
  date: [
    'calendar.date',
    'appointment.date',
    'calendarEvent.date',
    'date',
    'start_date',
    'due_date',
    'end_date',
    'created_date'
  ],
  endDate: [
    'calendar.endDate',
    'appointment.endDate',
    'calendarEvent.endDate',
    'end_date',
    'due_date'
  ],
  title: [
    'calendar.title',
    'appointment.title',
    'task_name',
    'title'
  ],
  description: [
    'calendar.description',
    'appointment.description',
    'description'
  ],
  location: [
    'calendar.location',
    'appointment.location',
    'location'
  ],
  url: [
    'calendar.url',
    'appointment.url',
    'url',
    'links',
    'attachments'
  ],
  status: [
    'calendar.status',
    'appointment.status',
    'status'
  ],
  category: [
    'calendar.category',
    'calendar.category_name',
    'category_name'
  ],
  tags: [
    'calendar.tags',
    'appointment.tags',
    'tags'
  ],
  priority: [
    'calendar.priority',
    'appointment.priority',
    'priority'
  ],
  calendarId: [
    'calendar.calendarId',
    'appointment.calendarId',
    'calendarId'
  ],
  createdAt: [
    'calendar.createdAt',
    'appointment.createdAt',
    'created_date',
    'createdAt',
    'start_date'
  ],
  recurrence: [
    'calendar.recurrence',
    'appointment.recurrence'
  ],
  recurrenceCount: [
    'calendar.recurrenceCount',
    'appointment.recurrenceCount'
  ],
  reminderMinutes: [
    'calendar.reminderMinutes',
    'appointment.reminderMinutes'
  ],
  professional: [
    'calendar.professional',
    'appointment.professional'
  ],
  professionalId: [
    'calendar.professionalId',
    'appointment.professionalId'
  ],
  allDay: [
    'calendar.allDay',
    'appointment.allDay'
  ]
});

/**
 * Type annotations for calendar appointment output fields (documentation).
 * Keys match APPOINTMENT_FIELDS order exactly.
 */
const CALENDAR_APPOINTMENT_SCHEMA = Object.freeze({
  id: 'string',
  date: 'ISO 8601 date-time string',
  endDate: 'ISO 8601 date-time string | null',
  recurrence: 'none | daily | weekly | monthly | yearly',
  title: 'string',
  description: 'string',
  location: 'string',
  url: 'string',
  status: 'confirmed | tentative | cancelled',
  attendees: 'string[]',
  contact: 'string[] (private/internal contact channels)',
  category: 'string',
  tags: 'string[]',
  priority: 'number (1–10)',
  allDay: 'boolean',
  timezone: 'string',
  calendarId: 'string',
  reminderMinutes: 'number | null',
  recurrenceCount: 'number | null',
  professional: 'string | null',
  professionalId: 'string | null (stable opaque worker identifier)',
  createdAt: 'ISO 8601 date-time string'
});

module.exports = {
  TEMPLATE_CONFIG,
  TASK_KNOWN_FIELDS,
  TASK_FIELD_SCHEMA,
  CALENDAR_META_FIELD_NAMES,
  WORKER_FIELD_MAP,
  PRIORITY_MAP,
  STATUS_TO_APPOINTMENT_MAP,
  APPOINTMENT_FIELDS,
  APPOINTMENT_DEFAULTS,
  CALENDAR_APPOINTMENT_SCHEMA,
  TASK_TO_CALENDAR_FIELD_SOURCES
};
