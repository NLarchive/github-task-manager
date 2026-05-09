# CLI Support

This project supports CLI workflows through package scripts and standalone Node scripts.

## Recommended commands

From the repository root:

```bash
npm install
npm start
npm test
npm run lint
npm run validate:tasks
npm run tasks:generate-state
npm run calendar:generate:full
```

## Existing CLI/tooling locations

- `package.json` - common scripts for local development, testing, validation, and export.
- `tools/scripts/` - Node scripts for TaskDB validation, CSV generation, calendar generation, and other automation.
- `tests/` - test runner and unit test harness.

## Local development CLI flow

1. Start the local API server:

```bash
npm start
```

2. Open the app in a browser at:

- `http://localhost:3000/`
- `http://localhost:3000/graph-display/`

3. Use the local API to persist edits to disk.

## Adding a new CLI entrypoint

1. Add a new script under `tools/scripts/`.
2. Export a Node-compatible CLI by using `process.argv` or a small wrapper.
3. Add a package script in `package.json` if the command should be easily discoverable.
