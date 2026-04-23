# Health Diagnostics App

This folder is the standalone health and diagnostics mini-app for the public frontend.

## Structure

- `index.html` is the app shell.
- `css/health.css` owns the page styling.
- `js/runtime-health-checker.js` owns lightweight runtime behavior and diagnostics.

The health surface is intentionally independent so it can evolve without mixing inline scripts or styles into other app shells.
