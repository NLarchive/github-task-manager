
## Launch Agentic IDE with local models

### 1) Start the full stack
From the repo root:

```powershell
pwsh -ExecutionPolicy Bypass -File tools/scripts/start-agentic-ide-stack.ps1 -LlamaServerBinary "D:\AI\runtime\llama-b8920-win-cuda12.4\llama-server.exe"
```

This starts:
- server.js on `http://localhost:3000`
- Agentic IDE bridge on `http://localhost:3131`
- local `llama-server` on port `8080`

### 2) Open the UI
- IDE: `http://localhost:3000/agentic-ide/index.html`
- Chat lab: `http://localhost:3000/agentic-ide/chat/index.html`

### 3) Which models are available
This repo currently contains:
- gemma4-26b-a4b-q4kxl
- qwen3.6-35b-a3b-q4kxl

The default stack script uses the Gemma model schema path.

### 4) Launch Qwen instead of Gemma
If you want to run Qwen, pass `-ModelPath`:

```powershell
pwsh -ExecutionPolicy Bypass -File tools/scripts/start-agentic-ide-stack.ps1 `
  -LlamaServerBinary "D:\AI\runtime\llama-b8920-win-cuda12.4\llama-server.exe" `
  -ModelPath "D:\AI\storage\live-models\qwen3.6-35b-a3b-q4kxl\Qwen3.6-35B-A3B-UD-Q4_K_XL.gguf"
```

### 5) Use both models
The workspace has both Gemma and Qwen model configs, but the bridge normally points at one active local LLM endpoint.

To run both simultaneously:
- start Gemma on port `8080`
- start Qwen on another port, e.g. `8081`
- start a second bridge instance with `BRIDGE_PORT=3132 LLM_PORT=8081`

Example manual startup for a second bridge:

```powershell
$env:BRIDGE_PORT=3132
$env:LLM_PORT=8081
node public/agentic-ide/server/main.js
```

Then open a second browser session to:
- `http://localhost:3000/agentic-ide/chat/index.html` for the first bridge
- `http://localhost:3000/agentic-ide/chat/index.html` via the second bridge if you use a second app server / proxy

### 6) Test the chat/system flow
Once the IDE is running:
- select the model from the model dropdown in the top toolbar
- open `chat/index.html`
- send a message to chat with the selected model
- run workflow/tests from the bottom panel or use the dedicated inference test scripts

### 7) Quick fallback manual commands
If you prefer manual startup:

```powershell
node server.js
node public/agentic-ide/server/main.js
./llama-server -m "D:\AI\storage\live-models\gemma4-26b-a4b-q4kxl\gemma-4-26B-A4B-it-UD-Q4_K_XL.gguf" --port 8080 --ctx-size 4096
```

Then browse:
```text
http://localhost:3000/agentic-ide/chat/index.html
```



# Agentic IDE

Agentic IDE is a browser-based local development environment for agentic components and workflows. It is designed to feel closer to VS Code plus Copilot, but for client-side JavaScript composition of local-model tools, agents, subgraphs, workflows, tests, and benchmarks.

The IDE is not a demo-only canvas anymore. It now supports:

- real workspace discovery from `public/agentic-ide`
- editable file views backed by the local bridge server
- syntax-colored browser editing
- a library tree that reflects the real folder and file hierarchy
- a graph tree that reflects runtime and workflow containment
- pane resizing for library, inspector, and bottom panels
- mobile library and inspector drawers
- standalone chat lab surface under `chat/index.html`
- runtime tests and issue surfacing in the bottom panel
- live benchmark runs that persist output records for later review

## Start

Preferred: start all required runtimes in one command from repository root:

```powershell
pwsh -ExecutionPolicy Bypass -File tools/scripts/start-agentic-ide-stack.ps1 -LlamaServerBinary
"D:\AI\runtime\llama-b8920-win-cuda12.4\llama-server.exe"
```

If `llama-server` is already in your PATH, you can omit `-LlamaServerBinary`.

The script validates:

- app server (`server.js`) on port 3000
- Agentic IDE bridge server (`server/main.js`) on port 3131
- LLM completion via bridge (`/api/llm/complete`)

Manual startup (advanced):

Run the main app server from the repository root:

```powershell
node D:\web\web-github-task-manager\server.js
```

Run the Agentic IDE bridge from the repository root:

```powershell
node D:\web\web-github-task-manager\public\agentic-ide\server\main.js
```

Start the local llama.cpp server with the Gemma model path declared in `components/models/gemma/gemma4-26b-a4b-q4kxl/schema.json`:

```powershell
./llama-server -m "D:\AI\storage\live-models\gemma4-26b-a4b-q4kxl\gemma-4-26B-A4B-it-UD-Q4_K_XL.gguf" --port 8080 --ctx-size 4096
```

Open the IDE in the browser:

```text
http://localhost:3000/agentic-ide/index.html
```

## Runtime Requirements

There are three runtime layers:

1. `server.js` serves the browser UI.
2. `server/main.js` is the root launch surface for the Agentic IDE bridge and wraps the implementation in `js/bridge-server.js`.
3. `llama-server` on `http://localhost:8080` enables non-mocked local inference.

Status badge behavior:

- `Bridge offline`: the browser cannot reach `server/main.js`
- `LLM offline`: the bridge is reachable but the local model endpoint is not
- `Bridge + LLM online`: live inference is available

## Server Surface

The Agentic IDE now exposes a root server folder so the launch entry follows the same explicit folder-contract direction as the rest of the project:

- `server/main.js` is the preferred launch command entrypoint
- `server/schema.json` documents the server input and output surface
- `server/manifest.json` documents the entry, contract, tests, and workspace relations
- `server/tests/health.json` describes the health-check expectations
- `server/README.md` explains how this root server surface maps to `js/bridge-server.js`

The runtime implementation still lives in `js/bridge-server.js`; the new `server/` folder is the stable root launch and documentation surface.

## Cell Contract System

Each component can now be treated as a reusable unit cell with an explicit IPO contract:

- `input` contract via `inputs[]` or `schema.json`
- `process` implementation via `main.js` / `prompt.md` / `state.js`
- `output` contract via `outputs[]` or `schema.json`
- test contract via `tests/*.json`

Shared schemas:

- `schema/component.schema.json`
- `schema/unit-case.schema.json`
- `schema/manifest.schema.json`

Optional per-unit manifest:

- `manifest.json` summarizes the unit entry file, contract file, tests, and explicit workspace relations
- the current pilot rollout covers `folder_graph_scanner`, `html_parser`, `ui_renderer`, and `research_workflow`
- `npm run validate:agentic-cells` now writes that manifest coverage into `registry.json` alongside the existing component and edge index

Validate and rebuild registry:

```powershell
npm run validate:agentic-cells
```

This command validates component/workflow contracts and writes `registry.json` as the composable organism index for cross-cell wiring.

## Page Layout

The page is split into three working areas:

- left library and graph tree
- center graph canvas plus bottom runtime/editor panel
- right inspector

The vertical borders between the left panel, center canvas, and right inspector are draggable. The horizontal border above the bottom panel is also draggable.

Pane size persistence:

- library width persists across reloads
- inspector width persists across reloads
- bottom panel height persists across reloads

## Trees

There are two tree modes in the left panel.

### Library

The `Library` tab shows the real project hierarchy, not a flat type bucket list.

Structure rules:

- folders are shown as folders in path order
- component and workflow folders contain their discovered node entry
- node entries contain nested files and test files
- file entries can expose discovered symbols such as functions, classes, variables, JSON keys, and markdown headings

Examples:

- `components -> agents -> search_agent_v1 -> search_agent -> prompt.md`
- `components -> tools -> web_search_v1 -> web_search_tool -> main.js -> run (function)`
- `workflows -> benchmarks -> research_benchmark_v1 -> research_benchmark -> tests -> live.json`

### Graph

The `Graph` tab shows the runtime containment hierarchy.

Important distinction:

- `root` is a workspace container node, not a data-flow node
- `root` does not need graph edges
- workflows and subgraphs contain runtime child nodes
- file nodes exist under their component nodes for navigation and inspection, but they are not execution roots

Interaction:

- single click selects the node or file
- double click navigates the canvas to the clicked node
- double clicking a composite node drills into it
- double clicking a file entry focuses the owning scope and opens the file editor

## Mobile Behavior

On smaller screens the side panels switch from fixed columns to drawer-style dropdown panels.

Header buttons:

- `Library` opens the tree drawer
- `Inspector` opens the inspector drawer
- tapping outside the panel closes it

This keeps the graph canvas usable on phones while still exposing the full hierarchy.

## Header Controls

### Model selector

The center toolbar contains the active model selector. Discovered models are loaded from the workspace registry exposed by the bridge.

### Chat

Chat has been migrated to a dedicated page:

- `http://localhost:3000/agentic-ide/chat/index.html`

Chat Lab behavior:

- starts from a clean inference baseline by default (no forced history prompt)
- allows selecting prompt, agent, tool, test, and parameter profiles from the chat catalog database
- supports editable output messages and copyable input or output content
- records structured logs and structured test results for dashboard parsing

If the badge says `LLM offline`, the page remains usable, but live model completion will fail until the local model server is started.

## Bottom Panel Tabs

### JSON

Shows the selected node definition.

### Code

Shows the selected file in a syntax-colored editor.

The editor supports:

- local file loading through the bridge
- save back to disk through the bridge
- download to file
- syntax coloring for JSON, Markdown, Python, YAML, and JavaScript-like files

### Edge

Shows the selected edge definition.

### Meta

Shows the selected node metadata and thresholds.

### Tasks

Loads `tasksDB` projects and lets you insert task nodes into the graph.

### Tests

Shows runtime history and lets you:

- run the selected node
- run the selected node tests
- inspect stored runtime results

### Issues

Shows aggregated problems detected from:

- bridge connectivity
- LLM availability
- registry warnings
- failed runtime reports

## Inspector

The inspector supports:

- editing labels, descriptions, paths, inputs, outputs, width, and height
- browsing component files
- opening contained subgraphs and workflows
- inspecting file symbols when available

## How To Work With Components

Recommended folder conventions:

- agents use `tests/behavior.json`
- tools use `tests/unit.json`
- workflows use `tests/e2e.json` or `tests/live.json`
- models use `tests/health.json`
- benchmarks use `tests/live.json`

Current local component families:

- `components/agents`
- `components/tools`
- `components/models`
- `components/subgraphs`
- `workflows`

The IDE discovers each `component.json`, `graph.json`, and `workflow.json` file and turns it into a runtime node.

## Benchmark Workflow

Live benchmark support is now organized around a benchmark workflow instead of only mock or smoke checks.

Benchmark assets:

- `components/tools/research_benchmark_runner_v1`
- `components/tools/benchmark_result_writer_v1`
- `workflows/benchmarks/research_benchmark_v1`
- `workflows/benchmarks/research_benchmark.json`
- `workflows/benchmarks/outputs`

What the benchmark does:

1. runs `research_workflow` through the live bridge runtime
2. measures real wall-clock execution time
3. captures report output, per-step execution traces, executed component signatures, logs, warnings, and model metadata
4. computes benchmark scorecards for quality, efficiency, and reliability
5. compares the current run against the previous benchmark baseline and flags component regressions or improvements
6. writes a JSON record into `workflows/benchmarks/outputs`

Example output fields:

- `benchmark_name`
- `run_label`
- `topic`
- `metrics.duration_ms`
- `metrics.bottleneck_node_id`
- `metrics.bottleneck_share`
- `scorecard.overall_score`
- `scorecard.quality_score`
- `scorecard.efficiency_score`
- `scorecard.reliability_score`
- `component_summary[*].component_signature`
- `component_summary[*].runtime_signature`
- `component_summary[*].score`
- `comparison.changed_components`
- `comparison.score_delta`
- `improvement_candidates`
- `report`

## Running The Benchmark

Prerequisite:

- `server.js` running
- `server/main.js` running
- `llama-server` running

Then in the IDE:

1. select `research_benchmark` in the library or graph tree
2. open the `Tests` tab
3. click `Run node`
4. inspect the returned `output_path`
5. review the generated JSON file in `workflows/benchmarks/outputs`

If you want the benchmark to validate through its declared live test file, select `research_benchmark` and click `Run tests`.

## Project Structure Semantics

The workspace under `public/agentic-ide` is interpreted with two distinct meanings:

- filesystem structure for authoring and browsing
- execution structure for runtime composition

That is why the IDE exposes both `Library` and `Graph` views.

The root container:

- represents the discovered workspace
- owns top-level hierarchy for navigation
- does not represent a runnable computational node
- therefore does not need direct edges

## Validation Strategy

Use both local and live validation.

Local validation:

- `npm test`
- component `unit`, `behavior`, and `health` tests

Live validation:

- `research_workflow` through the runtime panel
- `research_benchmark` through the runtime panel
- persisted benchmark outputs in `workflows/benchmarks/outputs`

The benchmark path is the place to collect real inference data for latency, output quality, and prompt/tool iteration feedback.

## Notes

- The bridge caches registry and model discovery responses with ETags to avoid unnecessary refresh traffic.
- The library tree uses the real folder hierarchy instead of flattening folders and files into separate buckets.
- File nodes expose lightweight symbol discovery for browsing JavaScript functions, variables, JSON keys, and markdown headings.
