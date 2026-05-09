# Task Bridge Module

Reusable localhost bridge for browser apps that need atomic multi-file writes.

## Goals
- Keep file editing logic isolated from app-specific UI code.
- Expose ETag-based sync endpoints for event-driven refresh.
- Support batch writes and optional post-save hooks.

## Structure
- `server/file-editor.js`: atomic file read/write utilities.
- `server/bridge-router.js`: HTTP API router with CORS + ETag support.
- `server.js`: minimal runnable local bridge host.

## API
- `HEAD /api/tasks`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/status`

## Project Integration
For this repo, browser integration lives in:
- `public/task-engine/js/bridge/cache-watchdog.js`
- `public/task-engine/js/bridge/task-storage-sync.js`
- `public/task-engine/js/bridge/taskdb-bridge-integration.js`

These files are app adapters and can be replaced in other projects while keeping this module unchanged.
