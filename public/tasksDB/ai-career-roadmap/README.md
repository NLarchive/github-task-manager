# AI Career Roadmap (tasksDB)

This folder is a standalone project database for the GitHub Task Manager UI.

## Files

- `tasks.json`: primary data file (project metadata + categories + workers + tasks)
- `tasks.csv`: derived export (generated from `tasks.json`)
- `state/`: derived summaries grouped by status (generated from `tasks.json`)
- `history/`: optional archival snapshots

## Regenerating derived files

From the repo root:

- `node tools/scripts/regenerate-tasks-csv.js ai-career-roadmap`
- `node tools/scripts/generate-state-files.js ai-career-roadmap`
