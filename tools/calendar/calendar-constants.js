/**
 * Shared constants for calendar export sorting, recurrence, colors, and defaults.
 */

const RECURRENCE_VALUES = Object.freeze(['none', 'daily', 'weekly', 'monthly', 'yearly']);
/** Supported appointment sort modes for generated calendar state files. */
const SORT_MODES = Object.freeze(['date-asc', 'date-desc', 'priority-desc', 'priority-asc', 'title-asc', 'title-desc', 'created-desc', 'created-asc']);
/** Valid normalized appointment status values for calendar exports. */
const APPOINTMENT_STATUSES = Object.freeze(['confirmed', 'tentative', 'cancelled']);

/** Default calendar identifier when no task-specific calendar id is provided. */
const DEFAULT_CALENDAR_ID = 'default';
/** Default sort mode applied to generated calendar exports. */
const DEFAULT_SORT_MODE = 'date-asc';
/** Default timezone used when the task or project does not provide one. */
const DEFAULT_TIMEZONE = 'UTC';
/** Default numeric appointment priority used when no explicit priority is mapped. */
const DEFAULT_PRIORITY = 5;
/** Default fallback color applied to generated calendar definitions. */
const DEFAULT_CALENDAR_COLOR = '#1f77b4';
/** Palette cycled across generated calendars when no explicit color is configured. */
const CALENDAR_COLOR_PALETTE = Object.freeze([
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf'
]);

module.exports = {
  RECURRENCE_VALUES,
  SORT_MODES,
  APPOINTMENT_STATUSES,
  DEFAULT_CALENDAR_ID,
  DEFAULT_SORT_MODE,
  DEFAULT_TIMEZONE,
  DEFAULT_PRIORITY,
  DEFAULT_CALENDAR_COLOR,
  CALENDAR_COLOR_PALETTE
};