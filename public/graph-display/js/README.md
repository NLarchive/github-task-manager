# Graph Display Engine — JS Module Reference

This folder contains the JavaScript engine for the interactive D3 graph visualizer.
It renders project task graphs, enables navigation between modules, and drives the popup system.

---

## Module Files

| File | Role |
|---|---|
| `main-graph.js` | Main entry point: loads template data, instantiates `CurriculumGraph`, wires sidebar + walkthrough |
| `graph-data.js` | Data layer: builds `nodes[]`, `links[]`, `details{}` from a `tasks.json` template |
| `utils.js` | Shared helpers: color contrast, priority normalization, `escapeHtml` |
| `walkthrough.js` | Guided tour overlay (step definitions, arrow animations) |
| `cv-generator.js` | CV popup builder from graph node data |
| `template-loader.js` | Fetches and normalizes template JSON files via `registry.json` |
| `shared/link-types.js` | Canonical link-type constants and display labels |
| `shared/tours.js` | Tour step definitions keyed by template ID |

---

## Core Class: `CurriculumGraph`

Defined in `main-graph.js`.

### Construction

```js
const graph = new CurriculumGraph({
    container,     // DOM element (the #graph-container div)
    data,          // { nodes: Node[], links: Link[] }
    details,       // { [nodeId]: { title, items[] } }
    nodeMap,       // Map<nodeId, Node>
    config,        // Config object (forces, animation, sizes…)
    template,      // Full template object from graph-data.js
    legendMode,    // 'task-management' | 'career'
    isMobile       // boolean
});
```

### Key Methods

| Method | Description |
|---|---|
| `init()` | Run the full initialization pipeline |
| `openNodeModal(nodeId)` | Pan & zoom to node, open its detail popup, keep it permanently selected (blinking) |
| `focusOnNode(nodeId)` | Pan & zoom to node with a temporary attention blink (no modal) |
| `_openNodeDetails(d)` | Apply persistent selected state + show popup for node datum `d` (internal) |
| `hideNodeDetails()` | Close popup; only clear selection when called with `clearSelection: true` |
| `showNodeDetails(d)` | Build and inject popup HTML for node `d` |
| `resetViewAndSearch()` | Reset zoom, clear search, deselect all nodes |
| `onStable(cb)` | Queue a callback to run when the D3 simulation has settled |
| `setupNodeInteractions()` | Wire all click/hover/touch/keyboard handlers |
| `setupZoom()` | Configure D3 zoom + SVG background click-to-deselect |

### Node Selection States (CSS Classes)

| Class | When Applied | Visual Effect |
|---|---|---|
| `.is-interacted` | Mouse hover (temporary) | Amber stroke, no animation |
| `.details-shown-for` | Node selected (persists after popup close until explicit deselect) | Orange-red stroke, infinite blinking pulse |
| `.is-neighbor` | Connected to selected node | Full opacity (non-faded) |
| `.faded` | Not connected to selected node | 20% opacity |
| `.focus-highlight` | After `focusOnNode()` — temporary attention indicator | 7px stroke, 4×blink then removed |
| `.search-match` | Matches current search query | Infinite pulse |
| `.node-status-done` / `.node-status-completed` | Task status = Done (or legacy Completed) | Greyscale + opacity reduction |
| `.node-status-in-progress` | Task status = In Progress | Glowing pulse animation |

### Deselecting a Node

A node is deselected (`.details-shown-for` removed) when:
- The user clicks the graph SVG background (not on a node or link)
- `hideNodeDetails({ clearSelection: true })` is called programmatically
- `resetViewAndSearch()` is called

Closing the popup with the `×` button or overlay click hides the popup only; the node remains selected until one of the explicit deselect paths above runs.

### Sidebar

The **Modules sidebar** (`#modules-sidebar`) appears when `template.meta.modules` contains entries.
It has two tabs:

- **📦 Modules**: Tree of sub-project paths — clicking navigates to a sub-graph via `_subtaskNavigate()`
- **🌳 Tree**: Flat hierarchy of the current graph's task nodes grouped by layer. Clicking a task calls `openNodeModal(nodeId)`.

On desktop (≥ 768 px) the sidebar does **not** auto-close after selecting a module or task.
On mobile it closes after navigation.

---

## Data Flow

```
registry.json
    └─ template-loader.js → fetches tasks.json or template JSON
            └─ graph-data.js
                    ├─ buildTaskManagementTemplate()   (tasks.json with numeric IDs)
                    ├─ buildProjectTaskTemplate()       (tasks.json with string names)
                    └─ buildEmbeddedTaskDbTemplate()    (nested module data)
                    ↓
              { nodes[], links[], details{}, meta{} }
                    ↓
            main-graph.js → CurriculumGraph.init()
                    ├─ preprocessData()         (color, size, text-color assignment)
                    ├─ createSVG()
                    ├─ initializeForces()       (D3 force simulation)
                    ├─ createVisualElements()   (node circles, links, text)
                    ├─ setupNodeInteractions()  (click / hover / touch handlers)
                    ├─ setupZoom()              (pan/zoom + background deselect)
                    └─ initModulesSidebar()     (modules tree + task tree tabs)
```

---

## Dependency Links (Clickable "Depends on:")

Task nodes with `dependencies` list show a **"Depends on:"** section in the popup.
Each dependency renders as a `<button class="dep-link" data-dep-node-id="task-N">` element.

Clicking a dep-link:
1. Closes the current popup (`hideNodeDetails()`)
2. Calls `openNodeModal(targetNodeId)` — pans the graph, opens the target's modal, keeps it permanently selected with blinking

---

## Sub-graph Navigation

Projects can define a `navigation.modules[]` array in their `tasks.json` to enable the sidebar.
Each module entry has a `path` (relative to the project root) pointing to a sub-project's `tasks.json`.

When a module is selected:
- `window._subtaskNavigate(path, projectId, label)` loads the sub-project graph
- `window._navigateToDepth(-1)` returns to the parent
- `window.__activeModulePath` tracks the current path
- `window.__markActiveModuleInSidebar()` updates the active highlight

When the sub-graph re-initializes with a new template, `window.__refreshSidebarTaskTree()` can be called to refresh the Tree tab.

---

## Link Types

Defined in `shared/link-types.js` and used by `graph-data.js`:

| Type | Meaning |
|---|---|
| `DEPENDS_FS` | Finish-to-Start dependency |
| `DEPENDS_SS` | Start-to-Start |
| `DEPENDS_FF` | Finish-to-Finish |
| `DEPENDS_SF` | Start-to-Finish |
| `DEPENDS_ON` | Generic (plain number dependency) |
| `HAS_TASK` | Project Start → Task node |
| `HAS_FOUNDATION` | Foundation link (career template) |
| `HAS_SUBCATEGORY` | Category link |
| `DEVELOPS` | Skill development link |
| `CREATES` | Impact link |
| `LEADS_TO` | Outcome link |
