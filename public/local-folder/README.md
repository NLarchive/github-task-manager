# Local Folder Integration Module

This module owns the browser local-folder integration used by multiple frontend surfaces.

## Files

- `js/local-folder-scanner.js` discovers TaskDB projects from a user-selected local folder and stores them in browser storage.
- `js/folder-picker-trigger.js` binds UI buttons and result states to the scanner without coupling that behavior to a specific app shell.

Keep cross-app folder loading here so list and graph stay thin and feature-focused.
