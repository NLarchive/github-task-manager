# API Reference

This repository exposes a local development API through `server.js` and a secure GitHub write proxy through `tools/cloudflare-worker/worker.js`.

## Local API Server

Start the local server from the repository root:

```bash
npm start
```

Then call the local API at:

```text
http://localhost:3000/api/
```

### Key endpoints

- `GET /api/health`
  - Returns `{ ok: true }`.
- `GET /api/projects`
  - Lists discovered TaskDB projects.
- `GET /api/module?project=<projectId>&path=<relativeModulePath>`
  - Reads a single project module file.
- `GET /api/scan-path?path=<relativeOrAbsoluteFolder>`
  - Scans a folder for task modules and discovers local projects.
- `GET /api/tasks?project=<projectId>`
  - Reads the synchronized full `node.tasks.json` payload for a project.
- `PUT /api/tasks?project=<projectId>`
  - Writes a full project payload and regenerates derived CSV/state files.
- `PATCH /api/task?project=<projectId>&task_id=<id>`
  - Updates a single task within a project `node.tasks.json`.
- `POST /api/create-mcp`
  - Marks a list of task IDs as critical path in a project.

### Notes

- The local API server is the correct persistence layer for local task editing.
- If you want to preserve task edits to disk, do not use only a static server such as `python -m http.server`.
- CORS is enabled for browser origins when the local server is running, allowing web UI clients to call `/api/*` from `http://localhost:3000` or another local host origin.

## CLI Support

The repository also includes CLI-style tooling under `tools/scripts/` and package scripts in `package.json`.

See `cli/README.md` for local CLI commands and examples.
