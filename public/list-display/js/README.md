# List Display Engine - JS Module Reference

This folder owns the list-based task manager runtime.
The list app now loads its feature-specific controller from this folder and composes shared task-engine modules from sibling feature folders.

---

## Notes

- Feature-owned file in this folder:
  - `list-display-controller.js`
- Shared companion modules now live alongside their own feature folders:
  - `../../task-engine/js/task-storage-sync.js`
  - `../../task-engine/js/task-field-automation.js`
  - `../../task-engine/js/task-schema-validator.js`
  - `../../local-folder/js/local-folder-scanner.js`
  - `../../local-folder/js/folder-picker-trigger.js`
  - `../../calendar/js/task-ics-export.js`

