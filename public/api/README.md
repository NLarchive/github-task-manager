# Task Graph API — Automation & Agent Contract

This project exposes two HTTP surfaces:

- The local development server in `server.js`
- The Cloudflare write proxy in `tools/cloudflare-worker/worker.js`

This document is intentionally aligned to the code that exists today. It is the contract automation, scripts, MCP adapters, and AI agents should follow instead of inferring behavior from the UI.

---

## Design Standards

- Prefer explicit project scoping via `project` or `projectId` on every multi-project call.
- Use JSON for request and response payloads.
- Treat `GET` endpoints as read-only.
- Treat write endpoints as full-document synchronization unless the endpoint explicitly documents patch semantics.
- Prefer documented server and worker endpoints over scraping DOM state.
- For agent workflows, discover first, then read, then write.

---

## Surface Summary

### Local server (`server.js`)

Base URL when running locally:

```text
http://localhost:3000
```

Purpose:

- serve the app and graph UI
- list projects
- load project payloads and module payloads
- scan local folders for TaskDB projects
- read/write synchronized local TaskDB files

### Cloudflare worker (`tools/cloudflare-worker/worker.js`)

Base URL:

```text
<your configured worker URL>
```

Purpose:

- authenticated GitHub-backed writes
- public read-only task history lookup
- remote health check

---

## Local Server Endpoints

### `GET /api/health`

Health probe for the local Node server.

Response:

```json
{ "ok": true }
```

---

### `GET /api/projects`

Lists discovered projects by scanning the configured `tasksDB` roots.

Response:

```json
{
  "projects": [
    { "id": "github-task-manager", "scope": "external" },
    { "id": "test-tasks", "scope": "local" }
  ]
}
```

---

### `GET /api/module?project=<projectId>&path=<relativeModulePath>`

Returns a single module file from within a project after safe path validation.

Required query params:

- `project`: project id
- `path`: relative module path inside that project

Common errors:

- `400` invalid or missing params
- `404` module file not found

---

### `GET /api/scan-path?path=<relativeOrAbsoluteFolder>`

Scans a local folder for `tasks.json` files and returns a discovered-project summary.

Use this for folder-based local projects and editor/agent workflows that need discovery without modifying registry files first.

Response shape:

```json
{
  "ok": true,
  "scanPath": "public/tasksDB/local",
  "resolvedPath": "D:/.../public/tasksDB/local",
  "projectName": "My Project",
  "rootModule": "tasks.json",
  "tasksJsonUrl": "/tasksDB/local/my-project/node.tasks.json",
  "files": [
    {
      "relativePath": "frontend/node.tasks.json",
      "name": "Frontend",
      "label": "Frontend",
      "taskCount": 12,
      "description": "...",
      "status": "In Progress",
      "department": "4-ENGINEERING",
      "type": "module"
    }
  ]
}
```

---

### `GET /api/tasks?project=<projectId>`

Reads the synchronized project payload for a project.

This is the primary read endpoint for automation. It returns the canonical full project payload, not just the `tasks[]` array.

Response:

```json
{
  "project": { "name": "GitHub Task Manager" },
  "categories": [],
  "workers": [],
  "tasks": [],
  "navigation": { "modules": [] }
}
```

Common errors:

- `404` when `tasks.json` does not exist for the requested project

---

### `PUT /api/tasks?project=<projectId>`

Replaces the full project payload on local disk and regenerates derived files.

Behavior:

- validates that the request body has a `tasks` array
- rejects duplicate `task_id` values
- writes `tasks.json`
- regenerates `tasks.csv`
- regenerates `state/*.json`

Request body:

```json
{
  "project": { "name": "GitHub Task Manager" },
  "categories": [],
  "workers": [],
  "tasks": []
}
```

Success response:

```json
{ "ok": true, "tasks": 42 }
```

Important note:

- This endpoint does **not** implement item-level `POST /api/tasks/:id`, `PATCH`, or `DELETE` routes.
- Clients are expected to read the full payload, modify it, and write the updated full payload back.

---

## Worker Endpoints

### `GET /health`

Worker health endpoint.

Response:

```json
{ "status": "ok" }
```

---

### `GET /api/task-history?project=<projectId>&taskId=<optional>&limit=<optional>`

Returns append-only task history events from the remote `history/changes.ndjson` file.

Query params:

- `project`: required project id
- `taskId`: optional task filter
- `limit`: optional integer, clamped to `1..500`, default `200`

Response:

```json
{
  "items": [
    {
      "ts": "2026-04-18T19:46:00.000Z",
      "projectId": "github-task-manager",
      "action": "update",
      "taskId": "12",
      "taskName": "Refine API docs",
      "changeSummary": "status, progress_percentage"
    }
  ]
}
```

---

### `PUT /api/tasks`

Authenticated GitHub-backed file update endpoint.

Required JSON body:

```json
{
  "projectId": "github-task-manager",
  "accessPassword": "<project-or-master-password>",
  "filePath": "public/tasksDB/external/github-task-manager/node.tasks.json",
  "content": "{\n  \"tasks\": []\n}",
  "message": "Update node.tasks.json",
  "actor": "automation-bot"
}
```

Behavior:

- validates the project id
- validates password against project or master secret
- validates the target path against allowed TaskDB paths
- writes through the GitHub Contents API
- when writing `tasks.json`, appends task-level history events best-effort

Success response:

```json
{
  "success": true,
  "sha": "<blob-sha>",
  "commit": "<commit-sha>"
}
```

Common errors:

- `400` missing required fields, invalid JSON content, unknown project
- `401` invalid access password
- `403` path not allowed or file path outside the selected project scope
- `500` GitHub token not configured

---

## Agent And MCP-Friendly Usage Patterns

Recommended workflow for deterministic automation:

1. `GET /api/projects` to discover known project ids.
2. `GET /api/tasks?project=<id>` to read the full canonical payload.
3. Modify the full payload locally.
4. `PUT /api/tasks?project=<id>` for local-dev writes or `PUT <worker>/api/tasks` for remote GitHub-backed writes.
5. `GET <worker>/api/task-history?project=<id>` when an audit trail is needed.

Natural MCP tool mapping:

- `list_projects` → `GET /api/projects`
- `get_project_payload` → `GET /api/tasks?project=...`
- `put_project_payload` → `PUT /api/tasks?project=...`
- `get_module_payload` → `GET /api/module?project=...&path=...`
- `scan_folder_project` → `GET /api/scan-path?path=...`
- `get_task_history` → `GET <worker>/api/task-history?project=...`

---

## Current Gaps For Future Development

- `public/api/` is documentation-only today; it does not ship a runtime endpoint provider.
- No machine-readable OpenAPI or JSON contract is checked into `public/api/` yet.
- The local server supports full-payload synchronization, not item-level REST CRUD for individual tasks.
- The production write path is the Cloudflare worker, so the public frontend does not own the write API surface by itself.

---

## Non-Goals And Clarifications

- The local server does not currently expose RESTful per-task CRUD endpoints such as `POST /api/tasks/:taskId` or `DELETE /api/tasks/:taskId`.
- The local server does not currently expose `/api/projects/:id` or `/api/registry` endpoints.
- UI code may call documented endpoints, but client `fetch()` usage is not itself an API definition.
- This document is the source of truth until an OpenAPI spec is added.
