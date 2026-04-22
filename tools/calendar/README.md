# Calendar Export Tooling

This folder contains a TaskDB-to-calendar exporter for systems that expect a normalized appointment JSON format.

## Structure

- `constants.js`: allowed recurrence values, sort modes, and calendar defaults
- `parse-task-calendars.js`: CLI + reusable converter from `tasks.json` to appointment/calendar JSON
- `output/`: generated calendar export files for downstream systems, organized by project scope, root project name, and task scope

This exporter also discovers nested `tasks.json` files inside graph-supported project layouts (for example, folder-based subprojects under `public/tasksDB/local/web-e2e-bussines`) so the `--all` command exports both root TaskDB projects and their nested module payloads.

Each root project now gets a sorted output tree:

```text
tools/calendar/output/<scope>/<root-project>/
  calendars/
    all/<descriptor>.calendar.json
    pending/<descriptor>.calendar.json
  workers-calendar/
    all/<worker>.calendar.json
    pending/<worker>.calendar.json
```

`pending` excludes terminal task states (`Done`, `Completed`, `Cancelled`, `Canceled`). The parser also removes the legacy loose-file layout and the old `workers-calendar-pending/` folder when it regenerates a project.

## Why This Lives In `tools/`

Calendar export is a support integration artifact, not part of the shipped browser runtime under `public/`. Keeping it under `tools/` matches the repo's existing pattern for generation, validation, and integration scripts.

## Schema Coverage Review

The current TaskDB standards are sufficient to derive these appointment fields directly:

- `id`: from `task_id` with the project id as a stable namespace
- `date`: from `start_date`
- `endDate`: from `end_date` or `due_date`
- `title`: from `task_name`
- `description`: from `description`
- `status`: mapped from task status to `confirmed`, `tentative`, or `cancelled`
- `attendees`: from `assigned_workers`
- `contact`: from worker/reviewer/creator email fields only (private contact channels)
- `professionalId`: from `task.calendar` overrides or the first assigned worker's stable identifier (`worker_id` preferred, `workerId`/`id` accepted, privacy-safe opaque fallback from email for legacy data)
- `professional`: derived from the assigned worker's role first, then name when role is unavailable
- `category`: from `category_name`
- `tags`: from `tags`
- `priority`: mapped from task priority to a 1-10 scale
- `allDay`: inferred from date-only task fields
- `timezone`: from `project.timezone`, falling back to `UTC`
- `calendarId`: defaults to `default`
- `createdAt`: from `created_date`

The current TaskDB standards do **not** define first-class task fields for these appointment fields:

- `location`
- `url`
- `reminderMinutes`
- `recurrence`
- `recurrenceCount`
- `professionalId`
- explicit calendar name/color metadata

To keep exports valid without changing the base task schema, the parser supports optional overrides on each task via one of these nested objects:

- `task.calendar`
- `task.appointment`
- `task.calendar_event`
- `task.calendarEvent`

Example override:

```json
{
  "task_id": 42,
  "task_name": "Client review",
  "start_date": "2026-04-20",
  "end_date": "2026-04-20",
  "calendar": {
    "calendarId": "consulting",
    "calendarName": "Consulting",
    "calendarColor": "#0ea5e9",
    "location": "Remote",
    "url": "https://meet.example.com/room",
    "status": "tentative",
    "recurrence": "weekly",
    "reminderMinutes": 30,
    "professionalId": "pro-123"
  }
}
```

For privacy-safe worker management, prefer storing a stable `worker_id` on workers and in `assigned_workers`. If a legacy task only has email, the exporter keeps email in `contact` and derives an opaque `professionalId` instead of exposing raw email as the worker identity.

## Usage

Generate both full and pending exports for one project:

```bash
node tools/calendar/parse-task-calendars.js github-task-manager --task-scope both
```

Generate only the pending view for one project:

```bash
node tools/calendar/parse-task-calendars.js github-task-manager --task-scope pending
```

Generate only the full-task view for one project:

```bash
node tools/calendar/parse-task-calendars.js github-task-manager --task-scope all
```

Generate both views for all discoverable root TaskDB projects:

```bash
node tools/calendar/parse-task-calendars.js --all --task-scope both
```

Write to a custom output directory:

```bash
node tools/calendar/parse-task-calendars.js github-task-manager --task-scope pending --output-dir ./tmp/calendar-output
```

Package script shortcuts:

```bash
npm run calendar:generate
npm run calendar:generate:full
npm run calendar:generate:pending
npm run calendar:generate:all
```