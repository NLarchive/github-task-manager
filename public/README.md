# Web GitHub Task Manager — Public Frontend

This `public/` folder is served statically by `server.js` and hosted on GitHub Pages.
It contains the full frontend: the task-manager list UI, the interactive graph engine,
all configuration files, and the task database.

---

## Top-level Files

| File | Purpose |
|---|---|
| `index.html` | Task Manager list UI (CRUD operations) |
| `styles.css` | Styles for the list UI |
| `health-check.html` | Simple liveness check page |

---

## Sub-folders

```
public/
  config/          ← Runtime configuration (tokens, project list, worker URL)
  graph-display/   ← Interactive D3 graph engine (its own mini-app)
  scripts/         ← JS modules for the list UI
  styles/          ← CSS for the list UI
  tasksDB/         ← All project data (tasks.json files + registry)
  api/             ← Machine-readable API schema for AI agents and integrations
```

---

## Application Modes

### 1. Task Manager List UI (`index.html`)
A GitHub-dark-themed CRUD interface for managing tasks.

Features:
- Create / Edit / Delete tasks
- Read-only mode for viewing task details
- Project module sidebar (same theme-aware design as graph sidebar)
- Dependency links in read-only mode are clickable — clicking navigates to the dependency task
- Filtering by status, priority, search term
- Commit to GitHub via the Cloudflare Worker proxy

Key scripts:
- `scripts/task-manager-app.js` — Main app class
- `scripts/template-automation.js` — Auto-fill helpers
- `scripts/template-validator.js` — Task form validation
- `scripts/task-database.js` — In-memory task store with JSON/CSV read-write

### 2. Graph Display (`graph-display/index.html`)
An interactive D3 force-directed graph showing the project task network.

Features:
- Nodes = tasks; edges = dependencies
- Click (or touch) any node → permanent blinking selection + detail popup
- Click SVG background → deselect
- "Depends on" links in popup → navigate to dependency node (pan + open modal)
- Modules sidebar (📦 Modules tab) → navigate between sub-project graphs
- Graph Tree sidebar (🌳 Tree tab) → browse all tasks by layer, click to navigate
- On desktop, Modules sidebar stays open after selecting a sub-graph
- Search, zoom, pan, walkthrough tour

See [graph-display/js/README.md](graph-display/js/README.md) for full engine documentation.

---

## Configuration Files (`config/`)

Configuration files are plain JS files that export a value or assign a global variable.
`.local.js` variants are gitignored — copy them from the `.js` originals and fill in real values.

| File | Purpose |
|---|---|
| `github-token.js` | GitHub Personal Access Token for API calls |
| `github-token.local.js` | Local override (gitignored) |
| `github-oauth.js` | OAuth config (if using GitHub OAuth flow) |
| `access-secret.js` | Shared secret for Cloudflare Worker authentication |
| `access-secret.local.js` | Local override (gitignored) |
| `worker-url.js` | URL of the Cloudflare Worker proxy |
| `worker-url.local.js` | Local override (gitignored) |
| `projects-config.js` | List of projects available in the UI |
| `template-config.js` | Graph template display settings |

---

## Task Database (`tasksDB/`)

All graph data lives here. See [tasksDB/README.md](tasksDB/README.md) for the complete
format guide covering `tasks.json`, `registry.json`, dependencies, navigation modules,
and how to add a new project.

---

## API / Agent Integration (`api/`)

The `api/` folder exposes a machine-readable schema and documentation so that AI agents
and automated tools can create, read, update, and delete task projects without using the UI.

See [api/README.md](api/README.md) for the full REST API reference and task JSON schema.

---

## Server API (provided by `server.js`)

The development server (`server.js`) exposes a JSON REST API over HTTP.
All endpoints are under `/api/` and accept/return `application/json`.

### Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects` | List all known projects (from `tasksDB/registry.json`) |
| `GET` | `/api/projects/:id` | Get a project's full `tasks.json` |
| `PUT` | `/api/projects/:id` | Replace a project's entire `tasks.json` |

### Tasks

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/tasks?project=<id>` | List all tasks for a project |
| `POST` | `/api/tasks?project=<id>` | Create a new task |
| `PUT` | `/api/tasks/:taskId?project=<id>` | Update a task by ID |
| `DELETE` | `/api/tasks/:taskId?project=<id>` | Delete a task by ID |

### Registry

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/registry` | Full `registry.json` |
| `PUT` | `/api/registry` | Replace `registry.json` |

### Static Files

All other `GET` requests serve static files from `public/`.

---

## Deployment

- **Development:** `npm start` → serves from `localhost:3000`
- **Production:** GitHub Pages serves `public/` directly (static only, no server API)
- **Worker proxy:** Cloudflare Worker (`tools/cloudflare-worker/worker.js`) handles GitHub API calls from production

The graph display and all static assets work fully offline after the first load (PWA with service worker at `graph-display/sw.js`).
