const RECURRENCE_VALUES = Object.freeze(['none', 'daily', 'weekly', 'monthly', 'yearly']);
const SORT_MODES = Object.freeze(['date-asc', 'date-desc', 'priority-desc', 'priority-asc', 'title-asc', 'title-desc', 'created-desc', 'created-asc']);
const APPOINTMENT_STATUSES = Object.freeze(['confirmed', 'tentative', 'cancelled']);

const DEFAULT_CALENDAR_ID = 'default';
const DEFAULT_SORT_MODE = 'date-asc';
const DEFAULT_TIMEZONE = 'UTC';
const DEFAULT_PRIORITY = 5;
const DEFAULT_CALENDAR_COLOR = '#1f77b4';
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