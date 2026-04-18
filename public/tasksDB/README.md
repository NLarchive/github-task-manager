# TasksDB — Project Graph Data Format

This folder contains all project graph data files. Each project lives in a subfolder and consists of a `tasks.json` file (and optional companion files).

---

## Directory Layout

```
tasksDB/
  registry.json                  ← master list of all available graphs
  _schema/
    graph-template.schema.json   ← JSON Schema for tasks.json validation
  _templates/
    starter_project_template.json       ← minimal starter template
    starter_project_template_v2.json    ← full-featured starter
    starter_project_template.csv        ← CSV import format
  _examples/
    career/                      ← example career graph
    task-management/             ← example task graph
  external/                      ← public / shared projects
    github-task-manager/
    first-graph/
  local/                         ← gitignored personal projects
```

---

## `tasks.json` Format

A complete `tasks.json` has four top-level keys:

```json
{
  "project": { … },
  "categories": [ … ],
  "workers": [ … ],
  "tasks": [ … ],
  "navigation": { … }
}
```

### `project` object

```json
{
  "name": "My Project",
  "description": "What this project delivers",
  "start_date": "2025-01-01",
  "end_date": "2025-06-30",
  "status": "In Progress",
  "budget": 50000,
  "graph_end": {
    "mode": "loop | terminal | milestone",
    "summary": "What this graph closure means",
    "next_step": "What happens after all tasks complete",
    "success_signal": "How to know the milestone is done",
    "owner": "Team or person responsible after close",
    "maintenance_rhythm": "Cadence for recurring reviews",
    "next_graph": "optional-next-project-id"
  }
}
```

**`graph_end.mode` values:**
- `terminal` — project fully ends; no continuation
- `loop` — ongoing delivery; returns to intake/maintenance cycle
- `milestone` — phase boundary; feeds into `next_graph`

---

### `categories` array

```json
[
  { "name": "Backend Development", "parent_category_name": null },
  { "name": "API Design", "parent_category_name": "Backend Development" }
]
```

Categories organize tasks visually and semantically. The engine uses `category_name` on each task to group them in the popup detail view.

---

### `workers` array

```json
[
  { "name": "Alice Smith", "email": "alice@example.com", "role": "Lead Developer" }
]
```

Optional. Workers can be assigned to tasks via `assignee_id` (future field).

---

### `tasks` array

Each task is a node in the graph:

```json
{
  "task_id": 1,
  "task_name": "Set up CI pipeline",
  "description": "Configure GitHub Actions for automated testing and linting.",
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
  "dependencies": [
    { "predecessor_task_id": 3, "type": "FS", "lag_days": 0 }
  ],
  "subtasksPath": "external/my-project/subtasks"
}
```

**Required fields:** `task_id` (unique integer), `task_name`

**Optional fields:**

| Field | Type | Description |
|---|---|---|
| `description` | string | Shown in popup detail |
| `priority` | `"Critical" \| "High" \| "Medium" \| "Low"` | Controls node size and color intensity |
| `status` | `"Not Started" \| "In Progress" \| "Done" \| "On Hold" \| "Cancelled"` | Controls node animation and opacity. `"Completed"` is accepted as a legacy alias. |
| `progress_percentage` | 0–100 | Shown in popup |
| `estimated_hours` | number | Controls node radius |
| `actual_hours` | number | Shown in popup |
| `is_critical_path` | boolean | Shown in popup |
| `category_name` | string | Groups task in the graph layer |
| `parent_task_id` | integer \| null | Hierarchical parent task (optional, informational) |
| `dependencies` | array | Defines graph edges (see below) |
| `subtasksPath` | string | Module path to navigate into — enables 📂 View Subtasks button |

---

#### `dependencies` format

Dependencies define directed edges between task nodes.

**Structured form (recommended):**
```json
"dependencies": [
  { "predecessor_task_id": 2, "type": "FS", "lag_days": 0 },
  { "predecessor_task_id": 5, "type": "SS", "lag_days": 2 }
]
```

**Plain ID form (legacy):**
```json
"dependencies": [2, 5]
```

**Dependency types:**

| Type | Meaning |
|---|---|
| `FS` | Finish-to-Start (default) — task cannot start until predecessor finishes |
| `SS` | Start-to-Start — task can start when predecessor starts |
| `FF` | Finish-to-Finish — task must finish when predecessor finishes |
| `SF` | Start-to-Finish — unusual; task finishes when predecessor starts |

The engine also supports `requisites: [id, id]` (v1 format) as an alias for plain-ID dependencies.

---

#### String-name format (project_task_template)

A second format uses `task_name` strings instead of IDs in dependencies.
The engine (`buildProjectTaskTemplate`) auto-assigns numeric IDs and resolves name references:

```json
{
  "task_name": "Deploy to staging",
  "dependencies": [
    { "predecessor_task_name": "Run integration tests", "type": "FS" }
  ]
}
```

---

### `navigation` object

Enables the **Modules sidebar** with sub-graph tree navigation.

```json
{
  "navigation": {
    "modules": [
      {
        "path": "external/my-project/backend",
        "label": "Backend Services",
        "name": "backend",
        "type": "module",
        "taskIds": ["BACK"]
      }
    ]
  }
}
```

Each module entry:

| Field | Description |
|---|---|
| `path` | Relative path to the sub-project folder (containing `tasks.json`) |
| `label` | Display name in the Modules sidebar |
| `name` | Short identifier (used for matching task codes) |
| `type` | Optional badge label (e.g. `"module"`, `"service"`, `"epic"`) |
| `taskIds` | Optional array of task code prefixes for auto-matching subtask paths |

---

## `registry.json`

Controls which graphs are available in the UI template-selector dropdown:

```json
{
  "templates": [
    {
      "id": "my-project-tasks",
      "name": "My Project",
      "path": "local/my-project/tasks.json",
      "description": "Short description shown in selector",
      "type": "task-management"
    }
  ]
}
```

| Field | Description |
|---|---|
| `id` | URL-safe identifier; used as `?template=<id>` parameter |
| `name` | Display name in dropdown |
| `path` | Path relative to `tasksDB/` |
| `description` | Optional tooltip/subtitle |
| `type` | `"task-management"` or `"career"` |

---

## Graph Layers (Topological Depth)

The engine computes a **dependency layer** for each task:
- Tasks with **no dependencies** → Layer 1
- Tasks that depend only on Layer-1 tasks → Layer 2
- And so on…

The layer determines the **vertical position** of nodes in the graph.
Node **color** encodes priority; node **size** encodes estimated hours.

---

## Companion Files

Each project folder can optionally contain:

```
my-project/
  tasks.json          ← required
  tasks.csv           ← CSV export (auto-generated, human-readable)
  state/              ← snapshot files (auto-generated by generate-state-files.js)
  tour/
    graph-tour.json   ← walkthrough step definitions (optional)
  history/            ← commit-style change log (optional)
```

---

## Adding a New Project

1. Create `public/tasksDB/local/<your-project>/tasks.json` following the format above.
2. Add an entry to `public/tasksDB/registry.json`.
3. Open the graph UI and select your project from the template dropdown.

Use `tools/scripts/validate-tasks-schema.js` to validate your JSON before committing.
