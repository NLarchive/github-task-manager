# List Display App

This folder is the list-based task manager mini-app.
It mirrors the structure of `graph-display/` so the HTML shell, CSS entrypoints, and JS entrypoints are grouped together and easier to recognize.

## Structure

```
list-display/
  index.html        ← App shell
  css/              ← Owned list-display stylesheets
  js/               ← Owned list-display runtime files
```

## Notes

- Runtime configuration still lives in `../config/`
- The list-display shell loads its controller from `./js/list-display-controller.js`
- Shared cross-app helpers now live in `../local-folder/`, `../calendar/`, and `../task-engine/`
- Task data still lives in `../tasksDB/`
- The root `../index.html` page is the navigation hub that redirects here by default
