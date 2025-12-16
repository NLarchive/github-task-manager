# Graph Display (Interactive Career Graph Template)

This folder is a **template** for an interactive, graph-based CV/portfolio.
It ships with **sample data** (no personal info) and a modular CSS setup.

## Quick start

### Option A: run with a simple Node static server (recommended)
From the repo root:

```bash
npx http-server "./graph-display" -p 8080
```

Open:
- http://localhost:8080/index.html

> Why a server? The app uses ES modules (`type="module"`) and most browsers block them from `file://`.

### Option B: run with PHP’s built-in server
If you have PHP installed:

```bash
php -S localhost:8080 -t graph-display
```

## Customize your content

### 1) Choose a template (Career vs Task Management)
The menu now includes a **Graph template** selector.

You can also deep-link via query param:

- Career: `index.php?template=career`
- Task management: `index.php?template=task-management`

### 2) Edit the graph templates
File: js/graph-data.js

This file now contains **multiple templates**:
- `Career (Template)` (the original CV graph)
- `Task Management (Project)` (dependency-layered tasks)

To add your own, follow the pattern in `TEMPLATE_REGISTRY` and export via `getAvailableTemplates()` / `loadTemplate()`.

- `cypherExportData.rawNodes`: the nodes that appear in the Career graph.
  - `labels: ['Domain']` → parent nodes (big nodes)
  - `labels: ['Subcategory']` → child nodes (small nodes)
  - `properties.layer` controls vertical layer placement (0..4)
  - `properties.parent` on children ties them to a parent for styling and layout.

- `cypherExportData.rawRelationships`: how nodes connect.
  - `HAS_FOUNDATION`, `HAS_SUBCATEGORY`, `DEVELOPS`, `CREATES`, `LEADS_TO`
  - These relationship types drive link styling and the legend.

- `graphDetailsData`: what appears in the node popup and the Classic CV view.
  - Each entry is keyed by node `id`.
  - `title` is the header shown in popups/CV.
  - `items` is an array of strings (HTML is allowed).
  - `profile.photoUrl` is optional (used for the menu button image + CV header photo).

Task Management template notes:
- **Layering is computed from dependencies**: tasks with no dependencies → Layer 1, tasks depending on Layer 1 → Layer 2, etc.
- **Node color = priority** (Critical/High/Medium/Low)
- **Node size = estimated hours**

### 3) Adjust Classic CV sections
File: js/cv-generator.js

The `defaultCvConfig.sections` array controls which groups appear in the “Classic CV” popup.

Common edits:
- Change section titles
- Point a section at a different parent node (`parentNodeId`) or categories (`categoryNodeIds`)
- Change sorting:
  - `alpha`
  - `chrono-reverse` (expects years in titles like `(2023-Present)`)

### 4) Update the profile image
- Current placeholder: images/team/profile-placeholder.svg
- Replace it with your own image and update:
  - js/graph-data.js → `graphDetailsData.profile.photoUrl`

## PWA / Offline caching

Files:
- manifest.json
- sw.js

Notes:
- The service worker pre-caches key assets for offline use.
- After changing cached assets, bump `CACHE_NAME` in sw.js to force an update.
- During development, a service worker can “stick” old assets; hard-refresh or unregister in DevTools if needed.

### Troubleshooting

- If the embedded graph (iframe) fails to load in the Task Manager UI, check your server path. The Task Manager tries several candidate paths (including `/graph-display/index.html` and `/public/graph-display/index.html`). If you serve the site from the project root, use `/public/` variants or run the server from the `public` folder.
- The service worker previously attempted to cache an `index.php` file which doesn't exist in this template; that noisy 404 was removed from `sw.js`.
- For debugging network 404s, open DevTools Network tab and look for the full candidate URLs (the task manager will now log tried candidates in the console).

## Folder layout

- index.php: HTML shell (works like static HTML too)
- css/: modular stylesheet entrypoints
- css/components/: component styles
- js/main-graph.js: D3 rendering + interactions
- js/graph-data.js: sample dataset + node popup content
- js/cv-generator.js: Classic CV popup renderer
- js/walkthrough.js: guided tour overlay
- images/: icons and optional profile image
