# Web GitHub Task Manager — Public Frontend

This `public/` folder is served statically by `server.js` and hosted on GitHub Pages.
It is the core shipped application surface: the task-manager list UI, the interactive
graph engine, runtime configuration, and the task database all live here.

Everything outside `public/` is support infrastructure for that core surface:

- `tests/` validates behavior
- `tools/` handles worker, deployment, and maintenance workflows
- `.github/` handles CI/CD automation

---

## Top-level Files

| File | Purpose |
|---|---|
| `index.html` | Task Manager list UI (CRUD operations) |
| `styles.css` | Styles for the list UI |
| `health-check.html` | Simple liveness check page |

---

## Core Runtime Files

These files form the main execution path of the product:

| File | Role |
|---|---|
| `index.html` | Bootstraps the list-based task manager UI |
| `scripts/task-manager-app.js` | Main controller for project selection, auth, rendering, and UI actions |
| `scripts/task-database.js` | Canonical task payload read/write layer and sync logic |
| `scripts/template-validator.js` | Validation rules for task and project payloads |
| `scripts/template-automation.js` | Auto-population and task-template helpers |
| `graph-display/index.html` | Bootstraps the graph visualization app |
| `graph-display/js/main-graph.js` | Main graph runtime/controller |
| `graph-display/js/graph-data.js` | Converts TaskDB payloads into graph-ready nodes/links/details |
| `config/projects-config.js` | Declares which projects the UI can open |
| `tasksDB/registry.json` | Registry used for project discovery |

`server.js` sits outside `public/`, but it is the local runtime bridge used by the core app for local reads, writes, and module loading.

---

## Sub-folders

```
public/
  config/          ← Runtime configuration (tokens, project list, worker URL)
  graph-display/   ← Interactive D3 graph engine (its own mini-app)
  scripts/         ← JS modules for the list UI
  styles/          ← CSS for the list UI
  tasksDB/         ← All project data (tasks.json files + registry)
  api/             ← Documentation and integration guidance for the current API surface
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
| `tasks-template-config.js` | Graph template display settings |

---

## Task Database (`tasksDB/`)

All graph data lives here. See [tasksDB/README.md](tasksDB/README.md) for the complete
format guide covering `tasks.json`, `registry.json`, dependencies, navigation modules,
and how to add a new project.

---

## API / Agent Integration (`api/`)

The `api/` folder is currently documentation-first. It describes how automation, scripts,
and AI agents should talk to the existing local server and worker surfaces.

Current gap summary:

- `public/api/` does not currently contain a runtime endpoint provider
- there is no machine-readable OpenAPI/JSON contract checked into `public/api/` yet
- the current write model is full-payload synchronization, not per-task REST CRUD

See [api/README.md](api/README.md) for the code-aligned contract that exists today.

---

## Server API (provided by `server.js`)

The development server (`server.js`) exposes a JSON REST API over HTTP.
All endpoints are under `/api/` and accept/return `application/json`.

### Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects` | List all known projects (from `tasksDB/registry.json`) |
| `GET` | `/api/module?project=<id>&path=<relativeModulePath>` | Read one module payload within a project |
| `GET` | `/api/scan-path?path=<folder>` | Discover a local folder-backed TaskDB project |

### Tasks

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/tasks?project=<id>` | Read the full canonical project payload |
| `PUT` | `/api/tasks?project=<id>` | Replace the full canonical project payload and regenerate derived files |

### Current API Gaps

- No item-level `POST`, `PATCH`, or `DELETE` task endpoints exist today
- No `/api/projects/:id` endpoint is implemented today
- No `/api/registry` endpoint is implemented today
- Production GitHub-backed writes are provided by the Cloudflare worker, not by a runtime inside `public/`

### Static Files

All other `GET` requests serve static files from `public/`.

---

## Deployment

- **Development:** `npm start` → serves from `localhost:3000`
- **Production:** GitHub Pages serves `public/` directly (static only, no server API)
- **Worker proxy:** Cloudflare Worker (`tools/cloudflare-worker/worker.js`) handles GitHub API calls from production

The graph display and all static assets work fully offline after the first load (PWA with service worker at `graph-display/sw.js`).
