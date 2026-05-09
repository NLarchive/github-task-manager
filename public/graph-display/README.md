# Graph Display

`public/graph-display/` is a reusable D3 graph UI. It can render:

- direct graph templates with `nodes[]`, `links[]`, and `details{}`
- TaskDB-backed project graphs derived from `node.tasks.json`
- inline subgraphs from `subtasks[]`
- module/subproject graphs from `navigation.modules[]`

The folder still ships with sample career/task data, but the graph runtime is now documented as a portable component instead of only a repo-local template.

## Single Contract

The canonical integration surface lives in `js/shared/graph-design-contract.js`.

It exports:

- `GRAPH_UI_DEFAULTS`: the full runtime default config used by `main-graph.js`
- `GRAPH_UI_CONFIG_SCHEMA`: every supported design/config override key
- `GRAPH_COMPONENT_INPUT_SCHEMA`: the expected shapes for templates, nodes, links, details, TaskDB tasks, inline subtasks, and module navigation
- `GRAPH_RELATION_GUIDE`: the supported edge/relation semantics
- `GRAPH_SEMANTICS_GUIDE`: sizing, coloring, critical-path, and subgraph rules
- `GRAPH_HOST_FEATURES`: what is core to the graph UI vs what is optional host integration
- `GRAPH_COMPONENT_EXAMPLES`: copy/paste-ready example payloads
- `createGraphUiConfig()`, `validateGraphUiConfig()`, `validateGraphTemplateInput()`, `validateGraphComponentInputs()`

At runtime the same contract is exposed on `window.GraphDisplayContract` for host apps and DevTools inspection.

Machine-readable schema snapshots now live in:

- `schema/graph-ui-config.schema.json`
- `schema/graph-template.schema.json`

The browser editor for these payloads lives in:

- `../graph-composer/index.html`

Companion graph pages now live in:

- `project-index.html`: browse a repo or browser-picked folder as a graph of directories and files
- `guide-index.html`: interactive explanation of nodes, sizes, colors, relations, subgraphs, schemas, and critical-path fields

## Core vs Optional

Core graph UI files:

- `css/styles-new.css`
- `js/d3.v7.min.js`
- `js/utils.js`
- `js/main-graph.js`
- `js/graph-data.js`
- `js/cv-generator.js`
- `js/walkthrough.js`
- `js/shared/link-types.js`
- `js/shared/tours.js`
- `js/shared/graph-design-contract.js`
- `js/shared/graph-metric-utils.js`
- `js/shared/graph-template-storage.js`

Optional host integrations:

- `../local-folder/js/*`: local-folder discovery and write-back
- `../task-engine/js/task-schema-clipboard.js`: Copy Schema action
- `../calendar/js/task-ics-export.js`: ICS export

If you copy this folder into another project, the core graph still works without those host integrations. Remove or replace the optional script tags in `index.html` if your host does not provide them.

## Quick Start

### Option A: static server

From the repo root:

```bash
npx http-server "./public" -p 8080
```

Open:

- `http://localhost:8080/graph-display/index.html`
- `http://localhost:8080/graph-display/project-index.html`
- `http://localhost:8080/graph-display/guide-index.html`

### Option B: local dev server

```bash
node server.js
```

This is the easiest option when you also want local TaskDB APIs and folder/project integrations.

`project-index.html` uses the new `/api/project-tree` and `/api/file-content` endpoints when the local server is available. Without the server it can still fall back to the browser folder picker.

## Plug Into Another Project

1. Copy `public/graph-display/` into your host project.
2. Serve `index.html` through any static server. Do not use `file://` because the app uses ES modules.
3. Choose one input strategy:
   - direct template object: `{ id, name, nodes, links, details, meta, configOverrides }`
   - TaskDB source: `node.tasks.json` + registry entry or custom loader path
4. Put visual/runtime overrides in `template.configOverrides`.
5. Remove or replace optional host scripts in `index.html` if you do not need local-folder, clipboard-template, or calendar-export features.
6. Inspect `window.GraphDisplayContract` or import `js/shared/graph-design-contract.js` to wire a host-specific editor, schema form, or template generator.

## What To Author

### Nodes

Direct template nodes should always provide:

- `id`
- `label`

Useful optional node fields:

- `type`: `parent` or `child`
- `layer`: vertical band index
- `parentId`: clustering parent
- `templateType`: semantic role such as `task`, `project-start`, `project-end`
- `priority`: `Critical | High | Medium | Low`
- `estimatedHours`: used by hours-based node sizing
- `status`: used by status visuals

### Node Sizes

There are two supported size modes:

- `fixed`: use `nodeSizes.main` and `nodeSizes.sub`
- `hours`: use `taskSizing.minHours`, `taskSizing.maxHours`, `taskSizing.minRadius`, `taskSizing.maxRadius` together with each task node's `estimatedHours`

### Node Colors

There are two supported color modes:

- `layer`: color by `layer` using `baseLayerColorsHex` and `toneGeneration`
- `priority`: color by task priority using `priorityColorsHex`

Text contrast is derived from `textColorsHex` and the computed node fill color.

### Edges / Relations

The graph runtime understands these relation families:

| Relation | Typical Use | Author In |
|---|---|---|
| `HAS_FOUNDATION` | profile/foundation structure | direct template `rawRelationships[]` |
| `HAS_SUBCATEGORY` | parent-to-child in the same layer | direct template `rawRelationships[]` |
| `DEVELOPS` | capability growth | direct template `rawRelationships[]` |
| `CREATES` | impact/output creation | direct template `rawRelationships[]` |
| `LEADS_TO` | outcome progression | direct template `rawRelationships[]` |
| `HAS_TASK` | synthetic start-to-task edge | derived automatically |
| `DEPENDS_FS/SS/FF/SF/ON` | task scheduling dependencies | `tasks[].dependencies[]` |

The shared guide for relation semantics and force behavior lives in `js/shared/graph-design-contract.js`.

### Subgraphs and Subcomponents

There are three distinct nesting patterns:

- `subtasks[]`: inline popup-driven subgraphs nested inside a task
- `parent_task_id`: child tasks that remain full graph nodes
- `navigation.modules[]`: sidebar-driven module or subproject navigation

Use them intentionally:

- choose `subtasks[]` when the work belongs entirely inside one parent task context
- choose `parent_task_id` when the child task needs its own lifecycle, dependencies, or graph-level navigation
- choose `navigation.modules[]` when the subgraph should load as a separate module/project view

### Critical Path

Critical path is modeled as node metadata, not as a special edge type.

Use:

- `is_critical_path: true` on TaskDB tasks

The graph keeps that flag in the normalized node/task source so hosts can layer custom filtering, legends, exports, or styling on top.

## Example Direct Template

```js
const template = {
  id: 'release-roadmap',
  name: 'Release Roadmap',
  nodes: [
    { id: 'project-start', label: 'Start', type: 'parent', layer: 0, templateType: 'project-start' },
    { id: 'task-1', label: 'Plan Release', type: 'parent', layer: 1, templateType: 'task', priority: 'High', estimatedHours: 6 },
    { id: 'task-2', label: 'Ship Release', type: 'parent', layer: 2, templateType: 'task', priority: 'Critical', estimatedHours: 14 }
  ],
  links: [
    { source: 'project-start', target: 'task-1', type: 'HAS_TASK' },
    { source: 'task-1', target: 'task-2', type: 'DEPENDS_FS' }
  ],
  details: {
    'task-1': { title: 'Plan Release', items: ['Define scope and smoke tests.'] },
    'task-2': { title: 'Ship Release', items: ['Deploy, verify metrics, and handoff.'] }
  },
  meta: {
    profileNodeId: 'project-start',
    coreNodeId: 'task-2',
    legendMode: 'task-management'
  },
  configOverrides: {
    colorMode: 'priority',
    sizeMode: 'hours'
  }
};
```

## TaskDB Authoring Rules

When using `node.tasks.json`:

- `dependencies[]` authors the real predecessor graph
- reverse dependencies are derived automatically into downstream navigation/context
- `parent_task_id` creates full child graph nodes
- `subtasks[]` creates inline subgraphs
- `navigation.modules[]` exposes separate module graphs in the sidebar
- `is_critical_path` marks critical-path work

## Files Worth Editing

- `js/shared/graph-design-contract.js`: graph UI config schema and integration contract
- `js/main-graph.js`: rendering, interactions, and runtime behavior
- `js/graph-data.js`: template loading and TaskDB normalization
- `js/project-index.js`: project explorer graph for folders/files and file previews
- `js/guide-index.js`: interactive graph guide and contract demo
- `js/shared/project-graph-utils.js`: shared color, sizing, and formatting helpers for the new companion pages
- `js/shared/link-types.js`: link-type helpers and force grouping
- `js/shared/tours.js`: generated walkthrough steps and JSON step loading
- `css/components/*`: visual styling

- `index.html`: HTML shell and optional host script wiring

## PWA / Offline Caching

Files:

- `manifest.json`
- `sw.js`

If you change core graph runtime assets, bump `CACHE_NAME` in `sw.js` so the service worker refreshes cached files.

## Troubleshooting

- If the graph is embedded in another app, confirm the host serves `/graph-display/index.html` or `/public/graph-display/index.html` consistently.
- If optional features are missing, verify the related host global described in `GRAPH_HOST_FEATURES` is present.
- If colors or sizing do not apply as expected, validate the payload with `validateGraphUiConfig()` or inspect `window.GraphDisplayContract` in DevTools.
