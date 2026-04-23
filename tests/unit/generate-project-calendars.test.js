/**
 * Unit coverage for TaskDB-to-calendar generation and project descriptor discovery.
 */

const {
  buildCalendarState,
  filterTasksByScope,
  listProjectDescriptors
} = require('../../tools/calendar/generate-project-calendars.js');
const {
  DEFAULT_CALENDAR_ID,
  DEFAULT_SORT_MODE
} = require('../../tools/calendar/calendar-constants.js');

describe('Calendar Parser', () => {
  it('builds normalized appointments from standard task fields', () => {
    const state = buildCalendarState({
      project: {
        name: 'Sample Project',
        timezone: 'UTC'
      },
      tasks: [
        {
          task_id: 1,
          task_name: 'Kickoff Planning',
          description: 'Align the launch plan.',
          start_date: '2026-04-19',
          end_date: '2026-04-20',
          priority: 'High',
          status: 'In Progress',
          category_name: 'Planning',
          tags: ['launch', 'team'],
          assigned_workers: [{ name: 'Alice', email: 'alice@example.com', role: 'Project Manager', worker_id: 'pm-42' }],
          created_date: '2026-04-18T10:00:00Z',
          creator_id: 'owner@example.com'
        }
      ]
    }, {
      projectId: 'sample-project',
      scope: 'external'
    });

    expect(state.sortMode).toBe(DEFAULT_SORT_MODE);
    expect(state.focusDate).toBe('2026-04-19T00:00:00.000Z');
    expect(state.calendars).toHaveLength(1);
    expect(state.calendars[0].id).toBe(DEFAULT_CALENDAR_ID);
    expect(state.calendars[0].name).toBe('Sample Project');
    expect(state.calendars[0].color).toBeTruthy();

    expect(state.appointments).toHaveLength(1);
    const appointment = state.appointments[0];
    expect(appointment.id).toBe('sample-project:1');
    expect(appointment.date).toBe('2026-04-19T00:00:00.000Z');
    expect(appointment.endDate).toBe('2026-04-20T23:59:59.999Z');
    expect(appointment.title).toBe('Kickoff Planning');
    expect(appointment.status).toBe('confirmed');
    expect(appointment.attendees).toContain('Alice');
    expect(appointment.contact).toContain('alice@example.com');
    expect(appointment.contact).toContain('owner@example.com');
    expect(appointment.professional).toBe('Project Manager');
    expect(appointment.professionalId).toBe('pm-42');
    expect(appointment.priority).toBe(8);
    expect(appointment.allDay).toBe(true);
    expect(appointment.calendarId).toBe(DEFAULT_CALENDAR_ID);
    expect(appointment.createdAt).toBe('2026-04-18T10:00:00.000Z');
  });

  it('derives a privacy-safe professionalId when only email is available', () => {
    const state = buildCalendarState({
      project: {
        name: 'Fallback Project',
        timezone: 'UTC'
      },
      tasks: [
        {
          task_id: 2,
          task_name: 'Email Only Worker',
          description: 'Verify opaque worker ids for legacy data.',
          start_date: '2026-04-22',
          end_date: '2026-04-22',
          priority: 'Medium',
          status: 'Not Started',
          category_name: 'Planning',
          assigned_workers: [{ name: 'Bob', email: 'bob@example.com', role: 'Developer' }],
          created_date: '2026-04-20T08:00:00Z'
        }
      ]
    }, {
      projectId: 'fallback-project',
      scope: 'external'
    });

    const appointment = state.appointments[0];
    expect(appointment.professional).toBe('Developer');
    expect(appointment.professionalId).toMatch(/^worker-[a-f0-9]{12}$/);
    expect(appointment.professionalId).not.toBe('bob@example.com');
    expect(appointment.contact).toContain('bob@example.com');
  });

  it('filters out done and cancelled tasks for pending calendar scope', () => {
    const state = buildCalendarState({
      project: {
        name: 'Pending Project',
        timezone: 'UTC'
      },
      tasks: [
        {
          task_id: 1,
          task_name: 'Keep me',
          description: 'Still pending',
          start_date: '2026-04-22',
          end_date: '2026-04-22',
          priority: 'Medium',
          status: 'Not Started',
          category_name: 'Planning'
        },
        {
          task_id: 2,
          task_name: 'Exclude me',
          description: 'Already done',
          start_date: '2026-04-22',
          end_date: '2026-04-22',
          priority: 'Medium',
          status: 'Done',
          category_name: 'Planning'
        },
        {
          task_id: 3,
          task_name: 'Also exclude me',
          description: 'Cancelled',
          start_date: '2026-04-22',
          end_date: '2026-04-22',
          priority: 'Medium',
          status: 'Cancelled',
          category_name: 'Planning'
        }
      ]
    }, {
      projectId: 'pending-project',
      scope: 'external',
      taskScope: 'pending'
    });

    expect(state.source.taskScope).toBe('pending');
    expect(state.source.taskCount).toBe(1);
    expect(state.appointments).toHaveLength(1);
    expect(state.appointments[0].title).toBe('Keep me');
  });

  it('keeps only pending tasks when filtering arrays directly', () => {
    const filtered = filterTasksByScope([
      { task_id: 1, status: 'In Progress' },
      { task_id: 2, status: 'Done' },
      { task_id: 3, status: 'Completed' },
      { task_id: 4, status: 'Blocked' }
    ], 'pending');

    expect(filtered.map((task) => task.task_id)).toEqual([1, 4]);
  });

  it('discovers nested tasks.json files in folder-based graph projects', () => {
    const path = require('path');
    const repoRoot = path.join(__dirname, '..', '..');
    const descriptors = listProjectDescriptors(repoRoot);

    expect(descriptors.some((d) => d.scope === 'local' && d.projectId === 'web-e2e-bussines')).toBeTruthy();
    expect(descriptors.some((d) => {
      if (d.scope !== 'local' || !d.projectId.startsWith('web-e2e-bussines-')) return false;
      const normalizedPath = d.tasksJsonPath.replace(/\\/g, '/');
      return normalizedPath.endsWith('src/apps/PRIVATE/1-STRATEGY/crm/tasks.json');
    })).toBeTruthy();
  });

  it('uses explicit calendar overrides for unsupported appointment fields', () => {
    const state = buildCalendarState({
      project: {
        name: 'Operations',
        timezone: 'UTC'
      },
      tasks: [
        {
          task_id: 7,
          task_name: 'Client Review Call',
          description: 'Review the signed proposal.',
          start_date: '2026-04-21',
          end_date: '2026-04-21',
          priority: 'Medium',
          status: 'On Hold',
          category_name: 'Operations',
          calendar: {
            calendarId: 'consulting',
            calendarName: 'Consulting',
            calendarColor: '#123456',
            location: 'Remote',
            url: 'https://meet.example.com/consulting',
            recurrence: 'weekly',
            recurrenceCount: 4,
            reminderMinutes: 30,
            professionalId: 'pro-123',
            attendees: ['Client Team'],
            contact: ['ops@example.com'],
            status: 'tentative',
            allDay: false,
            date: '2026-04-21T09:30:00-05:00',
            endDate: '2026-04-21T10:00:00-05:00'
          },
          created_date: '2026-04-20T08:00:00Z'
        }
      ]
    }, {
      projectId: 'ops'
    });

    expect(state.calendars).toHaveLength(1);
    expect(state.calendars[0].id).toBe('consulting');
    expect(state.calendars[0].name).toBe('Consulting');
    expect(state.calendars[0].color).toBe('#123456');

    const appointment = state.appointments[0];
    expect(appointment.date).toBe('2026-04-21T14:30:00.000Z');
    expect(appointment.endDate).toBe('2026-04-21T15:00:00.000Z');
    expect(appointment.location).toBe('Remote');
    expect(appointment.url).toBe('https://meet.example.com/consulting');
    expect(appointment.recurrence).toBe('weekly');
    expect(appointment.recurrenceCount).toBe(4);
    expect(appointment.reminderMinutes).toBe(30);
    expect(appointment.professionalId).toBe('pro-123');
    expect(appointment.calendarId).toBe('consulting');
    expect(appointment.status).toBe('tentative');
    expect(appointment.attendees).toContain('Client Team');
    expect(appointment.contact).toContain('ops@example.com');
    expect(appointment.allDay).toBe(false);
  });
});