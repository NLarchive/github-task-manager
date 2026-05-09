# Agentic IDE Server

This folder is the root launch surface for the Agentic IDE bridge runtime.

Preferred start command from repository root:

```powershell
node D:\web\web-github-task-manager\public\agentic-ide\server\main.js
```

Folder contract:

- `main.js` launches the bridge runtime
- `schema.json` documents the HTTP request and response surface
- `manifest.json` documents entry, tests, and workspace relations
- `tests/health.json` records the expected health checks

Implementation note:

The executable logic still lives in `../js/bridge-server.js`. This folder exists so the server has a stable root entrypoint and explicit metadata without forcing an immediate internal code move.