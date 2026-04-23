# Calendar Export Module

This folder contains browser-facing calendar export helpers and UI examples.

## Files

- `js/task-ics-export.js` generates and downloads calendar artifacts for browser surfaces.
- `snippets/calendar-dropdown-snippets.html` contains reusable markup examples for list-style and graph-style calendar controls.

Use this folder for runtime calendar export support in the public app shell.

## Architecture

- Browser runtime helpers live in `public/calendar/`.
- CLI-based export generation, schema mapping, and worker calendar state production live in `tools/calendar/`.
