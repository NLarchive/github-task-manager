/**
 * task-ics-export.js
 * Client-side ICS (iCalendar) generator for GitHub Task Manager.
 * Works as a browser global (window.calendarExport) or CommonJS module.
 *
 * Usage:
 *   calendarExport.downloadCalendar(tasks, { scope: 'pending', projectName: 'My Project' });
 */
(function (root) {
    'use strict';

    /** ICS PRIORITY values (1=highest, 9=lowest per RFC 5545) */
    const PRIORITY_ICS = { Critical: 1, High: 3, Medium: 5, Low: 9 };

    /** Map task status → ICS STATUS */
    const STATUS_ICS = {
        'Not Started':    'NEEDS-ACTION',
        'In Progress':    'IN-PROCESS',
        'Done':           'COMPLETED',
        'Cancelled':      'CANCELLED',
        'On Hold':        'TENTATIVE',
        'Blocked':        'TENTATIVE',
        'Pending Review': 'IN-PROCESS',
        'Pending':        'NEEDS-ACTION',
    };

    function escICS(v) {
        return String(v == null ? '' : v)
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\r?\n/g, '\\n');
    }

    function toICSDate(d) {
        if (!d) return null;
        const s = String(d).replace(/-/g, '').slice(0, 8);
        return s.length === 8 ? s : null;
    }

    /** Add one calendar day to a YYYY-MM-DD string (ICS DTEND is exclusive). */
    function addOneDay(dateStr) {
        try {
            const dt = new Date(dateStr + 'T00:00:00');
            dt.setDate(dt.getDate() + 1);
            return dt.toISOString().slice(0, 10).replace(/-/g, '');
        } catch (_) {
            return toICSDate(dateStr);
        }
    }

    function taskToVEvent(task) {
        const id = task.task_id || task.id || ('node-' + Math.random().toString(36).slice(2));
        const uid = `task-${id}@github-task-manager`;
        const summary = escICS(task.task_name || task.name || task.label || 'Untitled Task');
        const startRaw = task.start_date || task.startDate;
        const endRaw   = task.end_date   || task.endDate;
        const start    = toICSDate(startRaw);
        const end      = endRaw ? addOneDay(endRaw) : start;
        const priority = PRIORITY_ICS[task.priority] || 5;
        const statusVal = task.status || 'Not Started';
        const icsStatus = STATUS_ICS[statusVal] || 'NEEDS-ACTION';

        const descParts = [
            task.description || null,
            task.priority    ? 'Priority: '   + task.priority : null,
            'Status: ' + statusVal,
            task.category_name ? 'Category: ' + task.category_name : null,
            task.estimated_hours != null ? 'Est. hours: ' + task.estimated_hours : null,
            (task.is_critical_path === true || task.is_critical_path === 'true' || task.is_critical_path === 1)
                ? 'Critical Path: Yes' : null,
        ].filter(Boolean);

        const workerNames = _getTaskWorkers(task);
        if (workerNames.length) descParts.push('Workers: ' + workerNames.join(', '));

        const lines = ['BEGIN:VEVENT', 'UID:' + uid, 'SUMMARY:' + summary];
        if (start) {
            lines.push('DTSTART;VALUE=DATE:' + start);
            lines.push('DTEND;VALUE=DATE:' + (end || start));
        }
        lines.push('PRIORITY:' + priority);
        lines.push('STATUS:' + icsStatus);
        if (descParts.length) lines.push('DESCRIPTION:' + escICS(descParts.join('\n')));
        const cats = [task.category_name, task.priority].filter(Boolean).join(',');
        if (cats) lines.push('CATEGORIES:' + escICS(cats));
        lines.push('END:VEVENT');
        return lines.join('\r\n');
    }

    /** Returns true when a task is NOT done or cancelled. */
    function isPending(t) {
        const s = String(t.status || '').toLowerCase().trim();
        return s !== 'done' && s !== 'cancelled';
    }

    /** Returns true when a task is marked as critical path. */
    function isCritical(t) {
        return t.is_critical_path === true || t.is_critical_path === 'true' || t.is_critical_path === 1;
    }

    /** Extract a plain worker name from a worker entry (string or object). */
    function _workerName(w) {
        return (typeof w === 'object' ? (w.name || w.worker_id || '') : String(w || '')).trim();
    }

    /** Return array of non-empty worker name strings for a task. */
    function _getTaskWorkers(task) {
        const aw = task.assigned_workers;
        if (!aw) return [];
        const list = Array.isArray(aw) ? aw : String(aw).split(',');
        return list.map(_workerName).filter(Boolean);
    }

    /**
     * Generate ICS text from a tasks array.
     * @param {Array}  tasks        Array of task objects.
     * @param {Object} opts
     * @param {string} opts.scope        'all' | 'pending' | 'critical' | 'worker'
     * @param {string} opts.workerName   Required when scope === 'worker'
     * @param {string} opts.projectName  Calendar display name
     */
    function generateICS(tasks, opts) {
        opts = opts || {};
        var scope       = opts.scope       || 'all';
        var workerName  = opts.workerName  || null;
        var projectName = opts.projectName || 'Tasks';

        var filtered = (tasks || []).filter(function (t) {
            return t && (t.task_id || t.id || t.label);
        });

        if (scope === 'pending') {
            filtered = filtered.filter(isPending);
        } else if (scope === 'critical') {
            filtered = filtered.filter(isCritical);
        } else if (scope === 'worker' && workerName) {
            var wl = workerName.toLowerCase();
            filtered = filtered.filter(function (t) {
                return _getTaskWorkers(t).some(function (n) {
                    return n.toLowerCase().indexOf(wl) !== -1;
                });
            });
        }

        var calName  = escICS(projectName + ' \u2014 ' + scope);
        var vevents  = filtered.map(taskToVEvent);

        var lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//GitHub Task Manager//EN',
            'X-WR-CALNAME:' + calName,
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
        ].concat(vevents, ['END:VCALENDAR']);

        return lines.join('\r\n');
    }

    /** Trigger an ICS file download in the browser. */
    function downloadCalendarICS(icsText, filename) {
        var blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href        = url;
        a.download    = filename || 'tasks.ics';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    }

    function downloadCalendarJsonState(jsonState, filename) {
        var blob = new Blob([JSON.stringify(jsonState, null, 2)], { type: 'application/json;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename || 'tasks.calendar.json';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    }

    function normalizeCalendarDate(value) {
        if (!value) return null;
        var raw = String(value).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            return raw + 'T00:00:00.000Z';
        }
        var date = new Date(raw);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    function buildCalendarTaskWorkers(task) {
        var workers = Array.isArray(task.assigned_workers) ? task.assigned_workers : [];
        if (!workers.length && task.creator_id) {
            return [String(task.creator_id)];
        }
        return _getTaskWorkers(task);
    }

    function buildCalendarAppointment(task) {
        if (!task || typeof task !== 'object') return null;

        var start = normalizeCalendarDate(task.start_date || task.startDate || task.date || task.created_date);
        var end = normalizeCalendarDate(task.end_date || task.endDate || task.due_date);
        var allDay = Boolean(start && /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/.test(start) && (!end || /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/.test(end)));
        var title = escICS(task.task_name || task.name || task.label || 'Untitled Task');
        var descriptionParts = [
            task.description || null,
            task.priority ? 'Priority: ' + task.priority : null,
            task.status ? 'Status: ' + task.status : null,
            task.category_name ? 'Category: ' + task.category_name : null,
            task.estimated_hours != null ? 'Est. hours: ' + task.estimated_hours : null,
        ].filter(Boolean);

        var workers = buildCalendarTaskWorkers(task);
        var professional = workers.length ? String(workers[0]) : '';
        var professionalId = task.assigned_workers && Array.isArray(task.assigned_workers)
            ? String(task.assigned_workers[0]?.worker_id || task.assigned_workers[0]?.id || professional)
            : String(task.creator_id || professional);

        return {
            id: String(task.task_id || task.id || 'task-' + Math.random().toString(36).slice(2)),
            date: start || new Date().toISOString(),
            endDate: end || start || new Date().toISOString(),
            recurrence: String(task.recurrence || 'none').trim().toLowerCase(),
            title: String(task.task_name || task.name || task.label || 'Untitled Task'),
            description: descriptionParts.join('\n'),
            location: String(task.location || task.place || ''),
            url: String(task.url || ''),
            status: String(task.status || 'Not Started'),
            attendees: workers,
            contact: Array.isArray(task.assigned_workers)
                ? task.assigned_workers.flatMap(function (w) {
                    if (!w) return [];
                    if (typeof w === 'string') return looksLikeEmail(w) ? [w] : [];
                    return [String(w.email || w.contact || '')].filter(Boolean);
                })
                : [],
            category: String(task.category_name || task.category || 'General'),
            tags: Array.isArray(task.tags) ? task.tags : String(task.tags || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean),
            priority: PRIORITY_ICS[task.priority] || 5,
            allDay: allDay,
            timezone: 'UTC',
            calendarId: 'default',
            reminderMinutes: null,
            recurrenceCount: null,
            professional: professional || null,
            professionalId: professionalId || null,
            createdAt: normalizeCalendarDate(task.created_date || task.createdAt || task.start_date) || new Date().toISOString()
        };
    }

    function generateCalendarState(tasks, opts) {
        opts = opts || {};
        var scope = opts.scope || 'all';
        var projectName = String(opts.projectName || 'Tasks').trim() || 'Tasks';
        var workerName = String(opts.workerName || '').trim();

        var filtered = (tasks || []).filter(function (task) {
            return task && (task.task_id || task.id || task.task_name || task.name || task.label);
        });

        if (scope === 'pending') {
            filtered = filtered.filter(isPending);
        } else if (scope === 'critical') {
            filtered = filtered.filter(isCritical);
        } else if (scope === 'worker' && workerName) {
            var lowerWorker = workerName.toLowerCase();
            filtered = filtered.filter(function (task) {
                return buildCalendarTaskWorkers(task).some(function (name) {
                    return String(name).toLowerCase().indexOf(lowerWorker) !== -1;
                });
            });
        }

        var appointments = filtered.map(buildCalendarAppointment).filter(Boolean);
        appointments.sort(function (a, b) {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        var calendars = [{
            id: 'default',
            name: projectName,
            color: '#1f77b4'
        }];

        return {
            focusDate: appointments[0] ? appointments[0].date : new Date().toISOString(),
            sortMode: 'date-asc',
            calendars: calendars,
            appointments: appointments
        };
    }

    function downloadCalendarJson(tasks, opts) {
        var state = generateCalendarState(tasks, opts);
        var projectName = String(opts && opts.projectName || 'tasks').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        var suffix = (opts && opts.scope === 'worker' && opts.workerName)
            ? '-' + String(opts.workerName).toLowerCase().replace(/[^a-z0-9]+/g, '-')
            : '';
        downloadCalendarJsonState(state, projectName + '-' + (opts && opts.scope ? opts.scope : 'all') + suffix + '.calendar.json');
    }

    /**
     * Build and immediately download an ICS file.
     * @param {Array}  tasks
     * @param {Object} opts  { scope, projectName, workerName }
     */
    function downloadCalendar(tasks, opts) {
        opts = opts || {};
        var scope       = opts.scope       || 'all';
        var projectName = opts.projectName || 'tasks';
        var workerName  = opts.workerName  || null;
        var ics      = generateICS(tasks, { scope: scope, projectName: projectName, workerName: workerName });
        var base     = (projectName || 'tasks').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        var wSuffix  = (scope === 'worker' && workerName)
            ? '-' + workerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            : '';
        downloadCalendarICS(ics, base + '-' + scope + wSuffix + '.ics');
    }

    /** Return unique worker names found across all tasks (sorted). */
    function getWorkersFromTasks(tasks) {
        var seen = {};
        (tasks || []).forEach(function (t) {
            _getTaskWorkers(t).forEach(function (n) { seen[n.toLowerCase()] = n; });
        });
        return Object.values(seen).sort();
    }

    var calendarExport = {
        generateICS:          generateICS,
        downloadCalendar:     downloadCalendar,
        downloadCalendarICS:  downloadCalendarICS,
        generateCalendarState: generateCalendarState,
        downloadCalendarJson: downloadCalendarJson,
        getWorkersFromTasks:  getWorkersFromTasks,
        isPending:            isPending,
        isCritical:           isCritical,
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = calendarExport;
    } else {
        root.calendarExport = calendarExport;
    }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
