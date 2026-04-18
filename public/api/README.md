# Task Graph API — Agent & Integration Reference

This folder documents the REST API and task JSON schema for external tools and AI agents
to interact with project graphs programmatically — without using the UI.

---

## Base URL

When running locally: `http://localhost:3000`

---

## Authentication

All `/api/` write endpoints require either:
- The `X-Access-Secret` header matching the value in `config/access-secret.local.js`
- Or the `Authorization: Bearer <github_token>` header for GitHub-proxied operations

Read endpoints (`GET`) do not require authentication on the local server.

---

## Projects API

### List all projects

```http
GET /api/projects
```

**Response `200`:**
```json
{
  "projects": [
    {
      "id": "github-task-manager-tasks",
      "name": "GitHub Task Manager",
      "path": "external/github-task-manager/tasks.json",
      "description": "…",
      "type": "task-management"
    }
  ]
}
```

---

### Get a project's full data

```http
GET /api/projects/:id
```

`:id` is the `id` from `registry.json` (e.g. `github-task-manager-tasks`).

**Response `200`:** Full `tasks.json` object (see Task JSON Format below).

---

### Create or replace a project

```http
PUT /api/projects/:id
Content-Type: application/json

{ … full tasks.json … }
```

Writes the body as `tasksDB/<resolved-path>/tasks.json` and regenerates `tasks.csv`.

**Response `200`:** `{ "ok": true, "id": "…" }`

---

## Tasks API

### List tasks

```http
GET /api/tasks?project=<project-id>
```

**Response `200`:**
```json
{
  "project": "github-task-manager-tasks",
  "tasks": [ … ]
}
```

---

### Get a single task

```http
GET /api/tasks/:taskId?project=<project-id>
```

**Response `200`:** The task object.
**Response `404`:** `{ "error": "Task not found" }`

---

### Create a task

```http
POST /api/tasks?project=<project-id>
Content-Type: application/json

{
  "task_name": "Write integration tests",
  "description": "Cover all API endpoints",
  "priority": "High",
  "status": "Not Started",
  "estimated_hours": 8,
  "category_name": "Testing",
  "dependencies": [
    { "predecessor_task_id": 3, "type": "FS", "lag_days": 0 }
  ]
}
```

`task_id` is auto-assigned (max existing ID + 1).

**Response `201`:** The created task with assigned `task_id`.

---

### Update a task

```http
PUT /api/tasks/:taskId?project=<project-id>
Content-Type: application/json

{
  "status": "Done",
  "actual_hours": 7,
  "progress_percentage": 100
}
```

Only the provided fields are updated (partial update).

**Response `200`:** The updated task.

---

### Delete a task

```http
DELETE /api/tasks/:taskId?project=<project-id>
```

Also removes this task from the `dependencies` of any other tasks that reference it.

**Response `200`:** `{ "ok": true, "deleted": <taskId> }`

---

## Registry API

### Get registry

```http
GET /api/registry
```

**Response `200`:** Full `registry.json`.

---

### Update registry

```http
PUT /api/registry
Content-Type: application/json

{
  "templates": [ … ]
}
```

**Response `200`:** `{ "ok": true }`

---

## Task JSON Schema

Every task in a `tasks.json` file follows this schema.

### Minimal task

```json
{
  "task_id": 1,
  "task_name": "My task"
}
```

### Full task

```json
{
  "task_id": 1,
  "task_name": "Set up CI pipeline",
  "description": "Configure GitHub Actions for automated testing.",
  "start_date": "2025-01-05",
  "end_date": "2025-01-10",
  "priority": "High",
  "status": "Done",
  "progress_percentage": 100,
  "estimated_hours": 8,
  "actual_hours": 6,
  "is_critical_path": true,
  "category_name": "DevOps",
  "parent_task_id": null,
  "creator_id": null,
  "created_date": "2025-01-01",
  "completed_date": "2025-01-10",
  "dependencies": [
    {
      "predecessor_task_id": 3,
      "type": "FS",
      "lag_days": 0
    }
  ],
  "subtasksPath": "external/my-project/backend"
}
```

### Field Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `task_id` | integer | ✅ | Unique identifier within the project |
| `task_name` | string | ✅ | Short display name (shown as graph node label) |
| `description` | string | | Full description shown in popup |
| `start_date` | ISO date string | | Planned start date |
| `end_date` | ISO date string | | Planned end date |
| `priority` | `"Critical"` `"High"` `"Medium"` `"Low"` | | Controls node size and color. Defaults to `"Medium"` |
| `status` | `"Not Started"` `"In Progress"` `"Done"` `"On Hold"` `"Cancelled"` | | Controls node animation. Defaults to `"Not Started"`. `"Completed"` remains accepted as a legacy alias. |
| `progress_percentage` | 0–100 | | Shown in popup |
| `estimated_hours` | number | | Controls node radius (larger = more hours) |
| `actual_hours` | number | | Shown in popup |
| `is_critical_path` | boolean | | Shown in popup |
| `category_name` | string | | Groups task. Should match an entry in `categories[]` |
| `parent_task_id` | integer \| null | | Hierarchical parent (informational; does not create a graph edge) |
| `creator_id` | any | | Optional creator reference |
| `created_date` | ISO date string | | |
| `completed_date` | ISO date string | | |
| `dependencies` | array | | Graph edges to predecessor tasks (see below) |
| `subtasksPath` | string | | Path to a sub-project's folder — enables 📂 View Subtasks navigation |

---

### Dependency Object

```json
{
  "predecessor_task_id": 2,
  "type": "FS",
  "lag_days": 0
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `predecessor_task_id` | integer | ✅ | `task_id` of the preceding task |
| `type` | `"FS"` `"SS"` `"FF"` `"SF"` | | Dependency type. Defaults to `"FS"` |
| `lag_days` | number | | Days of lag/lead between tasks |

**Dependency types:**
- `FS` (Finish-to-Start): successor cannot start until predecessor finishes *(most common)*
- `SS` (Start-to-Start): successor can start when predecessor starts
- `FF` (Finish-to-Finish): successor must finish when predecessor finishes
- `SF` (Start-to-Finish): successor finishes when predecessor starts *(rare)*

---

## Full Project Payload Example

```json
{
  "project": {
    "name": "My Feature Project",
    "description": "Build and ship feature X",
    "start_date": "2025-02-01",
    "end_date": "2025-03-31",
    "status": "In Progress",
    "budget": 10000,
    "graph_end": {
      "mode": "milestone",
      "summary": "Feature X ships to production",
      "next_step": "Monitor metrics and address incidents",
      "success_signal": "Feature flags enabled for 100% of users",
      "owner": "Product team"
    }
  },
  "categories": [
    { "name": "Design", "parent_category_name": null },
    { "name": "Engineering", "parent_category_name": null },
    { "name": "QA", "parent_category_name": null }
  ],
  "workers": [
    { "name": "Alice Smith", "email": "alice@example.com", "role": "Lead Developer" }
  ],
  "tasks": [
    {
      "task_id": 1,
      "task_name": "Design mockups",
      "priority": "High",
      "status": "Done",
      "estimated_hours": 12,
      "category_name": "Design",
      "dependencies": []
    },
    {
      "task_id": 2,
      "task_name": "Implement backend API",
      "priority": "Critical",
      "status": "In Progress",
      "estimated_hours": 40,
      "category_name": "Engineering",
      "dependencies": [
        { "predecessor_task_id": 1, "type": "FS", "lag_days": 0 }
      ]
    },
    {
      "task_id": 3,
      "task_name": "Write integration tests",
      "priority": "High",
      "status": "Not Started",
      "estimated_hours": 16,
      "category_name": "QA",
      "dependencies": [
        { "predecessor_task_id": 2, "type": "FS", "lag_days": 0 }
      ]
    }
  ],
  "navigation": {
    "modules": []
  }
}
```

---

## AI Agent Workflow Guide

### Create a new project from scratch

1. `GET /api/registry` — see existing project IDs to avoid conflicts.
2. Choose a unique `id` like `my-project-tasks`.
3. `PUT /api/projects/my-project-tasks` — with the full payload above.
4. `PUT /api/registry` — add entry: `{ "id": "my-project-tasks", "name": "My Project", "path": "local/my-project/tasks.json", "type": "task-management" }`.
5. Open `http://localhost:3000/graph-display/?template=my-project-tasks` to view the graph.

### Add a task with dependencies

```http
POST /api/tasks?project=my-project-tasks
Content-Type: application/json

{
  "task_name": "Deploy to production",
  "priority": "Critical",
  "status": "Not Started",
  "estimated_hours": 4,
  "dependencies": [
    { "predecessor_task_id": 3, "type": "FS" }
  ]
}
```

### Mark a task as complete

```http
PUT /api/tasks/2?project=my-project-tasks
Content-Type: application/json

{
  "status": "Done",
  "progress_percentage": 100,
  "completed_date": "2025-03-15",
  "actual_hours": 38
}
```

### Build a multi-module project

1. Create a root project with a `navigation.modules[]` array:
   ```json
   "navigation": {
     "modules": [
       { "path": "local/my-project/frontend", "label": "Frontend", "type": "module" },
       { "path": "local/my-project/backend",  "label": "Backend",  "type": "module" }
     ]
   }
   ```
2. Create each sub-project at `tasksDB/local/my-project/frontend/tasks.json` and `…/backend/tasks.json`.
3. Add all three to `registry.json`.

Sub-graphs appear in the **📦 Modules** sidebar tab. Tasks within a sub-graph that have `subtasksPath` pointing to another sub-project enable the 📂 View Subtasks navigation button.

---

## Error Responses

All errors return JSON:

```json
{ "error": "Human-readable message", "code": "ERROR_CODE" }
```

| HTTP Status | Meaning |
|---|---|
| `400` | Invalid request body or missing required field |
| `404` | Project or task not found |
| `409` | Duplicate `task_id` detected |
| `500` | Server error (file I/O, JSON parse failure) |
