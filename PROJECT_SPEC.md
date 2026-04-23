# Project Specification: web-github-task-manager
Generated: 2026-04-23 16:36
<!-- To update this file, run: python D:\tool\extract_project_spec\app.py --root D:\web\web-github-task-manager -->

## Folder structure

.github
.github\workflows
public
public\api
public\calendar
public\calendar\js
public\calendar\snippets
public\config
public\graph-display
public\graph-display\css
public\graph-display\css\components
public\graph-display\images
public\graph-display\images\team
public\graph-display\js
public\graph-display\js\shared
public\health
public\health\css
public\health\js
public\list-display
public\list-display\css
public\list-display\js
public\local-folder
public\local-folder\js
public\task-engine
public\task-engine\js
public\tasksDB
public\tasksDB\_examples
public\tasksDB\_examples\career
public\tasksDB\_examples\task-management
public\tasksDB\_schema
public\tasksDB\_templates
public\tasksDB\external
public\tasksDB\external\ai-career-roadmap
public\tasksDB\external\ai-career-roadmap\tour
public\tasksDB\external\first-graph
public\tasksDB\external\first-graph\tour
public\tasksDB\external\github-task-manager
public\tasksDB\external\github-task-manager\tour
tests
tests\e2e
tests\graph-display
tests\unit
tools
tools\calendar
tools\cloudflare-worker
tools\docs
tools\scripts
.github\workflows\deploy.yml
.github\workflows\validate-taskdb.yml
.gitignore
AGENTS.md
CONTRIBUTING.md
exposure-bridge.json
LICENSE
package.json
public\api\README.md
public\calendar\js\task-ics-export.js
public\calendar\README.md
public\calendar\snippets\calendar-dropdown-snippets.html
public\config\projects-config.js
public\config\tasks-template-config.js
public\config\worker-url.js
public\graph-display\.gitignore
public\graph-display\css\components\_accessibility.css
public\graph-display\css\components\_base.css
public\graph-display\css\components\_buttons.css
public\graph-display\css\components\_colors.css
public\graph-display\css\components\_graph.css
public\graph-display\css\components\_header.css
public\graph-display\css\components\_menu.css
public\graph-display\css\components\_modules-sidebar.css
public\graph-display\css\components\_popups.css
public\graph-display\css\components\_responsive.css
public\graph-display\css\components\_tooltip.css
public\graph-display\css\components\_variables.css
public\graph-display\css\components\_walkthrough.css
public\graph-display\css\README.md
public\graph-display\css\styles-mobile-optimized.css
public\graph-display\css\styles-new.css
public\graph-display\css\styles.css
public\graph-display\images\favicon.png
public\graph-display\images\favicon.svg
public\graph-display\images\team\profile-placeholder.svg
public\graph-display\index.html
public\graph-display\js\cv-generator.js
public\graph-display\js\d3.v7.min.js
public\graph-display\js\graph-data.js
public\graph-display\js\main-graph.js
public\graph-display\js\README.md
public\graph-display\js\shared\link-types.js
public\graph-display\js\shared\tours.js
public\graph-display\js\template-loader.js
public\graph-display\js\utils.js
public\graph-display\js\walkthrough.js
public\graph-display\manifest.json
public\graph-display\README.md
public\graph-display\sw.js
public\health\css\health.css
public\health\index.html
public\health\js\runtime-health-checker.js
public\health\README.md
public\index.html
public\list-display\css\README.md
public\list-display\css\task-manager.css
public\list-display\index.html
public\list-display\js\list-display-controller.js
public\list-display\js\README.md
public\list-display\README.md
public\local-folder\js\folder-picker-trigger.js
public\local-folder\js\local-folder-scanner.js
public\local-folder\README.md
public\README.md
public\styles.css
public\task-engine\js\task-field-automation.js
public\task-engine\js\task-schema-validator.js
public\task-engine\js\task-storage-sync.js
public\tasksDB\_examples\career\data.json
public\tasksDB\_examples\career\tour.json
public\tasksDB\_examples\task-management\data.json
public\tasksDB\_examples\task-management\tour.json
public\tasksDB\_schema\graph-template.schema.json
public\tasksDB\_templates\starter_project_template.csv
public\tasksDB\_templates\starter_project_template.json
public\tasksDB\_templates\starter_project_template_v2.json
public\tasksDB\external\ai-career-roadmap\node.tasks.json
public\tasksDB\external\ai-career-roadmap\README.md
public\tasksDB\external\ai-career-roadmap\tour\graph-tour.json
public\tasksDB\external\first-graph\node.tasks.json
public\tasksDB\external\first-graph\tour\graph-tour.json
public\tasksDB\external\github-task-manager\node.tasks.json
public\tasksDB\external\github-task-manager\README.md
public\tasksDB\external\github-task-manager\tour\graph-tour.json
public\tasksDB\README.md
public\tasksDB\registry.json
README.md
server.js
tests\e2e\crud-operations.spec.js
tests\e2e\graph-fullscreen.spec.js
tests\e2e\live-multi-project-saves.spec.js
tests\e2e\module-navigation.spec.js
tests\e2e\password-timeline-issues.spec.js
tests\e2e\smoke.spec.js
tests\e2e\update-task-via-ui.spec.js
tests\e2e\verify-commit-structure.spec.js
tests\e2e\visual-states.spec.js
tests\graph-display\graph-display.spec.js
tests\graph-display\inline-subtask-navigation.spec.js
tests\graph-display\playwright.config.js
tests\graph-display\server.js
tests\graph-display\web-e2e-bussines-navigation.spec.js
tests\playwright.config.js
tests\run-tests.js
tests\unit\generate-project-calendars.test.js
tests\unit\graph-data.test.js
tests\unit\local-folder-scanner.test.js
tests\unit\projects-config.test.js
tests\unit\server-api.test.js
tests\unit\task-field-automation.test.js
tests\unit\task-schema-validator.test.js
tests\unit\task-storage-sync.test.js
tests\unit\tasks-json-format.test.js
tests\unit\template-config.test.js
tests\unit\validate-schema.js
tools\calendar\calendar-appointment-schema.js
tools\calendar\calendar-constants.js
tools\calendar\generate-project-calendars.js
tools\calendar\README.md
tools\cloudflare-worker\deploy.ps1
tools\cloudflare-worker\deploy.sh
tools\cloudflare-worker\package.json
tools\cloudflare-worker\README.md
tools\cloudflare-worker\validate-secrets.js
tools\cloudflare-worker\worker.js
tools\cloudflare-worker\wrangler.toml
tools\docs\COMMIT_MESSAGE_FORMAT.md
tools\docs\DEPLOYMENT_SUMMARY.md
tools\docs\GITHUB_PAGES_SETUP.md
tools\docs\PLAYWRIGHT_TEST_REPORT.md
tools\docs\QUICKSTART.md
tools\docs\TEMPLATE_VALIDATION_GUIDE.md
tools\docs\TESTING.md
tools\scripts\archive-root-tasks.js
tools\scripts\enrich-tasks-workers.js
tools\scripts\generate-state-files.js
tools\scripts\prepare-public-graph.js
tools\scripts\regenerate-tasks-csv.js
tools\scripts\setup.bat
tools\scripts\setup.js
tools\scripts\validate-commit-format.js
tools\scripts\validate-tasks-schema.js
tools\scripts\validate-tasks-workers.js

---

## Project focus

focus from repo structure:
    [core-root] public/ — primary shipped web application
    [core-runtime-bridge] server.js — local dev server and API bridge for the public application
    [supporting-root] tests/ — validation and regression coverage
    [supporting-root] tools/ — deployment, worker, and maintenance support
    [supporting-root] .github/ — CI/CD automation
    [ignored-scope] .gitignore influences which generated, local, or secret files are intentionally excluded
    [suggested-core-file] public/index.html — GitHub Task Manager
    [suggested-core-file] public/graph-display/index.html — Template: interactive graph-based CV/portfolio. Replace the sample graph data with your own career, skills, and outcomes.
    [suggested-core-file] public/graph-display/js/main-graph.js — Main script for initializing and managing the Curriculum Graph. Imports data, CV generator, walkthrough, utilities. Uses CSS classes for color and manages accessibility. UPDATED: Touch interaction mir
    [suggested-core-file] public/graph-display/js/graph-data.js — IMPORTANT: Graph definitions (nodes, relationships, details) must come from external JSON templates following the schemas in `tasksDB/_schema/`.
    [suggested-core-file] public/config/projects-config.js — Canonical runtime registry for TaskDB projects and their repository metadata.
    [suggested-core-file] public/tasksDB/registry.json — project registry and template discovery

---

## File Structures

structure from .gitignore:  (no extractable definitions)

structure from AGENTS.md:  (no extractable definitions)

structure from CONTRIBUTING.md:
    [file-summary] Contributing to GitHub Task Manager
    [heading-1] # Contributing to GitHub Task Manager
    [heading-2] ## Development Workflow
    [heading-3] ### 1. Before Starting Work
    [heading-3] ### 2. Making Changes
    [heading-4] #### Editing Task Data
    [heading-4] #### Recommended: Update Through the UI
    [heading-1] # Update a task using Playwright
    [heading-4] #### Manual JSON Edits (if needed)
    [heading-3] ### 3. Regenerating Derived Files
    [heading-1] # Regenerate both state and CSV in one command
    [heading-1] # Or individually:
    [heading-3] ### Writes, Tokens, and Security
    [heading-3] ### 4. Testing Locally
    [heading-4] #### View generated files (without committing them):
    [heading-1] # Now you can view/test with fresh state/csv
    [heading-4] #### Verify files are ignored:
    [heading-1] # Should show .gitignore rules matching these files
    [heading-3] ### 5. Committing Changes
    [heading-1] # Good: commit only the source JSON
    [heading-1] # Bad: do not commit these
    [heading-3] ### 6. Handling Merge Conflicts
    [heading-1] # Resolve conflict by accepting remote's version
    [heading-2] ## Tips for Friction-Free Collaboration
    [heading-2] ## Continuous Integration & Deployment
    [heading-2] ## Questions?

structure from LICENSE:  (no extractable definitions)

structure from README.md:
    [file-summary] GitHub Task Manager 📋
    [heading-1] # GitHub Task Manager 📋
    [heading-2] ## Features ✨
    [heading-3] ### Core Functionality
    [heading-3] ### Task Management Features
    [heading-3] ### Statistics Dashboard
    [heading-2] ## Getting Started 🚀
    [heading-3] ### Using the Live Website
    [heading-3] ### Local Development Setup
    [heading-4] #### Prerequisites
    [heading-4] #### Installation
    [heading-1] # Clone repository
    [heading-1] # Install dependencies (optional - only for testing)
    [heading-1] # (Optional) Setup a GitHub token for local development
    [heading-1] # IMPORTANT: Never ship a repo write token to GitHub Pages.
    [heading-1] # Create public/config/github-token.local.js (gitignored) if you want direct GitHub writes locally.
    [heading-1] # Run tests
    [heading-1] # No build step needed (vanilla JS)
    [heading-4] #### Running Locally
    [heading-1] # Option 1: Open directly in browser
    [heading-1] # Option 2: Serve with Python
    [heading-1] # Option 3: Serve with Node (if installed)
    [heading-2] ## How to Use 📖
    [heading-3] ### Creating a New Task
    [heading-3] ### Auto-Populated Fields
    [heading-3] ### Editing Tasks
    [heading-3] ### Deleting Tasks
    [heading-3] ### Filtering & Searching
    [heading-3] ### Exporting Tasks
    [heading-3] ### Data Persistence
    [heading-4] #### GitHub Pages (Deployed)
    [heading-4] #### Local Storage Mode (Local Development)
    [heading-4] #### How It Works
    [heading-4] #### Local Development Writes
    [heading-4] #### Data Sync Between Modes
    [heading-2] ## Task Properties Explained 📋
    [heading-3] ### Automatic Fields
    [heading-3] ### Required Fields
    [heading-3] ### Optional Fields
    [heading-3] ### Status Values
    [heading-3] ### Priority Levels
    [heading-3] ### Dependency Types
    [heading-2] ## Categories 🏷️
    [heading-2] ## GitHub Integration 🔗
    [heading-3] ### Architecture
    [heading-3] ### Data Sync Flow
    [heading-3] ### API Configuration
    [heading-2] ## Authoring Graph Templates ✏️
    [heading-3] ### Token Security
    [heading-2] ## Testing 🧪
    [heading-3] ### Automated Tests
    [heading-1] # Run all tests (Node.js unit tests)
    [heading-1] # Run specific test file
    [heading-1] # Run with coverage
    [heading-3] ### Manual Testing (Playwright)
    [heading-1] # Install Playwright
    [heading-1] # Run Playwright tests
    [heading-1] # Run with UI mode
    [heading-1] # Run specific test file
    [heading-3] ### Test Coverage
    [heading-3] ### Browser Compatibility
    [heading-2] ## Project Structure 📁
    [heading-2] ## Configuration 🔧
    [heading-3] ### Template Configuration
    [heading-3] ### Environment Variables
    [heading-1] # .github/workflows/deploy.yml
    [heading-2] ## Troubleshooting 🔧
    [heading-3] ### Tasks Not Loading
    [heading-3] ### Changes Not Saving
    [heading-3] ### Form Validation Errors
    [heading-3] ### GitHub API Errors
    [heading-2] ## Contributing 🤝
    [heading-3] ### Avoiding Conflicts on Generated Task Files
    [heading-2] ## Roadmap 🗺️
    [heading-3] ### Current Phase (Sprint 1) ✅ COMPLETE
    [heading-3] ### Next Phase (Sprint 2) ⏳ IN PLANNING
    [heading-3] ### Future Features
    [heading-2] ## Performance 📈
    [heading-2] ## Browser Support 🌐
    [heading-2] ## License 📄
    [heading-2] ## Security 🔒
    [heading-3] ### Best Practices Implemented
    [heading-3] ### Security Considerations
    [heading-2] ## Support & Contact 💬
    [heading-3] ### Getting Help
    [heading-3] ### Reporting Issues
    [heading-2] ## Acknowledgments
    [heading-2] ## Changelog 📝
    [heading-3] ### Version 1.0.0 (2025-12-10)

structure from exposure-bridge.json:
    [json-key] project: "web-github-task-manager"
    [json-key] root: "d:/web/web-github-task-manager"
    [json-key] formats: {produce, consume}
    [json-key] schemas: [5 items]
    [json-key] connectors: [1 items]
    [json-key] http_apis: [9 items]
    [json-key] bridge: {projects, shared_formats, bridge_ready, bridge_missing, existing_mappings, +1 more}

structure from package.json:
    [file-summary] github-task-manager — Collaborative task management system integrated with GitHub for public collaboration
    [json-key] name: "github-task-manager"
    [json-key] version: "1.0.0"
    [json-key] description: "Collaborative task management system integrated with GitHub ..."
    [json-key] main: "public/list-display/js/list-display-controller.js"
    [json-key] scripts: {start, start:static, test, test:validate, validate:tasks, +26 more}
    [json-key] repository: {type, url}
    [json-key] keywords: [4 items]
    [json-key] author: "nlarchive"
    [json-key] license: "MIT"
    [json-key] bugs: {url}
    [json-key] homepage: "https://nlarchive.github.io/github-task-manager"
    [json-key] devDependencies: {@playwright/test, cross-env, eslint, gh-pages, prettier, +1 more}
    [json-key] dependencies: {github-task-manager}

structure from server.js:
    [file-summary] Local development server and runtime API bridge for the public TaskDB apps.
    const TASK_FILE_CANDIDATES  «Preferred task filenames searched within a TaskDB project tree.»
    const DISCOVERY_IGNORED_DIRS  «Directories skipped while scanning project modules and derived artifacts.»
    function escapeCsvValue(value)  «Escape a scalar value for inclusion in the persisted CSV export.»
    function generatePersistedCSV(tasks = [])  «Build the repo-side flattened CSV companion for a TaskDB task list.»
    function getDuplicateTaskIds(tasks = [])  «Collect duplicate numeric task identifiers before persisting project data.»
    function safeJoin(root, requestPath)  «Resolve a request-relative path within a trusted root, rejecting traversal.»
    function contentTypeFor(filePath)  «Map a file path extension to the HTTP content type used by static serving.»
    function sendJson(res, status, payload)  «Send a JSON response with no-store caching for API endpoints.»
    function readBody(req)  «Read the full request body into memory with a conservative size guard.»
    function readJsonFile(filePath)  «Read and parse a JSON file, returning null when it does not exist or fails.»
    function normalizeRelativePath(value)  «Normalize a project-relative path to forward slashes without leading markers.»
    function inferModuleDepartment(relativePath)  «Infer the department/group label for a discovered module path.»
    function inferModuleType(relativePath, moduleData)  «Infer a coarse module type when the module file does not declare one.»
    function isTaskFileCandidate(fileName)  «Determine whether a filename is a supported TaskDB source file.»
    function readDirectoryEntries(dirPath)  «Read directory entries safely, returning an empty list on filesystem errors.»
    function pickPreferredTaskFileName(entries)  «Pick the preferred task source file from a directory listing.»
    function discoverProjectTaskFiles(projectDir)  «Recursively discover TaskDB task files under a project directory.»
    function getTaskKey(task)  «Resolve the canonical task key used for dependency and flow matching.»
    function getTaskCode(task)  «Extract the short task code prefix from a task key when present.»
    function getTaskPredecessorKeys(task)  «Collect predecessor identifiers from a task dependency list.»
    function computeTaskFlowSummary(tasks)  «Compute start/end tasks for a task list based on dependency relationships.»
    function scoreRootModuleCandidate(relativePath, rawData)  «Score a candidate tasks file when selecting the root module for a project.»
    function resolveRootModuleRelative(projectDir, tasksIndexData)  «Resolve the project root module path from navigation metadata or discovered files.»
    function collectProjectModules(projectDir, rootModuleRelative)  «Build module metadata entries for all non-root task files in a project.»
    function buildRootRelativeModules(modules, rootModuleRelative)  «Rebase module paths so the root module can reference them relative to itself.»
    function buildProjectPayload(projectDir)  «Build the synchronized project payload served to the browser and graph runtime.»
    function writeProjectPayload(projectDir, fullData)  «Persist the project index and root module payloads with regenerated navigation.»
    function ensureDir(dirPath)  «Ensure a directory exists before writing project artifacts.»
    function sanitizeProjectId(value)  «Sanitize a project identifier used to address project folders.»
    function maybeBootstrapTasksDb(tasksDbDir, fallbackDir)  «Seed the writable tasks directory from bundled public TaskDB data when needed.»
    function copyDirRecursive(sourceDir, targetDir)  «Recursively copy a directory tree into the writable tasks workspace.»
    function writeStateFiles(tasksDbDir, fullData)  «Regenerate the lightweight status-oriented state files for a project.»
    function createServer({ publicDir, tasksDbDir, graphDir })  «Create the local HTTP server used by development, tests, and file-backed saves.»

structure from .github/workflows/deploy.yml:
    [file-summary] Deploy GitHub Task Manager
    [yaml-key] name:
    [yaml-key] on:
    [yaml-key] permissions:
    [yaml-key] concurrency:
    [yaml-key] jobs:

structure from .github/workflows/validate-taskdb.yml:
    [file-summary] Validate TaskDB (Schema + Commit Format)
    [yaml-key] name:
    [yaml-key] on:
    [yaml-key] permissions:
    [yaml-key] jobs:

structure from public/README.md:
    [file-summary] Web GitHub Task Manager — Public Frontend
    [heading-1] # Web GitHub Task Manager — Public Frontend
    [heading-2] ## Top-level Files
    [heading-2] ## Core Runtime Files
    [heading-2] ## Sub-folders
    [heading-2] ## Application Modes
    [heading-3] ### 1. Task Manager List UI (`list-display/index.html`)
    [heading-3] ### 2. Graph Display (`graph-display/index.html`)
    [heading-2] ## Configuration Files (`config/`)
    [heading-2] ## Task Database (`tasksDB/`)
    [heading-2] ## API / Agent Integration (`api/`)
    [heading-2] ## Server API (provided by `server.js`)
    [heading-3] ### Projects
    [heading-3] ### Tasks
    [heading-3] ### Current API Gaps
    [heading-3] ### Static Files
    [heading-2] ## Deployment

structure from public/index.html:
    [file-summary] GitHub Task Manager
    [title] <title>GitHub Task Manager</title>
    [heading-1] <h1>📋 GitHub Task Manager</h1>
    [section] <nav id="nav-grid">

structure from public/styles.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/styles.css — web github task manager * ─────────────────────────────────────────────────────────────────────────
    [css-variable] --primary-color
    [css-variable] --primary-hover
    [css-variable] --secondary-color
    [css-variable] --danger-color
    [css-variable] --warning-color
    [css-variable] --info-color
    [css-variable] --background
    [css-variable] --surface
    [css-variable] --surface-hover
    [css-variable] --border
    [css-variable] --text-primary
    [css-variable] --text-secondary
    [css-variable] --shadow
    [selector] .container
    [selector] header
    [selector] header h1
    [selector] .auth-section
    [selector] .auth-form
    [selector] .auth-form input
    [selector] .auth-status
    [selector] .auth-status span
    [selector] .login-message
    [selector] .login-message p
    [selector] button
    [selector] .btn-primary
    [selector] .btn-primary:hover
    [selector] .btn-secondary
    [selector] .btn-secondary:hover
    [selector] .btn-danger
    [selector] .btn-danger:hover
    [selector] .controls
    [selector] .filter-section
    [selector] .filter-section select
    [selector] .stats
    [selector] .stat-card
    [selector] .stat-card h3
    [selector] .stat-card p
    [selector] .tasks-section
    [selector] .tasks-list
    [selector] .task-card
    [selector] .task-card:hover
    [selector] .task-header
    [selector] .task-title
    [selector] .task-meta
    [selector] .badge
    [selector] .badge-status-todo
    [selector] .badge-status-in-progress
    [selector] .badge-status-done
    [selector] .badge-priority-low
    [selector] .badge-priority-medium
    [selector] .badge-priority-high
    [selector] .task-description
    [selector] .task-footer
    [selector] .task-info
    [selector] .task-tags
    [selector] .tag
    [selector] .task-actions
    [selector] .task-actions button
    [selector] .empty-state
    [section] /* Modal */
    [selector] .modal
    [selector] .modal-content
    [selector] .close
    [selector] .close:hover
    [selector] .form-group
    [selector] .form-group label
    [selector] .form-group select
    [selector] .form-group textarea
    [selector] .form-row
    [selector] .form-actions
    [section] /* Loading Overlay */
    [selector] .loading-overlay
    [selector] .spinner
    [selector] .loading-overlay p
    [section] /* Toast */
    [selector] .toast
    [selector] .toast.success
    [selector] .toast.error
    [section] /* Animations */
    [section] /* Responsive */

structure from public/api/README.md:
    [file-summary] Task Graph API — Automation & Agent Contract
    [heading-1] # Task Graph API — Automation & Agent Contract
    [heading-2] ## Design Standards
    [heading-2] ## Surface Summary
    [heading-3] ### Local server (`server.js`)
    [heading-3] ### Cloudflare worker (`tools/cloudflare-worker/worker.js`)
    [heading-2] ## Local Server Endpoints
    [heading-3] ### `GET /api/health`
    [heading-3] ### `GET /api/projects`
    [heading-3] ### `GET /api/module?project=<projectId>&path=<relativeModulePath>`
    [heading-3] ### `GET /api/scan-path?path=<relativeOrAbsoluteFolder>`
    [heading-3] ### `GET /api/tasks?project=<projectId>`
    [heading-3] ### `PUT /api/tasks?project=<projectId>`
    [heading-2] ## Worker Endpoints
    [heading-3] ### `GET /health`
    [heading-3] ### `GET /api/task-history?project=<projectId>&taskId=<optional>&limit=<optional>`
    [heading-3] ### `PUT /api/tasks`
    [heading-2] ## Agent And MCP-Friendly Usage Patterns
    [heading-2] ## Current Gaps For Future Development
    [heading-2] ## Non-Goals And Clarifications

structure from public/calendar/README.md:
    [file-summary] Calendar Export Module
    [heading-1] # Calendar Export Module
    [heading-2] ## Files
    [heading-2] ## Architecture

structure from public/calendar/js/task-ics-export.js:
    [file-summary] task-ics-export.js Client-side ICS (iCalendar) generator for GitHub Task Manager. Works as a browser global (window.calendarExport) or CommonJS module.

structure from public/calendar/snippets/calendar-dropdown-snippets.html:  (no extractable definitions)

structure from public/config/projects-config.js:
    [file-summary] Canonical runtime registry for TaskDB projects and their repository metadata.
    const PROJECTS_CONFIG  «Canonical project descriptors exposed to the browser runtime and tests.»

structure from public/config/tasks-template-config.js:
    [file-summary] Shared TaskDB schema, defaults, enums, and runtime GitHub configuration.
    const TEMPLATE_CONFIG  «Shared TaskDB schema, defaults, enums, and runtime GitHub configuration.»

structure from public/config/worker-url.js:
    [file-summary] Runtime resolver for the Cloudflare worker URL used by secure write flows.
    function __resolveWorkerUrlRuntime()  «Runtime resolver for the Cloudflare worker URL used by secure write flows.»

structure from public/graph-display/.gitignore:  (no extractable definitions)

structure from public/graph-display/README.md:
    [file-summary] Graph Display (Interactive Career Graph Template)
    [heading-1] # Graph Display (Interactive Career Graph Template)
    [heading-2] ## Quick start
    [heading-3] ### Option A: run with a simple Node static server (recommended)
    [heading-3] ### Option B: run with PHP’s built-in server
    [heading-2] ## Customize your content
    [heading-3] ### 1) Choose a template (Career vs Task Management)
    [heading-3] ### 2) Edit the graph templates
    [heading-3] ### 3) Adjust Classic CV sections
    [heading-3] ### 4) Update the profile image
    [heading-2] ## PWA / Offline caching
    [heading-3] ### Troubleshooting
    [heading-2] ## Folder layout

structure from public/graph-display/index.html:
    [file-summary] Template: interactive graph-based CV/portfolio. Replace the sample graph data with your own career, skills, and outcomes.
    [title] <title>Interactive Career Graph – Template</title>
    [meta] meta[description]  «Template: interactive graph-based CV/portfolio. Replace the sample graph data with your own career, skills, and outcomes»
    [section] <main id="main-content">
    [section] <article id="graph-section">
    [heading-1] <h1>Interactive Career Graph (Template)</h1>
    [section] <aside id="menu-aside">
    [section] <nav id="menu-panel">
    [section] <section id="popup">
    [section] <section id="legend-popup">
    [heading-2] <h2>Graph Legend</h2>
    [heading-3] <h3>Nodes by Layer</h3>
    [heading-3] <h3>Connection Types</h3>
    [section] <section id="walkthrough-overlay">
    [section] <aside id="guide-panel">
    [heading-2] <h2>📚 Graph Types Guide</h2>
    [section] <aside id="modules-sidebar">
    [section] <footer id="seo-content">
    [heading-2] <h2>Interactive Career Graph Template</h2>
    [heading-2] <h2>What to customize</h2>

structure from public/graph-display/manifest.json:
    [file-summary] Interactive Career Graph (Template) — Template: interactive graph-based CV/portfolio. Replace the sample data with your own.
    [json-key] name: "Interactive Career Graph (Template)"
    [json-key] short_name: "CareerGraph"
    [json-key] description: "Template: interactive graph-based CV/portfolio. Replace the ..."
    [json-key] start_url: "./"
    [json-key] display: "standalone"
    [json-key] background_color: "#ffffff"
    [json-key] theme_color: "#4e79a7"
    [json-key] orientation: "portrait-primary"
    [json-key] scope: "./"
    [json-key] lang: "en"
    [json-key] icons: [2 items]
    [json-key] categories: [3 items]
    [json-key] screenshots: [0 items]

structure from public/graph-display/sw.js:
    [file-summary] Service worker for the graph-display app.
    const CACHE_NAME  «Service worker for the graph-display app.»
    const ASSET_PATHS  «Static graph assets that should be warmed into the service worker cache.»
    precacheAssets = (cache) =>  «Fetch and cache the graph shell assets during service-worker install.»

structure from public/graph-display/css/README.md:
    [file-summary] Interactive Career Graph - Modular CSS Architecture (Template)
    [heading-1] # Interactive Career Graph - Modular CSS Architecture (Template)
    [heading-2] ## 📁 File Structure
    [heading-2] ## 🚀 Usage
    [heading-3] ### In HTML
    [heading-3] ### Browser Compatibility
    [heading-2] ## 📱 iPhone Optimizations
    [heading-3] ### 1. Minimum Text Size (16px)
    [heading-3] ### 2. Touch Targets (44x44px minimum)
    [heading-3] ### 3. Modal/Popup Centering
    [heading-3] ### 4. Touch Feedback
    [heading-3] ### 5. Safe Area Support
    [heading-2] ## 🎨 Customization Guide
    [heading-3] ### Changing Colors
    [heading-3] ### Adjusting Spacing
    [heading-3] ### Modifying Touch Targets
    [heading-3] ### Changing Typography
    [heading-2] ## 📐 Responsive Breakpoints
    [heading-3] ### Mobile-First Approach
    [heading-2] ## 🔧 Component Editing Guide
    [heading-3] ### To Edit Buttons
    [heading-3] ### To Edit Popups
    [heading-3] ### To Edit Graph Nodes
    [heading-3] ### To Edit Menu
    [heading-3] ### To Add New Breakpoints
    [heading-2] ## 🐛 Troubleshooting
    [heading-3] ### CSS Not Loading
    [heading-3] ### Styles Not Applying
    [heading-3] ### Mobile Issues
    [heading-2] ## ✅ Testing Checklist
    [heading-3] ### iPhone Testing
    [heading-3] ### iPad Testing
    [heading-3] ### Desktop Testing
    [heading-2] ## 🔄 Migration from Old CSS
    [heading-3] ### Step 1: Backup
    [heading-3] ### Step 2: Update HTML
    [heading-3] ### Step 3: Test Thoroughly
    [heading-3] ### Step 4: Deploy
    [heading-2] ## 📊 Performance
    [heading-3] ### Benefits of Modular CSS
    [heading-3] ### Optimization Tips
    [heading-2] ## 🆘 Support
    [heading-3] ### Common Questions
    [heading-2] ## 📝 Version History
    [heading-3] ### Version 2.0 (Current)
    [heading-3] ### Version 1.0 (Legacy)

structure from public/graph-display/css/styles-mobile-optimized.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/styles mobile optimized.css — web github task manager * ──────────────────────────────────────
    [section] /* Base layer colors */
    [section] /* Profile Purple */
    [css-variable] --layer0-base
    [section] /* Foundations Blue */
    [css-variable] --layer1-base
    [section] /* Skills Orange */
    [css-variable] --layer2-base
    [section] /* Impact Green */
    [css-variable] --layer3-base
    [section] /* Outcome Purple */
    [css-variable] --layer4-base
    [section] /* Default fallback */
    [css-variable] --fallback-color
    [section] /* Color variants - Brighter tones for each layer */
    [section] /* Layer 0 Variants (Profile) */
    [css-variable] --layer0-variant-0
    [css-variable] --layer0-variant-1
    [css-variable] --layer0-variant-2
    [css-variable] --layer0-variant-3
    [css-variable] --layer0-variant-4
    [section] /* Layer 1 Variants (Foundations) */
    [css-variable] --layer1-variant-0
    [css-variable] --layer1-variant-1
    [css-variable] --layer1-variant-2
    [css-variable] --layer1-variant-3
    [css-variable] --layer1-variant-4
    [section] /* Layer 2 Variants (Skills) */
    [css-variable] --layer2-variant-0
    [css-variable] --layer2-variant-1
    [css-variable] --layer2-variant-2
    [css-variable] --layer2-variant-3
    [css-variable] --layer2-variant-4
    [section] /* Layer 3 Variants (Impact) */
    [css-variable] --layer3-variant-0
    [css-variable] --layer3-variant-1
    [css-variable] --layer3-variant-2
    [css-variable] --layer3-variant-3
    [css-variable] --layer3-variant-4
    [section] /* Layer 4 Variants (Outcome) */
    [css-variable] --layer4-variant-0
    [css-variable] --layer4-variant-1
    [css-variable] --layer4-variant-2
    [css-variable] --layer4-variant-3
    [css-variable] --layer4-variant-4
    [section] /* ===== UI Colors ===== */
    [css-variable] --color-primary
    [css-variable] --color-background
    [css-variable] --color-surface
    [css-variable] --color-text-light
    [css-variable] --color-text-dark
    [css-variable] --color-border
    [css-variable] --color-hover
    [css-variable] --color-active
    [section] /* ===== Spacing System ===== */
    [css-variable] --spacing-xs
    [css-variable] --spacing-sm
    [css-variable] --spacing-md
    [css-variable] --spacing-lg
    [css-variable] --spacing-xl
    [css-variable] --spacing-xxl
    [section] /* ===== Typography ===== */
    [css-variable] --font-family
    [css-variable] --font-size-base
    [css-variable] --font-size-sm
    [css-variable] --font-size-lg
    [css-variable] --font-size-xl
    [css-variable] --line-height-base
    [css-variable] --line-height-heading
    [section] /* ===== Touch Targets (WCAG AAA - 44x44px minimum) ===== */
    [css-variable] --touch-target-min
    [css-variable] --touch-target-comfortable
    [css-variable] --touch-target-large
    [section] /* ===== Transitions ===== */
    [css-variable] --transition-fast
    [css-variable] --transition-normal
    [css-variable] --transition-slow
    [section] /* ===== Z-Index Layers ===== */
    [css-variable] --z-base
    [css-variable] --z-graph
    [css-variable] --z-header
    [css-variable] --z-menu
    [css-variable] --z-popup
    [css-variable] --z-overlay
    [css-variable] --z-tooltip
    [css-variable] --z-skip-link
    [section] /* ===== Border Radius ===== */
    [css-variable] --radius-sm
    [css-variable] --radius-md
    [css-variable] --radius-lg
    [css-variable] --radius-full
    [section] /* ===== Shadows ===== */
    [css-variable] --shadow-sm
    [css-variable] --shadow-md
    [css-variable] --shadow-lg
    [css-variable] --shadow-xl
    [section] /* ===== Mobile-Specific Variables ===== */
    [css-variable] --mobile-padding
    [css-variable] --mobile-header-height
    [css-variable] --mobile-menu-width
    [section] /* iOS Safe Area Support */
    [css-variable] --safe-area-top
    [css-variable] --safe-area-right
    [css-variable] --safe-area-bottom
    [css-variable] --safe-area-left
    [section] /* Modern CSS Reset */
    [section] /* Prevent font size adjustments on orientation change (iOS) */
    [section] /* Smooth scrolling */
    [section] /* Base font size - 16px for accessibility */
    [section] /* Prevent horizontal scroll */
    [section] /* Better font rendering */
    [section] /* Mobile-friendly tap highlight */
    [section] /* Prevent text selection on interactive elements */
    [section] /* Allow text selection in content areas */
    [selector] p, article, .seo-content, #popup-content
    [selector] .skip-link
    [selector] .skip-link:focus
    [selector] header
    [selector] #profile-legend-button
    [section] /* Touch optimization */
    [section] /* Remove default button styles */
    [selector] #profile-legend-button:hover
    [selector] #profile-legend-button:active
    [selector] #profile-legend-button img
    [section] /* When menu is open */
    [selector] #profile-legend-button.menu-active
    [selector] #main-content
    [section] /* Dynamic viewport height for mobile */
    [selector] #graph-section
    [selector] #graph-container
    [section] /* Enable hardware acceleration */
    [selector] #graph-container svg
    [section] /* Smooth touch interactions */
    [section] /* Visually hidden but accessible (for screen readers & SEO) */
    [selector] .visually-hidden
    [section] /* SEO content - hidden visually, available to search engines */
    [selector] .seo-content
    [selector] .seo-content a
    [selector] #menu-aside
    [section] /* Allow clicks through when closed */
    [selector] #menu-panel
    [section] /* Animation */
    [section] /* Enable interaction when open */
    [section] /* Smooth scrolling for long menus */
    [section] /* Smooth iOS scrolling */
    [selector] #menu-panel.menu-open
    [section] /* Menu backdrop for mobile */
    [selector] .menu-backdrop
    [selector] .menu-backdrop.active
    [selector] #legend-popup
    [section] /* Smooth scrolling on iOS */
    [selector] #legend-popup.visible
    [selector] #legend-popup .content
    [section] /* Smooth momentum scrolling */
    [selector] #legend-popup.visible .content
    [section] /* Close button */
    [selector] .close-button
    [selector] .close-button:hover
    [selector] .close-button:active
    [selector] .walkthrough-overlay
    [selector] .walkthrough-overlay.active
    [selector] .walkthrough-tooltip
    [section] /* Ensure it stays within safe areas */
    [selector] .walkthrough-tooltip h3
    [selector] .walkthrough-tooltip p
    [selector] .walkthrough-tooltip .tooltip-buttons
    [selector] #tooltip
    [selector] #tooltip.visible
    [section] /* Tooltip color indicators */
    [selector] #tooltip.tooltip-layer-0
    [selector] #tooltip.tooltip-layer-1
    [selector] #tooltip.tooltip-layer-2
    [selector] #tooltip.tooltip-layer-3
    [selector] #tooltip.tooltip-layer-4
    [section] /* Base button styles */
    [selector] .walkthrough-tooltip button
    [section] /* Touch-friendly sizing */
    [section] /* Appearance */
    [section] /* Interaction */
    [section] /* Layout */
    [section] /* Prevent text selection */
    [selector] .control-button:hover
    [selector] .control-button:active
    [selector] .control-button:focus-visible
    [section] /* Disabled state */
    [selector] .control-button:disabled
    [section] /* Menu control buttons */
    [selector] .control-button
    [selector] .control-button:last-child
    [selector] .search-box
    [selector] .search-icon
    [selector] .search-box input
    [section] /* Prevents iOS zoom on focus */
    [selector] .search-box input:focus
    [selector] .search-box input::placeholder
    [selector] textarea
    [section] /* Prevent zoom on iOS */
    [section] /* Touch-friendly */
    [section] /* Remove default styles */
    [selector] textarea:focus
    [section] /* Links (connections between nodes) */
    [selector] .link
    [section] /* Link relationship types */
    [selector] .link.rel-has-foundation
    [selector] .link.rel-has-subcategory
    [selector] .link.rel-develops
    [selector] .link.rel-creates
    [selector] .link.rel-leads-to
    [section] /* Link states */
    [selector] .link.dimmed
    [selector] .link.highlighted
    [section] /* Base node styles */
    [selector] .node
    [selector] .node circle
    [section] /* Better rendering */
    [selector] .node text
    [section] /* Text outline for readability */
    [section] /* Better text rendering */
    [section] /* Node type variations */
    [selector] .node-type-parent circle
    [selector] .node-type-parent text
    [selector] .node-type-child circle
    [selector] .node-type-child text
    [section] /* Node color fills - dynamically applied by JS */
    [section] /* Layer 0 */
    [selector] .node.layer-0.color-variant-0 circle
    [selector] .node.layer-0.color-variant-1 circle
    [selector] .node.layer-0.color-variant-2 circle
    [selector] .node.layer-0.color-variant-3 circle
    [selector] .node.layer-0.color-variant-4 circle
    [section] /* Layer 1 */
    [selector] .node.layer-1.color-variant-0 circle
    [selector] .node.layer-1.color-variant-1 circle
    [selector] .node.layer-1.color-variant-2 circle
    [selector] .node.layer-1.color-variant-3 circle
    [selector] .node.layer-1.color-variant-4 circle
    [section] /* Layer 2 */
    [selector] .node.layer-2.color-variant-0 circle
    [selector] .node.layer-2.color-variant-1 circle
    [selector] .node.layer-2.color-variant-2 circle
    [selector] .node.layer-2.color-variant-3 circle
    [selector] .node.layer-2.color-variant-4 circle
    [section] /* Layer 3 */
    [selector] .node.layer-3.color-variant-0 circle
    [selector] .node.layer-3.color-variant-1 circle
    [selector] .node.layer-3.color-variant-2 circle
    [selector] .node.layer-3.color-variant-3 circle
    [selector] .node.layer-3.color-variant-4 circle
    [section] /* Layer 4 */
    [selector] .node.layer-4.color-variant-0 circle
    [selector] .node.layer-4.color-variant-1 circle
    [selector] .node.layer-4.color-variant-2 circle
    [selector] .node.layer-4.color-variant-3 circle
    [selector] .node.layer-4.color-variant-4 circle
    [section] /* Text color classes (contrast-based) */
    [selector] .text-light
    [selector] .text-dark
    [section] /* Text halos for better readability */
    [selector] .node text.text-light
    [selector] .node-type-child text.text-light
    [section] /* Show text on active/focused/hovered nodes */
    [selector] .node.walkthrough-target text
    [section] /* Show text for parent nodes by default */
    [section] /* Interaction states */
    [selector] .node.hovered text
    [selector] .node.persistent-clicked text
    [section] /* Connected nodes */
    [selector] .node.neighbor text
    [section] /* Dimmed state */
    [selector] .node.dimmed text
    [section] /* Hover state */
    [selector] .node:hover circle
    [section] /* Active/clicked state */
    [selector] .node.persistent-clicked circle
    [section] /* Focused state (keyboard navigation) */
    [selector] .node.focused circle
    [section] /* Search match */
    [selector] .node.search-match circle
    [selector] .node.dimmed
    [section] /* Neighbor highlighting */
    [selector] .node.neighbor circle
    [selector] .cv-profile-header
    [selector] .cv-profile-header h2
    [selector] .cv-profile-body
    [selector] .profile-photo
    [selector] .cv-profile-summary
    [section] /* CV sections */
    [selector] .cv-section
    [selector] .cv-section h3
    [selector] .cv-list
    [selector] .cv-list-no-bullets
    [selector] .cv-item
    [selector] .cv-item strong
    [section] /* Skills container */
    [selector] .skills-container
    [selector] .cv-skill-category h4
    [selector] .cv-skill-list
    [selector] .cv-skill-item
    [section] /* Legend styles */
    [selector] .legend-content
    [selector] .legend-content h3
    [selector] .legend-content h3:first-child
    [selector] .legend-item
    [selector] .legend-item:hover
    [selector] .legend-color
    [selector] .legend-color.line
    [css-variable] --font-size-base
    [css-variable] --font-size-sm
    [css-variable] --font-size-lg
    [css-variable] --font-size-xl
    [css-variable] --mobile-padding
    [section] /* Header adjustments */
    [section] /* Menu panel */
    [section] /* Buttons */
    [section] /* Search box */
    [section] /* Prevents iOS zoom */
    [section] /* Close buttons */
    [section] /* Graph nodes - slightly larger for easier tapping */
    [section] /* Popup content */
    [section] /* CV styles */
    [css-variable] --font-size-base
    [css-variable] --font-size-sm
    [css-variable] --font-size-lg
    [css-variable] --font-size-xl
    [css-variable] --mobile-padding
    [css-variable] --mobile-menu-width
    [section] /* Full-width menu on small screens */
    [section] /* Stack buttons vertically */
    [section] /* Larger touch targets */
    [section] /* Popups maximize screen space */
    [section] /* Larger text for readability */
    [section] /* Profile photo */
    [section] /* Walkthrough */
    [section] /* Graph text - hide more aggressively on mobile */
    [section] /* Show only active parent node text by default */
    [css-variable] --font-size-base
    [css-variable] --font-size-sm
    [css-variable] --font-size-lg
    [css-variable] --font-size-xl
    [section] /* Even more compact UI */
    [section] /* iOS-specific fixes */
    [section] /* Safe area support for notch/dynamic island */
    [section] /* Adjust fixed elements for safe areas */
    [section] /* Fix iOS 100vh issue (includes browser chrome) */
    [section] /* Dynamic viewport height */
    [section] /* Prevent bounce scroll */
    [section] /* Fix iOS input zoom */
    [section] /* Must be 16px to prevent zoom */
    [section] /* Fix iOS button appearance */
    [section] /* Disable iOS callout menu on long press */
    [section] /* Allow callout on links and text */
    [section] /* iPhone X and newer (notch support) */
    [section] /* Extra padding for home indicator area */
    [section] /* Android-specific fixes */
    [section] /* Fix Android viewport height with address bar */
    [section] /* Dynamic viewport */
    [section] /* Android Material Design ripple effect simulation */
    [section] /* Fix Android input focus */
    [section] /* Prevent page zoom on Android */
    [section] /* Android Chrome specific */
    [section] /* Fix for Android Chrome address bar */
    [section] /* Touch-only devices (no hover capability) */
    [section] /* Remove hover states, use active instead */
    [section] /* Reset hover styles */
    [section] /* Enhanced active/touch feedback */
    [section] /* Larger tap targets for touch */
    [section] /* Show node text on tap, not hover */
    [section] /* Remove tooltip on touch devices (use click instead) */
    [section] /* Devices with fine pointer (mouse/trackpad) */
    [section] /* Enable hover effects */
    [section] /* Smooth hover transitions */
    [section] /* Landscape orientation on small screens */
    [section] /* Compact popups in landscape */
    [section] /* Smaller profile button */
    [section] /* More compact menu */
    [section] /* Compact walkthrough */
    [section] /* Hide graph text in landscape to reduce clutter */
    [section] /* High DPI / Retina displays */
    [section] /* Crisper borders and text */
    [section] /* Higher quality shadows */
    [section] /* Reduced motion preference */
    [section] /* Disable animations */
    [section] /* High contrast mode */
    [css-variable] --color-border
    [css-variable] --color-text-light
    [section] /* Dark mode support (default is dark) */
    [section] /* Currently the design is dark-first */
    [section] /* Print styles */
    [section] /* Hide interactive elements */
    [section] /* Show all content */
    [section] /* Show graph in print */
    [section] /* Show all node labels in print */
    [section] /* END OF MOBILE-OPTIMIZED STYLESHEET */

structure from public/graph-display/css/styles-new.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/styles new.css — web github task manager * ───────────────────────────────────────────────────
    [section] /* END OF MAIN STYLESHEET */

structure from public/graph-display/css/styles.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/styles.css — web github task manager * ───────────────────────────────────────────────────────
    [section] /* Profile */
    [css-variable] --layer0-base
    [section] /* Foundations */
    [css-variable] --layer1-base
    [css-variable] --layer2-base
    [section] /* ================ Skip Link Accessibility =================== */
    [selector] .skip-link
    [selector] .skip-link:focus
    [section] /* ============== Touch Interface & Mobile UX ================= */
    [selector] .close-button
    [section] /* Disable double-tap zoom on buttons */
    [section] /* Increase padding on buttons for better mobile UX */
    [selector] .control-button
    [section] /* Add visual feedback for touch */
    [section] /* ================ Additional Responsive Improvements ======== */
    [section] /* Enhanced Tablet - 768px breakpoint improvements */
    [section] /* Typography adjustments */
    [section] /* Profile button - ensure touch target */
    [section] /* Menu panel improvements */
    [section] /* Ensure all buttons are touchable */
    [section] /* Search input touch-friendly */
    [section] /* Prevents iOS zoom */
    [section] /* Popup close buttons - larger touch target */
    [section] /* Graph nodes - larger touch targets */
    [section] /* More visible */
    [section] /* Enhanced Mobile - 480px breakpoint improvements */
    [section] /* Prevent zoom on inputs */
    [section] /* Full-width menu on mobile */
    [section] /* Stack buttons vertically */
    [section] /* Larger touch targets on mobile */
    [section] /* Popups - maximize screen space */
    [section] /* Larger text for readability */
    [section] /* Landscape orientation on mobile */
    [section] /* Compact popups in landscape */
    [section] /* Smaller profile button */
    [section] /* High DPI / Retina displays */
    [section] /* Ensure crisp text and borders */
    [section] /* ===================== FULL CSS END ========================= */
    [section] /* Skills */
    [section] /* Impact */
    [section] /* Outcome */
    [section] /* Fallback */
    [section] /* Layer 0 (Usually only 1 parent) */
    [section] /* Lighter */
    [section] /* Layer 1 */
    [section] /* Layer 2 */
    [section] /* Layer 3 */
    [section] /* Layer 4 */
    [section] /* Renamed for clarity */
    [section] /* Default text color */
    [section] /* Other UI Colors */
    [section] /* Orange for focus/search/walkthrough */
    [section] /* Purple for details-shown node */
    [section] /* Relationship colors */
    [section] /* Teal */
    [section] /* Grey */
    [section] /* Red */
    [section] /* Pink */
    [section] /* ==================== Base Styles =========================== */
    [section] /* Prevent body scroll */
    [selector] #graph-container
    [selector] #graph-container svg
    [section] /* Remove potential extra space below SVG */
    [section] /* Visually hidden elements (for accessibility and SEO) */
    [selector] .visually-hidden
    [selector] .seo-content
    [section] /* Prevents interaction with the hidden content */
    [selector] .seo-content a
    [section] /* Ensure no background color interferes */
    [section] /* ==================== Node Styles =========================== */
    [section] /* Base Node Circle Style */
    [selector] #graph-container .node circle
    [section] /* Fill color set by layer/variant classes below */
    [section] /* Slightly smoother scale */
    [section] /* Transition filter for brightness */
    [section] /* Remove default browser focus outline */
    [section] /* Base Node Text Style */
    [selector] #graph-container .node text
    [section] /* Prevent text selection */
    [section] /* Draw stroke behind fill for halo effect */
    [section] /* Default white halo */
    [section] /* Smooth show/hide if needed */
    [section] /* Parent Node Specific Styles */
    [selector] #graph-container .node-type-parent circle
    [selector] #graph-container .node-type-parent text
    [section] /* Child Node Specific Styles */
    [selector] #graph-container .node-type-child circle
    [selector] #graph-container .node-type-child text
    [section] /* Smaller halo for smaller text */
    [section] /* Node Fill Color Rules (Applied by JS based on preprocessData) */
    [section] /* Layer 0 */
    [selector] .node.layer-0.color-variant-0 circle
    [selector] .node.layer-0.color-variant-1 circle
    [selector] .node.layer-0.color-variant-2 circle
    [selector] .node.layer-0.color-variant-3 circle
    [selector] .node.layer-0.color-variant-4 circle
    [selector] .node.layer-1.color-variant-0 circle
    [selector] .node.layer-1.color-variant-1 circle
    [selector] .node.layer-1.color-variant-2 circle
    [selector] .node.layer-1.color-variant-3 circle
    [selector] .node.layer-1.color-variant-4 circle
    [selector] .node.layer-2.color-variant-0 circle
    [selector] .node.layer-2.color-variant-1 circle
    [selector] .node.layer-2.color-variant-2 circle
    [selector] .node.layer-2.color-variant-3 circle
    [selector] .node.layer-2.color-variant-4 circle
    [selector] .node.layer-3.color-variant-0 circle
    [selector] .node.layer-3.color-variant-1 circle
    [selector] .node.layer-3.color-variant-2 circle
    [selector] .node.layer-3.color-variant-3 circle
    [selector] .node.layer-3.color-variant-4 circle
    [selector] .node.layer-4.color-variant-0 circle
    [selector] .node.layer-4.color-variant-1 circle
    [selector] .node.layer-4.color-variant-2 circle
    [selector] .node.layer-4.color-variant-3 circle
    [selector] .node.layer-4.color-variant-4 circle
    [section] /* Text Color Classes (Applied by JS based on contrast check) */
    [section] /* Color for SVG text and HTML */
    [selector] .text-light
    [selector] .text-dark
    [section] /* Text Halo Adjustments for Readability */
    [section] /* Light text gets a dark halo */
    [selector] #graph-container .node text.text-light
    [selector] #graph-container .node-type-child text.text-light
    [section] /* Dark text gets a light halo (already default) */
    [section] /* ============ Node Text Visibility Rules ==================== */
    [section] /* Includes temporary hover/focus and persistent states */
    [section] /* Persistent while search active */
    [section] /* Persistent during walkthrough step */
    [section] /* Force visibility */
    [section] /* Text Halo Adjustments when Text is Explicitly Shown */
    [section] /* Ensure halos remain effective when text is forced visible */
    [selector] #graph-container .node.walkthrough-target text.text-light
    [section] /* Darker halo for light text */
    [selector] #graph-container .node.walkthrough-target text.text-dark
    [section] /* Lighter halo for dark text */
    [section] /* ============ Node Interaction State Styles ================= */
    [section] /* Includes mouse hover and temp focus */
    [selector] #graph-container .node:focus circle
    [section] /* Use highlight color for focus */
    [section] /* Consistent scale on focus */
    [section] /* Dragging State */
    [selector] #graph-container .node.dragging circle
    [section] /* Slightly less scale than hover/focus */
    [selector] #graph-container .node.details-shown-for circle
    [section] /* Distinct stroke color */
    [section] /* Prominent stroke */
    [section] /* Maintain scale */
    [section] /* Subtle brightness */
    [selector] #graph-container .node.is-neighbor circle
    [selector] #graph-container .node.is-neighbor.is-interacted circle
    [section] /* Focus/hover states take precedence - keep their styles */
    [selector] #graph-container .node.is-neighbor.details-shown-for circle
    [section] /* Details-shown state takes precedence */
    [selector] #graph-container .node.faded
    [selector] #graph-container .node:not(.faded)
    [section] /* Ensure non-faded nodes are fully opaque */
    [section] /* Temp hover/focus */
    [selector] #graph-container .node:focus
    [section] /* Ensure the group element also has no outline */
    [section] /* Temp JS focus */
    [section] /* Persistent */
    [selector] #graph-container .node.dragging
    [section] /* Override fading */
    [section] /* Search & JS Focus Highlights (Temporary states) */
    [selector] #graph-container .node.search-match circle
    [selector] #graph-container .node.search-non-match
    [section] /* More faded than standard fade */
    [selector] #graph-container .node.focus-highlight circle
    [section] /* ===================== Link Styles ========================== */
    [section] /* Base Link Style */
    [selector] #graph-container .link
    [section] /* Relationship Type Specific Link Styles */
    [selector] #graph-container .link[data-type="HAS_FOUNDATION"]
    [selector] #graph-container .link[data-type="HAS_SUBCATEGORY"]
    [selector] #graph-container .link[data-type="DEVELOPS"]
    [selector] #graph-container .link[data-type="CREATES"]
    [selector] #graph-container .link[data-type="LEADS_TO"]
    [section] /* Link Highlighting/Fading (during hover OR details shown) */
    [selector] #graph-container .link.highlighted
    [selector] #graph-container .link.faded
    [section] /* Make very faint */
    [section] /* ================== UI Element Styles ======================= */
    [section] /* Popups (Node Details & Legend) */
    [selector] #popup, #legend-popup
    [section] /* Use display none/flex for show/hide */
    [section] /* Start transparent */
    [selector] #popup.visible, #legend-popup.visible
    [section] /* Show using flex */
    [section] /* Fade in */
    [selector] #popup .content, #legend-popup .content
    [section] /* Limit height */
    [section] /* Allow content scrolling */
    [section] /* Start scaled down */
    [section] /* Start transparent for transition */
    [selector] #popup.visible .content, #legend-popup.visible .content
    [section] /* Animate to full size */
    [section] /* Animate to full opacity */
    [section] /* Popup Title Styling (Use color classes applied by JS) */
    [selector] #popup .content h2, #legend-popup .content h2
    [selector] #legend-popup .content h2
    [section] /* Keep Legend title base color (Orange) */
    [section] /* Popup Close Button */
    [selector] #popup .close-button, #legend-popup .close-button
    [section] /* Style as button */
    [selector] #popup .close-button:focus, #legend-popup .close-button:focus
    [section] /* Consistent focus indicator */
    [section] /* --- HTML Title Color Rules (For Popups/CV - Applied by JS) --- */
    [selector] strong.title-layer-1.color-variant-0.text-dark
    [selector] strong.title-layer-1.color-variant-0.text-light
    [selector] #popup .content .cv-error
    [selector] #popup .content .cv-profile-header
    [section] /* Allow wrap */
    [selector] #popup .content .cv-profile-body
    [section] /* Allow summary to wrap */
    [selector] #popup .content .cv-profile-summary
    [selector] #popup .content img.profile-photo
    [section] /* Base border style */
    [section] /* Border color applied by specific class rule below */
    [selector] img.profile-photo.border-layer-0-variant-0
    [section] /* Add more variants if layer 0 could have them */
    [selector] #popup .content .cv-section
    [section] /* Section Title Style (Uses color classes applied by JS) */
    [selector] #popup .content h3.cv-section-title
    [section] /* List Styles */
    [selector] #popup .content .cv-list
    [selector] #popup .content .cv-list-no-bullets
    [section] /* Item Styles */
    [selector] #popup .content .cv-item
    [section] /* Item Title Style (Uses color classes applied by JS) */
    [selector] #popup .content .cv-item strong.item-title
    [selector] #popup .content .cv-item-details
    [section] /* For non-list details */
    [selector] #popup .content .cv-item-details div
    [selector] #popup .content .cv-item-details ul
    [selector] #popup .content .cv-item-details ul li
    [section] /* Skills Section Specific Styles */
    [selector] #popup .content .skills-container
    [selector] #popup .content .cv-skill-category
    [section] /* Skill Category Title Style (Uses color classes applied by JS) */
    [selector] #popup .content .cv-skill-category h4
    [selector] #popup .content .cv-skill-list
    [selector] #popup .content .cv-skill-item
    [section] /* --- End Classic CV Styles --- */
    [section] /* Legend Popup Specific Styles */
    [selector] #legend-popup .legend-content
    [selector] #legend-popup h3
    [selector] #legend-popup .legend-item
    [selector] #legend-popup .legend-color
    [section] /* Background color set by layer/variant class rules below */
    [section] /* Style for link type indicators */
    [selector] #legend-popup .legend-color.line
    [selector] .legend-color.layer-0.color-variant-0
    [selector] .legend-color.layer-1.color-variant-0
    [selector] .legend-color.layer-2.color-variant-0
    [selector] .legend-color.layer-3.color-variant-0
    [selector] .legend-color.layer-4.color-variant-0
    [section] /* Add rules for other variants if needed in legend */
    [section] /* Legend Relationship Line Colors */
    [selector] .legend-color.line.rel-has-foundation
    [selector] .legend-color.line.rel-has-subcategory
    [section] /* Simulate dash with border */
    [selector] .legend-color.line.rel-develops
    [section] /* Simulate dot with border */
    [selector] .legend-color.line.rel-creates
    [section] /* Simulate dash-dot-dot using gradient */
    [selector] .legend-color.line.rel-leads-to
    [section] /* Profile Picture Button (Menu Trigger) */
    [selector] #profile-legend-button
    [section] /* Above menu panel when closed */
    [section] /* Base border */
    [section] /* Match profile node color */
    [section] /* Clip image */
    [section] /* Fallback background */
    [selector] #profile-legend-button img
    [selector] #profile-legend-button:hover
    [selector] #profile-legend-button:active
    [selector] #profile-legend-button:focus
    [section] /* Use consistent highlight color */
    [section] /* Menu Panel */
    [selector] #menu-panel
    [section] /* Position below profile button */
    [section] /* Start hidden */
    [section] /* Start slightly up and scaled down */
    [section] /* Prevent interaction when hidden */
    [section] /* Below profile button */
    [selector] #menu-panel.menu-open
    [section] /* Animate to final position */
    [section] /* Allow interaction when open */
    [section] /* Menu Items */
    [selector] #menu-panel .search-box
    [section] /* Rounded search box */
    [selector] #menu-panel .search-box:focus-within
    [section] /* Highlight on focus */
    [selector] #menu-panel .search-box input
    [selector] #menu-panel .search-icon
    [section] /* Search Feedback (Style the added class) */
    [selector] #menu-panel .search-feedback
    [section] /* Use error color */
    [section] /* Shown by JS */
    [section] /* Control Buttons */
    [selector] #menu-panel .control-button
    [section] /* Align text left */
    [section] /* Align icon and text */
    [section] /* Ensure text aligns left */
    [selector] #menu-panel .control-button:hover
    [section] /* Use theme color on hover */
    [selector] #menu-panel .control-button:focus
    [section] /* Consistent focus outline */
    [section] /* Tooltip */
    [selector] .tooltip
    [section] /* Positioned by JS */
    [section] /* Slightly transparent */
    [section] /* Optional background blur */
    [section] /* Prevent tooltip from blocking interactions */
    [section] /* Use config values if possible, else default */
    [section] /* Above graph elements */
    [section] /* Initially hidden */
    [section] /* Darker strong text */
    [selector] .tooltip strong
    [section] /* Tooltip Indicator Swatch */
    [selector] .tooltip-layer-indicator
    [section] /* Background color set by layer/variant classes applied by JS */
    [selector] .tooltip-type
    [selector] .tooltip-layer-indicator.layer-0.color-variant-0
    [selector] .tooltip-layer-indicator.layer-1.color-variant-0
    [selector] .tooltip-layer-indicator.layer-1.color-variant-1
    [selector] .tooltip-layer-indicator.layer-2.color-variant-0
    [selector] .tooltip-layer-indicator.layer-2.color-variant-1
    [selector] .tooltip-layer-indicator.layer-3.color-variant-0
    [selector] .tooltip-layer-indicator.layer-3.color-variant-1
    [selector] .tooltip-layer-indicator.layer-4.color-variant-0
    [section] /* Add more variants if tooltip might show them */
    [section] /* ============ Accessibility & Walkthrough =================== */
    [section] /* Reduced Motion */
    [section] /* Print Styles */
    [section] /* Hide interactive UI elements */
    [section] /* Simplify graph appearance for print */
    [section] /* Override dynamic fill */
    [section] /* Ensure text visible, black, no halo */
    [section] /* Dashed/dotted links might not print well, simplify */
    [section] /* Walkthrough Styles */
    [selector] .walkthrough-overlay
    [selector] .walkthrough-tooltip
    [selector] .walkthrough-tooltip h3
    [selector] .walkthrough-tooltip p
    [section] /* Emphasized text */
    [selector] .walkthrough-tooltip em
    [section] /* Strong text */
    [selector] .walkthrough-tooltip strong
    [selector] .walkthrough-buttons
    [selector] .walkthrough-button
    [selector] .walkthrough-button:hover
    [selector] .walkthrough-button:focus
    [selector] .walkthrough-button.walkthrough-skip
    [selector] .walkthrough-button.walkthrough-skip:hover
    [section] /* Use fixed for viewport positioning */
    [selector] .walkthrough-cursor
    [section] /* Walkthrough Node Highlight */
    [selector] #graph-container .node.walkthrough-target circle
    [section] /* Make highlight prominent */
    [section] /* Ensure fully visible */
    [selector] #graph-container .node.walkthrough-target text
    [section] /* Ensure size override */
    [selector] .walkthrough-element-highlight
    [section] /* Optional rounded outline */
    [section] /* Glow effect */
    [section] /* Needed for z-index potentially */
    [section] /* Ensure highlighted element is above overlay background */
    [section] /* ==================== Responsive Styles ===================== */
    [section] /* Tablet */
    [section] /* Adjust UI element positions/sizes */
    [section] /* Slightly smaller base text size in graph */
    [section] /* Only applies if shown */
    [section] /* Adjust halo for explicitly shown text on tablet */
    [section] /* Adjust popup padding and sizing */
    [section] /* Mobile */
    [section] /* Wider menu panel on small screens */
    [section] /* Hide feedback text */
    [section] /* Adjust popups for small screens */
    [section] /* Center profile photo in popup on mobile */
    [section] /* Stack skill categories */
    [section] /* Legend adjustments */
    [section] /* Walkthrough tooltip */
    [section] /* Text size already small, ensure visibility rules work */

structure from public/graph-display/css/components/_accessibility.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_accessibility.css — web github task manager * ────────────────────────────────────
    [section] /* Skip Navigation Link */
    [selector] .skip-link
    [selector] .skip-link:focus

structure from public/graph-display/css/components/_base.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_base.css — web github task manager * ─────────────────────────────────────────────
    [section] /* Modern CSS Reset */
    [section] /* Prevent text size adjustment on orientation change */
    [section] /* Improved font rendering */
    [section] /* Prevent body scroll */
    [section] /* Prevent user selection on UI elements (allow on content) */
    [section] /* Remove tap highlight on iOS */
    [section] /* Performance optimizations */
    [section] /* Allow text selection in content areas */
    [selector] .cv-profile-summary
    [section] /* Headings */
    [selector] h1, h2, h3, h4, h5, h6
    [selector] h1
    [selector] h2
    [selector] h3
    [selector] h4, h5, h6
    [section] /* Links */
    [selector] a
    [selector] a:hover
    [selector] a:focus-visible
    [section] /* Lists */
    [selector] ul, ol
    [section] /* Images */
    [selector] img
    [section] /* Visually hidden but accessible (for screen readers & SEO) */
    [selector] .visually-hidden
    [section] /* SEO content - hidden visually, available to search engines */
    [selector] .seo-content
    [selector] .seo-content a

structure from public/graph-display/css/components/_buttons.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_buttons.css — web github task manager * ──────────────────────────────────────────
    [section] /* Base button styles */
    [selector] .walkthrough-tooltip button
    [section] /* Accessibility requirement */
    [section] /* Disable double-tap zoom */
    [section] /* Pointer cursor for better UX */
    [section] /* Visual styles */
    [section] /* Mobile-friendly padding */
    [section] /* Transitions */
    [section] /* Prevent text selection */
    [section] /* Display */
    [section] /* Hover state (desktop) */
    [selector] .control-button:hover
    [section] /* Active/pressed state */
    [selector] .control-button:active
    [section] /* Focus state (keyboard navigation) */
    [selector] .control-button:focus-visible
    [section] /* Disabled state */
    [selector] .control-button:disabled
    [section] /* Touch feedback for mobile devices */
    [section] /* Menu control buttons */
    [selector] .control-button
    [selector] .control-button:last-child
    [section] /* Menu panel specific control buttons */
    [selector] #menu-panel .control-button
    [selector] #menu-panel .control-button:hover
    [selector] #menu-panel .control-button:focus
    [section] /* Close button (for popups) */
    [selector] .close-button
    [selector] .close-button:focus-visible
    [selector] .close-button:active
    [section] /* Walkthrough buttons */
    [selector] .walkthrough-tooltip .tooltip-buttons

structure from public/graph-display/css/components/_colors.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_colors.css — web github task manager * ───────────────────────────────────────────
    [section] /* Text color classes (for contrast) */
    [selector] .text-light
    [selector] .text-dark
    [section] /* Force dark text for nodes and title modules */
    [selector] .title-module
    [section] /* ===== Title/Heading Color Rules ===== */
    [section] /* Layer 0 (Profile) */
    [selector] strong.title-layer-0.color-variant-0
    [section] /* Layer 1 (Foundations) */
    [selector] strong.title-layer-1.color-variant-0
    [selector] strong.title-layer-1.color-variant-1
    [selector] strong.title-layer-1.color-variant-2
    [selector] strong.title-layer-1.color-variant-3
    [selector] strong.title-layer-1.color-variant-4
    [section] /* Layer 2 (Skills) */
    [selector] strong.title-layer-2.color-variant-0
    [selector] strong.title-layer-2.color-variant-1
    [selector] strong.title-layer-2.color-variant-2
    [selector] strong.title-layer-2.color-variant-3
    [selector] strong.title-layer-2.color-variant-4
    [section] /* Layer 3 (Impact) */
    [selector] strong.title-layer-3.color-variant-0
    [selector] strong.title-layer-3.color-variant-1
    [selector] strong.title-layer-3.color-variant-2
    [selector] strong.title-layer-3.color-variant-3
    [selector] strong.title-layer-3.color-variant-4
    [section] /* Layer 4 (Outcome) */
    [selector] strong.title-layer-4.color-variant-0
    [selector] strong.title-layer-4.color-variant-1
    [selector] strong.title-layer-4.color-variant-2
    [selector] strong.title-layer-4.color-variant-3
    [selector] strong.title-layer-4.color-variant-4
    [section] /* ===== Border Color Classes ===== */
    [selector] .border-layer-0-variant-0
    [section] /* Add more as needed for specific use cases */

structure from public/graph-display/css/components/_graph.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_graph.css — web github task manager * ────────────────────────────────────────────
    [section] /* ===== Graph Container ===== */
    [selector] #main-content
    [selector] #graph-section
    [selector] #graph-container
    [section] /* Performance optimizations */
    [selector] #graph-container.grabbing
    [selector] #graph-container svg
    [section] /* ===== Base Node Circle Styles ===== */
    [selector] #graph-container .node circle
    [section] /* ===== Base Node Text Styles ===== */
    [selector] #graph-container .node text
    [section] /* ===== Parent Node Specific ===== */
    [selector] #graph-container .node-type-parent circle
    [selector] #graph-container .node-type-parent text
    [section] /* ===== Child Node Specific ===== */
    [selector] #graph-container .node-type-child circle
    [selector] #graph-container .node-type-child text
    [section] /* ===== Layer Color Variants ===== */
    [section] /* Layer 0 (Profile Purple) */
    [selector] #graph-container[data-color-mode="layer"] .node.layer-0.color-variant-0 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-0.color-variant-1 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-0.color-variant-2 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-0.color-variant-3 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-0.color-variant-4 circle
    [section] /* Layer 1 (Foundations Blue) */
    [selector] #graph-container[data-color-mode="layer"] .node.layer-1.color-variant-0 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-1.color-variant-1 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-1.color-variant-2 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-1.color-variant-3 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-1.color-variant-4 circle
    [section] /* Layer 2 (Skills Orange) */
    [selector] #graph-container[data-color-mode="layer"] .node.layer-2.color-variant-0 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-2.color-variant-1 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-2.color-variant-2 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-2.color-variant-3 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-2.color-variant-4 circle
    [section] /* Layer 3 (Impact Green) */
    [selector] #graph-container[data-color-mode="layer"] .node.layer-3.color-variant-0 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-3.color-variant-1 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-3.color-variant-2 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-3.color-variant-3 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-3.color-variant-4 circle
    [section] /* Layer 4 (Outcome Purple) */
    [selector] #graph-container[data-color-mode="layer"] .node.layer-4.color-variant-0 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-4.color-variant-1 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-4.color-variant-2 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-4.color-variant-3 circle
    [selector] #graph-container[data-color-mode="layer"] .node.layer-4.color-variant-4 circle
    [section] /* ===== SVG Text Color Classes (High Specificity for Consistency) ===== */
    [section] /* Ensures all node text has consistent, high-contrast styling */
    [selector] #graph-container .node text.text-light
    [selector] #graph-container .node text.text-dark
    [selector] #graph-container .node.highlighted text
    [section] /* ===== Node Interaction States ===== */
    [selector] #graph-container .node:focus circle
    [selector] #graph-container .node:focus-visible
    [selector] #graph-container .node.dragging
    [selector] #graph-container .node.faded
    [selector] #graph-container .node.faded circle
    [selector] #graph-container .node.faded text
    [selector] #graph-container .node.is-interacted circle
    [selector] #graph-container .node.details-shown-for circle
    [section] /* ===== Search/Highlight States ===== */
    [selector] #graph-container .node.focus-highlight circle
    [selector] #graph-container .node.search-match circle
    [selector] #graph-container .node.walkthrough-target circle
    [selector] #graph-container .node.highlighted circle
    [section] /* ===== Animations ===== */
    [section] /* ===== Link Styles ===== */
    [selector] #graph-container .link
    [selector] #graph-container .link[data-type="HAS_FOUNDATION"]
    [selector] #graph-container .link[data-type="HAS_SUBCATEGORY"]
    [selector] #graph-container .link[data-type="DEVELOPS"]
    [selector] #graph-container .link[data-type="CREATES"]
    [selector] #graph-container .link[data-type="LEADS_TO"]
    [section] /* Task management template link types */
    [selector] #graph-container .link[data-type="HAS_TASK"]
    [selector] #graph-container .link[data-type^="DEPENDS_"]
    [selector] #graph-container .link.highlighted
    [selector] #graph-container .link.faded
    [section] /* Link interaction states */
    [section] /* ===== Node Status Visual States ===== */
    [selector] #graph-container .node.node-status-done circle
    [selector] #graph-container .node.node-status-done text
    [selector] #graph-container .node.node-status-in-progress circle
    [section] /* Not Started tasks remain static (default styles) */
    [section] /* Category filter dimming */
    [selector] #graph-container .node.category-dimmed
    [selector] #graph-container .link.category-dimmed
    [section] /* ===== Legend Status Sample Indicators ===== */
    [selector] .legend-color.legend-sample-done
    [selector] .legend-color.legend-sample-in-progress

structure from public/graph-display/css/components/_header.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_header.css — web github task manager * ───────────────────────────────────────────
    [selector] header
    [section] /* Allow clicks through header */
    [selector] header button
    [section] /* Re-enable clicks on button */
    [section] /* Profile/Menu Button */
    [selector] #profile-legend-button
    [section] /* Evaluator detection */
    [section] /* Visual styles */
    [section] /* Transitions */
    [section] /* Touch optimization */
    [section] /* Display */
    [section] /* Shadow */
    [selector] #profile-legend-button img
    [section] /* Hover state (desktop) */
    [selector] #profile-legend-button:hover
    [section] /* Active state */
    [selector] #profile-legend-button:active
    [section] /* Focus state */
    [selector] #profile-legend-button:focus-visible
    [section] /* Menu open state */
    [selector] #profile-legend-button.menu-active
    [section] /* Mobile optimizations */

structure from public/graph-display/css/components/_menu.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_menu.css — web github task manager * ─────────────────────────────────────────────
    [selector] #menu-aside
    [section] /* Flexbox for alignment */
    [section] /* Prevent scrolling background */
    [section] /* Touch optimization */
    [selector] #menu-aside.menu-open
    [selector] #menu-panel
    [section] /* Mobile-friendly padding - evaluator detection */
    [section] /* Extra space for close button */
    [section] /* Size constraints - similar to modal */
    [section] /* Scrolling */
    [section] /* Positioning */
    [section] /* Mobile margin - evaluator detection */
    [section] /* Shadow */
    [section] /* Display */
    [section] /* Animation */
    [selector] #menu-panel .cv-section-title
    [selector] #menu-aside.menu-open #menu-panel
    [section] /* ===== Calendar Download Dropdown ===== */
    [selector] .calendar-ctrl-details
    [selector] .calendar-ctrl-details > summary
    [selector] .calendar-ctrl-details > summary::-webkit-details-marker
    [selector] .calendar-ctrl-menu
    [selector] .calendar-ctrl-item
    [selector] .calendar-ctrl-item:hover
    [section] /* Search Box */
    [selector] .search-box
    [selector] .search-icon
    [selector] .search-box input
    [selector] .search-box input::placeholder
    [selector] .search-box input:focus
    [section] /* Template Selector */
    [selector] .template-box
    [selector] .template-box label
    [selector] .template-box select
    [selector] .template-box select:focus
    [selector] .folder-path-row
    [selector] .folder-path-row button
    [selector] .folder-path-row input[type="text"]
    [selector] .folder-path-row input[type="text"]:focus
    [selector] .folder-path-row button:hover
    [selector] .folder-path-result
    [selector] .folder-path-result[data-status="success"]
    [selector] .folder-path-result[data-status="error"]
    [selector] .folder-path-result button
    [selector] .folder-path-result button:hover
    [section] /* Search feedback */
    [selector] .search-feedback
    [section] /* Menu backdrop (mobile) - deprecated, using menu-aside overlay */
    [section] /* Menu close button */
    [selector] .menu-close-button
    [selector] .menu-close-button:hover
    [selector] .menu-close-button:active
    [selector] .menu-close-button:focus-visible
    [section] /* Mobile optimizations - following modal template */

structure from public/graph-display/css/components/_modules-sidebar.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_modules sidebar.css — web github task manager * ──────────────────────────────────
    [section] /* Toggle button (floats bottom-left when modules are available) */
    [selector] .modules-sidebar-toggle
    [selector] .modules-sidebar-toggle:focus-visible
    [section] /* Sidebar panel */
    [selector] .modules-sidebar
    [selector] .modules-sidebar.sidebar-open
    [section] /* Header */
    [selector] .modules-sidebar-header
    [selector] .modules-sidebar-title
    [selector] .modules-sidebar-close
    [selector] .modules-sidebar-close:focus-visible
    [section] /* Scrollable content area */
    [selector] .modules-sidebar-content
    [selector] .modules-root-link
    [selector] .modules-root-link.active
    [selector] .modules-tree
    [selector] .modules-tree-folder
    [selector] .modules-tree-folder[open] > .modules-tree-summary .modules-tree-folder-icon
    [selector] .modules-tree-summary
    [selector] .modules-tree-summary::-webkit-details-marker
    [selector] .modules-tree-summary:focus-visible
    [selector] .modules-tree-folder-icon
    [selector] .modules-tree-folder:not([open]) > .modules-tree-summary .modules-tree-folder-icon
    [selector] .modules-tree-folder-name
    [selector] .modules-tree-children
    [selector] .modules-tree-summary[data-dept="src"]
    [selector] .modules-tree-summary[data-dept="SHARED"]
    [selector] .modules-tree-summary[data-dept="shop-db"]
    [selector] .modules-tree-summary[data-dept="1-STRATEGY"]
    [selector] .modules-tree-summary[data-dept="2-RESEARCH"]
    [selector] .modules-tree-summary[data-dept="3-PLANNING"]
    [selector] .modules-tree-summary[data-dept="4-ENGINEERING"]
    [selector] .modules-tree-summary[data-dept="5-MARKETING"]
    [selector] .modules-tree-summary[data-dept="6-OPERATIONS"]
    [selector] .modules-tree-leaf
    [selector] .modules-tree-leaf-name
    [section] /* Department group header */
    [selector] .modules-dept-header
    [section] /* Individual module button */
    [selector] .modules-item
    [selector] .modules-item.active
    [selector] .modules-item:focus-visible
    [section] /* Type badge */
    [selector] .modules-item-badge
    [selector] .modules-root-link:focus:not(:focus-visible)
    [section] /* ===== Sidebar tab header (Modules / Tree toggle) ===== */
    [selector] .modules-sidebar-tabs
    [selector] .modules-sidebar-tab-btn
    [selector] .modules-sidebar-tab-btn.active
    [selector] .modules-sidebar-tab-btn:hover
    [section] /* ===== Tab panes (modules vs tree) ===== */
    [selector] .sidebar-tab-pane
    [selector] .sidebar-tab-pane.active
    [section] /* ===== Task tree sidebar view ===== */
    [selector] .sidebar-task-tree
    [selector] .tree-layer
    [selector] .tree-layer-label
    [selector] .tree-task-btn
    [selector] .tree-task-btn:focus-visible
    [selector] .tree-task-btn:focus:not(:focus-visible)
    [selector] .tree-task-icon
    [section] /* Status tinting on tree items */
    [selector] .tree-task-btn.tree-status-done .tree-task-name
    [selector] .tree-task-btn.tree-status-in-progress .tree-task-icon
    [selector] .tree-task-btn.tree-status-in-progress
    [selector] .tree-empty
    [section] /* Department color coding */
    [selector] .modules-dept-header[data-dept="infrastructure"]
    [selector] .modules-dept-header[data-dept="SHARED"]
    [selector] .modules-dept-header[data-dept="database"]
    [selector] .modules-dept-header[data-dept="1-STRATEGY"]
    [selector] .modules-dept-header[data-dept="2-RESEARCH"]
    [selector] .modules-dept-header[data-dept="3-PLANNING"]
    [selector] .modules-dept-header[data-dept="4-ENGINEERING"]
    [selector] .modules-dept-header[data-dept="5-MARKETING"]
    [selector] .modules-dept-header[data-dept="6-OPERATIONS"]
    [selector] .modules-section-group
    [selector] .modules-section-summary
    [selector] .modules-section-summary::-webkit-details-marker
    [selector] .modules-section-summary:hover
    [selector] .modules-section-body
    [selector] .modules-category-item
    [selector] .modules-item-count

structure from public/graph-display/css/components/_popups.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_popups.css — web github task manager * ───────────────────────────────────────────
    [section] /* Popup containers (overlay) */
    [selector] #legend-popup
    [section] /* Flexbox for perfect centering */
    [section] /* Prevent scrolling background */
    [section] /* Touch optimization */
    [selector] #legend-popup.visible
    [section] /* Popup content boxes */
    [selector] #legend-popup .content
    [section] /* Mobile-friendly padding - evaluator detection */
    [section] /* Extra space for close button */
    [section] /* Size constraints */
    [section] /* Scrolling */
    [section] /* Positioning */
    [section] /* Mobile margin - evaluator detection */
    [section] /* Shadow */
    [section] /* Animation */
    [selector] #legend-popup.visible .content
    [section] /* Popup titles */
    [selector] #legend-popup .content h2
    [selector] .task-node-list
    [selector] #popup .content .task-node-btn
    [selector] #popup .content .task-node-btn[data-nav-depth]:focus-visible
    [section] /* Buttons without a navigable relation show default cursor */
    [selector] #popup .content .task-node-btn .tn-name
    [section] /* Hours badge */
    [selector] #popup .content .task-node-btn .tn-hours
    [section] /* Status-aware modifiers */
    [selector] #popup .content .task-node-btn.task-node-status-done
    [selector] #popup .content .task-node-btn.task-node-status-in-progress
    [selector] #popup .content .task-node-btn.task-node-nav-btn
    [selector] #popup .content .task-node-btn.task-node-nav-btn .tn-name
    [selector] #popup .content .task-node-btn.task-node-nav-btn:focus-visible
    [selector] #popup .content .task-node-btn.parent-nav-btn
    [selector] #popup .content .task-node-btn.parent-nav-btn:focus-visible
    [section] /* ===== CV Popup Content Styles ===== */
    [selector] .cv-error
    [selector] .cv-profile-header
    [selector] .cv-profile-body
    [selector] .cv-profile-summary
    [selector] img.profile-photo
    [selector] img.profile-photo.border-layer-0-variant-0
    [section] /* CV Sections */
    [selector] .cv-section
    [selector] .cv-section-title
    [section] /* Lists */
    [selector] .cv-list
    [selector] .cv-list-no-bullets
    [section] /* List items */
    [selector] .cv-item
    [selector] .cv-item strong.item-title
    [selector] .cv-item-details
    [selector] .cv-item-details div
    [selector] .cv-item-details ul
    [selector] .cv-item-details ul li
    [section] /* Skills section */
    [selector] .skills-container
    [selector] .cv-skill-category
    [selector] .cv-skill-category h4
    [selector] .cv-skill-list
    [selector] .cv-skill-item
    [section] /* ===== Legend Popup Styles ===== */
    [selector] .legend-content
    [selector] #legend-popup h3
    [selector] .legend-item
    [selector] .legend-color
    [selector] .legend-color.line
    [section] /* Mobile optimizations */
    [section] /* Walkthrough tooltip (unchanged) */
    [section] /* Removed stray width/height and misplaced closing brackets */
    [section] /* GUIDE PANEL - Graph Types Education */
    [selector] #guide-panel
    [selector] #guide-panel.visible
    [selector] #guide-panel .guide-close-button
    [selector] #guide-panel .guide-close-button:hover
    [selector] #guide-panel .guide-content
    [selector] #guide-panel h2
    [selector] .guide-structure
    [selector] .guide-structure h3
    [selector] .guide-structure p
    [selector] .guide-structure ul
    [selector] .guide-structure li
    [selector] .guide-structure li:before
    [selector] .guide-example
    [section] /* Mobile responsive guide panel */
    [section] /* SUBTASK NAVIGATION                                           */
    [section] /* ===== Popup Dropdowns (Acceptance Criteria, Sub-tasks) ===== */
    [selector] .popup-dropdown
    [selector] .popup-dropdown > summary
    [selector] .popup-dropdown > summary:hover
    [selector] .popup-dropdown > summary::-webkit-details-marker
    [selector] .popup-dropdown > summary::before
    [selector] .popup-dropdown[open] > summary::before
    [selector] .popup-dropdown-count
    [selector] .popup-dropdown > ul
    [selector] .popup-dropdown > ul > li
    [selector] .popup-dropdown > ul > li em
    [selector] .subtask-breadcrumb
    [selector] .breadcrumb-link
    [selector] .breadcrumb-link:hover
    [selector] .breadcrumb-sep
    [selector] .breadcrumb-current

structure from public/graph-display/css/components/_responsive.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_responsive.css — web github task manager * ───────────────────────────────────────
    [section] /* ===== Touch Optimizations ===== */
    [section] /* Ensure all interactive elements meet minimum touch target */
    [selector] textarea
    [section] /* Explicit pixel values for evaluator detection */
    [section] /* CSS variable fallback for consistency */
    [section] /* Disable double-tap zoom */
    [section] /* Pointer cursor for touch feedback */
    [section] /* Increase padding for better touch targets */
    [selector] a
    [section] /* Add visual feedback for touch on mobile */
    [section] /* ===== Tablet Breakpoint (768px and below) ===== */
    [section] /* Typography adjustments */
    [section] /* Increase button padding for easier tapping */
    [section] /* Search input */
    [section] /* Prevent iOS zoom */
    [section] /* Close button sizing */
    [section] /* Ensure main content fills viewport */
    [section] /* ===== Mobile Breakpoint (480px and below) ===== */
    [section] /* Further typography adjustments */
    [section] /* All buttons full width on mobile */
    [section] /* Popup adjustments */
    [section] /* CV content adjustments */
    [section] /* ===== Large Tablet Breakpoint (992px and below) ===== */
    [section] /* ===== Desktop Breakpoint (1024px and below) ===== */
    [section] /* Node sizing delegated to JS estimated_hours computation */
    [section] /* ===== Large Desktop Breakpoint (1200px and below) ===== */
    [section] /* Optimize for standard desktop screens */
    [section] /* ===== Small Tablet Breakpoint (576px and below) ===== */
    [section] /* ===== iPhone X and newer (with notch) ===== */
    [section] /* ===== Landscape Orientation on Mobile ===== */
    [section] /* Reduce vertical spacing */
    [section] /* Smaller header elements */
    [section] /* ===== High DPI / Retina Displays ===== */
    [section] /* Sharper borders and shadows */
    [section] /* Crisper text rendering */
    [section] /* ===== Reduce Motion Preference ===== */
    [section] /* ===== Dark Mode Support (future enhancement) ===== */
    [section] /* Already using dark theme, but can adjust if needed */
    [section] /* ===== Print Styles ===== */
    [section] /* Hide UI elements */
    [section] /* Show all content */

structure from public/graph-display/css/components/_tooltip.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_tooltip.css — web github task manager * ──────────────────────────────────────────
    [selector] #tooltip
    [selector] #tooltip.visible
    [section] /* Tooltip color indicators */
    [selector] #tooltip.tooltip-layer-0
    [selector] #tooltip.tooltip-layer-1
    [selector] #tooltip.tooltip-layer-2
    [selector] #tooltip.tooltip-layer-3
    [selector] #tooltip.tooltip-layer-4
    [section] /* Tooltip indicator swatch */
    [selector] .tooltip-layer-indicator
    [selector] .tooltip-type
    [selector] .tooltip strong
    [section] /* Tooltip indicator colors */
    [selector] .tooltip-layer-indicator.layer-0.color-variant-0
    [selector] .tooltip-layer-indicator.layer-1.color-variant-0
    [selector] .tooltip-layer-indicator.layer-1.color-variant-1
    [selector] .tooltip-layer-indicator.layer-2.color-variant-0
    [selector] .tooltip-layer-indicator.layer-2.color-variant-1
    [selector] .tooltip-layer-indicator.layer-3.color-variant-0
    [selector] .tooltip-layer-indicator.layer-3.color-variant-1
    [selector] .tooltip-layer-indicator.layer-4.color-variant-0

structure from public/graph-display/css/components/_variables.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_variables.css — web github task manager * ────────────────────────────────────────
    [section] /* ===== Base Layer Colors ===== */
    [css-variable] --layer0-base
    [css-variable] --layer1-base
    [css-variable] --layer2-base
    [css-variable] --layer3-base
    [css-variable] --layer4-base
    [css-variable] --fallback-color
    [section] /* ===== Color Variants ===== */
    [css-variable] --layer0-variant-0
    [css-variable] --layer0-variant-1
    [css-variable] --layer0-variant-2
    [css-variable] --layer0-variant-3
    [css-variable] --layer0-variant-4
    [css-variable] --layer1-variant-0
    [css-variable] --layer1-variant-1
    [css-variable] --layer1-variant-2
    [css-variable] --layer1-variant-3
    [css-variable] --layer1-variant-4
    [css-variable] --layer2-variant-0
    [css-variable] --layer2-variant-1
    [css-variable] --layer2-variant-2
    [css-variable] --layer2-variant-3
    [css-variable] --layer2-variant-4
    [css-variable] --layer3-variant-0
    [css-variable] --layer3-variant-1
    [css-variable] --layer3-variant-2
    [css-variable] --layer3-variant-3
    [css-variable] --layer3-variant-4
    [css-variable] --layer4-variant-0
    [css-variable] --layer4-variant-1
    [css-variable] --layer4-variant-2
    [css-variable] --layer4-variant-3
    [css-variable] --layer4-variant-4
    [section] /* ===== Relationship Colors ===== */
    [css-variable] --rel-has-foundation
    [css-variable] --rel-has-subcategory
    [css-variable] --rel-develops
    [css-variable] --rel-creates
    [css-variable] --rel-leads-to
    [section] /* ===== Node Status Colors & Effects ===== */
    [css-variable] --status-completed-opacity
    [css-variable] --status-completed-filter
    [css-variable] --status-in-progress-glow
    [css-variable] --status-in-progress-aura
    [section] /* ===== UI Colors ===== */
    [css-variable] --color-background
    [css-variable] --color-text
    [css-variable] --color-text-light
    [css-variable] --color-text-dark
    [css-variable] --color-primary
    [css-variable] --color-secondary
    [css-variable] --color-accent
    [css-variable] --color-popup-bg
    [css-variable] --color-menu-bg
    [css-variable] --module-nav-bg
    [css-variable] --module-nav-text
    [css-variable] --module-nav-muted
    [css-variable] --module-nav-border
    [css-variable] --module-nav-hover
    [css-variable] --module-nav-active-bg
    [css-variable] --module-nav-active-border
    [css-variable] --module-nav-shadow
    [section] /* ===== Typography ===== */
    [css-variable] --font-family
    [css-variable] --font-size-base
    [css-variable] --font-size-sm
    [css-variable] --font-size-lg
    [css-variable] --font-size-xl
    [css-variable] --font-size-xxl
    [css-variable] --line-height-base
    [css-variable] --line-height-heading
    [section] /* ===== Spacing ===== */
    [css-variable] --spacing-xs
    [css-variable] --spacing-sm
    [css-variable] --spacing-md
    [css-variable] --spacing-lg
    [css-variable] --spacing-xl
    [css-variable] --spacing-xxl
    [section] /* ===== Touch Targets ===== */
    [css-variable] --touch-target-min
    [css-variable] --button-padding
    [css-variable] --button-padding-lg
    [section] /* ===== Border Radius ===== */
    [css-variable] --radius-sm
    [css-variable] --radius-md
    [css-variable] --radius-lg
    [css-variable] --radius-full
    [section] /* ===== Shadows ===== */
    [css-variable] --shadow-sm
    [css-variable] --shadow-md
    [css-variable] --shadow-lg
    [css-variable] --popup-shadow
    [section] /* ===== Transitions ===== */
    [css-variable] --transition-fast
    [css-variable] --transition-base
    [css-variable] --transition-slow
    [css-variable] --transition-ease
    [section] /* ===== Z-Index Layers ===== */
    [css-variable] --z-base
    [css-variable] --z-header
    [css-variable] --z-menu
    [css-variable] --z-popup
    [css-variable] --z-tooltip
    [css-variable] --z-walkthrough
    [css-variable] --z-skip-link
    [section] /* ===== Graph & Nodes ===== */
    [css-variable] --node-stroke
    [css-variable] --node-highlight-stroke
    [css-variable] --node-details-stroke
    [css-variable] --node-text-stroke
    [css-variable] --node-text-stroke-width
    [css-variable] --link-opacity
    [css-variable] --link-opacity-hover
    [css-variable] --link-opacity-faded
    [css-variable] --link-opacity
    [css-variable] --link-opacity-hover
    [css-variable] --link-opacity-faded
    [section] /* Node text stroke for consistency */
    [css-variable] --node-text-stroke
    [css-variable] --node-text-stroke-width

structure from public/graph-display/css/components/_walkthrough.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/graph display/css/components/_walkthrough.css — web github task manager * ──────────────────────────────────────
    [selector] .walkthrough-overlay
    [selector] .walkthrough-overlay.active
    [section] /* Walkthrough tooltip */
    [selector] .walkthrough-tooltip
    [selector] .walkthrough-tooltip h3
    [selector] .walkthrough-tooltip p
    [selector] .walkthrough-tooltip em
    [selector] .walkthrough-tooltip strong
    [section] /* Walkthrough buttons container */
    [selector] .walkthrough-buttons
    [selector] .walkthrough-button
    [selector] .walkthrough-skip
    [selector] .walkthrough-skip:hover
    [section] /* Animated cursor for walkthrough */
    [selector] .walkthrough-cursor
    [section] /* Walkthrough cursor animation */
    [section] /* Walkthrough node highlight animation */
    [section] /* Walkthrough element highlight */
    [selector] .walkthrough-element-highlight
    [section] /* Mobile optimizations - Adopt Modal Pattern */

structure from public/graph-display/images/favicon.png:  (no extractable definitions)

structure from public/graph-display/images/favicon.svg:  (no extractable definitions)

structure from public/graph-display/images/team/profile-placeholder.svg:  (no extractable definitions)

structure from public/graph-display/js/README.md:
    [file-summary] Graph Display Engine — JS Module Reference
    [heading-1] # Graph Display Engine — JS Module Reference
    [heading-2] ## Module Files
    [heading-2] ## Core Class: `CurriculumGraph`
    [heading-3] ### Construction
    [heading-3] ### Key Methods
    [heading-3] ### Node Selection States (CSS Classes)
    [heading-3] ### Deselecting a Node
    [heading-3] ### Sidebar
    [heading-2] ## Data Flow
    [heading-2] ## Dependency Links (Clickable "Depends on:")
    [heading-2] ## Sub-graph Navigation
    [heading-2] ## Link Types

structure from public/graph-display/js/cv-generator.js:
    [file-summary] Generates HTML for a classic CV view based on graph data. Uses CSS classes for color styling based on node properties.
    function findChildNodes(parentNodeId, relationshipType, allLinks, nodeMap)  «Collect direct child nodes linked from a parent through a specific relationship type.»
    function sortNodes(nodesToSort, method, details)  «Sort CV section nodes using an alpha, chronology, or explicit-order strategy.»
    function generateGenericSectionItems(sectionConfig, allLinks, nodeMap, details)  «Generates HTML list items for a generic section. Applies CSS classes for styling based on node properties.»
    function generateSkillsSectionInternal(sectionConfig, allLinks, nodeMap, details)  «Generates HTML for the skills section. Applies CSS classes for styling based on node properties.»
    function generateClassicCV(nodes, links, details, userConfig)  «Main function to generate and display the Classic CV in the popup. Relies on nodes having layer, colorVariantIndex, and »

structure from public/graph-display/js/d3.v7.min.js:
    [file-summary] Vendored D3 v7 runtime bundle used by the graph-display app.
    class T  «docstring: none»:
        constructor()  «docstring: none»

    class InternMap extends Map  «docstring: none»:

    class InternSet extends Set  «docstring: none»:

    class Su  «docstring: none»:

    class Ru  «docstring: none»:

    class Fu  «docstring: none»:

    class qu  «docstring: none»:

    class Lu  «docstring: none»:

    class ed  «docstring: none»:

    class Jm  «docstring: none»:

    class tx  «docstring: none»:


structure from public/graph-display/js/graph-data.js:
    [file-summary] IMPORTANT: Graph definitions (nodes, relationships, details) must come from external JSON templates following the schemas in `tasksDB/_schema/`.
    const TEMPLATE_REGISTRY  «Global template registry keyed by template id for the graph runtime.»
    const INLINE_TASK_ID_PREFIX  «Prefix used to encode inline subtask task ids into synthetic navigation paths.»
    const GRAPH_NODES  «Backwards-compatible node export for consumers expecting the Career template payload.»
    const GRAPH_LINKS  «Backwards-compatible link export for consumers expecting the Career template payload.»
    const GRAPH_DETAILS  «Backwards-compatible detail export for consumers expecting the Career template payload.»
    function convertCypherToGraph(cypherData)  «Converts raw Cypher-like export data into D3 compatible nodes and links.»
    function normalizePriority(priority)  «Normalize a priority string to the canonical task-management priority enum.»
    function getTaskPredecessorIds(task, validTaskIds)  «Extract valid predecessor task ids from a task's requisites and dependencies.»
    function getDependencyLinkType(dep)  «Resolve the graph link type string for a structured task dependency.»
    function buildDependencyLayering(tasks)  «Compute dependency layers for tasks and flag nodes that participate in cycles.»
    function scaleHoursToRadius(hours, minHours, maxHours, minRadius, maxRadius)  «Scale estimated hours into a rendered node radius using eased clamping.»
    function validateAgainstSchema(obj, schema)  «Perform lightweight shape validation for supported graph template payloads.»
    function resolveProjectIdFromTasksPath(path)  «Extract a project id from a TaskDB node.tasks.json path.»
    function resolveProjectScopedBase(path)  «Return the scoped base path segment for a TaskDB URL. Examples: '/tasksDB/external/first-graph/node.tasks.json' → 'exter»
    function normalizeTaskDbWalkthroughPath(pathValue, scopedBase)  «Normalize a walkthrough asset path for a scoped TaskDB project base.»
    function buildEmbeddedTaskDbTemplate(entry, data, scopedBase, embeddedGraphName)  «Build a graph template from an embedded TaskDB graphTemplate payload.»
    function normalizeProjectRelativeModulePath(modulePath, entryPath)  «Resolve a module path relative to the project entry file inside TaskDB.»
    function normalizeNavigationModules(modules, entryPath)  «Normalize navigation module records and their task id aliases for sidebar use.»
    function buildInlineTaskIdPath(taskId)  «Build a synthetic inline-task navigation path from a numeric task id.»
    function parseInlineTaskPath(path)  «Parse an inline-task navigation path back into its task id.»
    function hasOwnInlineSubtasks(task)  «Determine whether a task owns inline subtask records.»
    function buildChildrenByParentTaskId(tasks)  «Build a parent-task lookup map for hierarchical task relationships.»
    function collectDescendantTasks(childrenByParentId, parentTaskId, visited = new Set())  «Recursively collect descendant tasks for a parent task id.»
    function toFiniteNumber(...values)  «Return the first finite number parsed from a list of candidate values.»
    function normalizeInlineAssignedWorkers(subtask)  «Normalize inline subtask assignee data into the assigned_workers shape.»
    function escapeHtml(value)  «Escape HTML special characters before rendering task details into popups.»
    function normalizeStringList(value, fallback = [])  «Normalize a value into a filtered string list, falling back when needed.»
    function normalizeAssignedWorkersList(task, fallbackTask = {})  «Resolve the assigned-worker list for a task, falling back to its parent task.»
    function buildPopupListDropdown(title, items, renderItem)  «Build a reusable dropdown list section for task-detail popup content.»
    function formatWorkerLabel(worker)  «Format an assigned worker record into a compact display label.»
    function buildTaskSupplementalDetailItems(task)  «Build supplemental task-detail markup for planning, staffing, links, and notes.»
    function normalizeInlineSubtaskTask(subtask, index, parentTask = {})  «Normalize an inline subtask into a task-like record for graph rendering.»
    function buildInlineSubgraphData(sourceData, task)  «Build a task-management payload for a task's inline or child-task subgraph.»
    function buildInlineSubtaskTargets(task, childrenByParentId)  «Build synthetic subtask navigation targets when a task has inline descendants.»
    function normalizeExplicitSubtaskTargets(task)  «Normalize explicit subtask navigation targets declared on a task record.»
    function resolveTaskSubtaskTargets(task, childrenByParentId)  «Resolve the preferred subtask navigation targets for a task.»
    function getTaskNarrativeText(task)  «Build a lowercase narrative string used to classify a task's end-state semantics.»
    function resolveProjectEndConfig(project)  «Resolve the configured graph-end metadata from a project payload.»
    function resolveProjectEndMode(project, terminalTasks)  «Infer the semantic end-node mode for a project graph from config and task narratives.»
    function buildProjectEndDetails(project, terminalTasks, totalProjectHours = 0)  «Build the end-node popup details for a project graph.»
    function buildProjectTaskTemplate(entry, data, options = {})  «Convert a string-id project_task_template payload into the numeric task template shape.»
    function buildTaskManagementTemplate(entry, data, options = {})  «Build a task-management graph template from TaskDB project data.»
    function isDevMode()  «Detect whether the graph app is running on a local development host.»
    function ensureDynamicTaskTemplate(requestedTemplateId, options = {})  «Fetch and register a dynamic TaskDB template when the requested id is not preloaded.»
    function initTemplates()  «Load all registered graph templates into the runtime registry.»
    function getAvailableTemplates()  «Return lightweight metadata for every registered graph template.»
    function loadTemplate(templateId)  «Load a registered template with safe fallbacks for empty runtime state.»
    function getDefaultTemplateId()  «Return the default template id used when the caller does not specify one.»
    function buildProjectTaskTemplatePublic(entry, data, options)  «Public wrapper around project task template construction.»
    function buildInlineTaskSubgraphTemplatePublic(entry, data, inlinePath, options)  «Build a graph template for an inline subtask subgraph selected by synthetic path.»

structure from public/graph-display/js/main-graph.js:
    [file-summary] Main script for initializing and managing the Curriculum Graph. Imports data, CV generator, walkthrough, utilities. Uses CSS classes for color and manages accessibility. UPDATED: Touch interaction mir
    const TEMPLATE_STORAGE_KEY  «Persist the last selected graph template across page reloads.»
    class CurriculumGraph  «Render and manage the interactive curriculum/task graph experience.»:
        constructor(elId, graphData, detailsData, cfg, templateContext = {})  «Create a graph instance bound to a container, template data, and config.»
        deepMerge(target, source)  «Deep-merge nested configuration objects while preserving existing defaults.»
        preprocessData()  «Pre-processes nodes and links: 1. Builds connection index (`linkedByIndex`). 2. Validates nodes, calculates max layer, n»
        init()  «Initialize the graph visualization»
        renderError(message)  «Renders an error message in the container»
        onStable(callback)  «Add callback function to execute when simulation becomes stable»
        checkAndNotifyStable()  «Checks simulation alpha and triggers stability callbacks if below threshold»
        setProfileButtonImage()  «Set profile button image and ARIA attributes»
        calculateParentTargetX()  «Calculate target X positions for parent nodes in each layer»
        getBandY(d)  «Calculate target Y position based on layer and node type»
        getNodeTargetX(d)  «Calculate target X position (parent X or inherited parent X)»
        createSvg()  «Create SVG container and main group element»
        isConnected(a, b)  «Check if two nodes are connected by a link»
        initializeForces()  «Initialize D3 force simulation»
        getNodeRadius(d)  «Get node radius based on type»
        createVisualElements()  «Create SVG elements (links, nodes, circles, text) using CSS classes for color»
        applyTextVisibilityRules()  «[REMOVED/SIMPLIFIED] Apply text visibility rules. Now primarily handled by CSS defaults and interaction classes.»
        setupNodeInteractions()  «Setup node interaction handlers (mouseover, mouseout, click, focus, blur, touch)»
        setupTooltip()  «Setup tooltip element selection»
        showTooltip(event, d)  «Show tooltip, applying CSS classes for indicator color»
        moveTooltip(event)  «Move tooltip with mouse»
        hideTooltip()  «Hide tooltip with fade out»
        setupMenuAndLegend()  «Setup menu panel, legend popup, and their interactions»
        updateLegendPopup()  «Update legend popup content dynamically using CSS classes»
        showNodeDetails(d)  «Show node details popup using CSS classes for styling»
        displayPopup(popupElement)  «Helper function to display a popup and manage focus»
        clearSelectedNodeState()  «Clear persistent node selection and restore the default graph emphasis state.»
        hideNodeDetails({ clearSelection = false } = {})  «Hide node details popup. Selection persists unless clearSelection is explicitly requested.»
        setupZoom()  «Setup zoom behavior»
        setupControlButtons(panelEl)  «Setup control button actions in the menu panel»
        downloadCalendar(scope)  «Download the current graph's task data as an ICS calendar file.»
        _extractCalendarTasks()  «Extract task-like objects from graph nodes for use with calendar export.»
        resetViewAndSearch()  «Reset graph view, zoom, clear search, and close popups»
        toggleGraphGuide()  «Toggle the graph types guide panel»
        populateGuidePanel()  «Populate the guide panel with graph structure information»
        focusOnNode(nodeId)  «Zoom and pan the graph to focus on a specific node»
        _openNodeDetails(d)  «Apply persistent node-selected state (same logic as handleShowDetails) without a triggering DOM event. Used by dep-link »
        openNodeModal(nodeId)  «Pan & zoom to a node by ID, then open its detail modal and keep it selected with a permanent blink. Used by dep-link but»
        ticked()  «Simulation tick function: Update node and link positions»
        dragHandler()  «Drag handler definition for nodes»
        bindGlobalEvents()  «Bind global event listeners (resize, escape key)»
        handleResize()  «Handle window resize event»
        createFeedbackElement(inputContainerElement)  «Create search feedback element if it doesn't exist»
        setupSearch(inputId)  «Setup search input functionality»

    function isEmbeddedMode()  «Detect whether the graph is running in embedded iframe mode.»
    function getInitialTemplateId()  «Resolve the initial template id from the URL, storage, or default registry entry.»
    function setSelectedTemplateId(templateId)  «Persist the currently selected template id for future visits.»

structure from public/graph-display/js/template-loader.js:
    [file-summary] Optional template-loader helpers for graph-display template registration.
    const CAREER_TEMPLATE_ID  «Optional template-loader helpers for graph-display template registration.»
    const TASK_MGMT_TEMPLATE_ID  «Built-in template id for the task-management/project graph template.»
    function tryRequireLocalTemplate(path)  «Try to synchronously require a local JSON payload in Node-based test environments.»
    function buildCareerTemplateFromData(id, name, data, convertFn)  «Build the graph-display career template shape from raw example JSON.»
    function buildTaskMgmtFromData(id, name, data, helpers)  «Build the task-management template shape from TaskDB example data.»
    function syncBuiltInTemplates(registry, convertFn, helpers = {})  «Register any locally available built-in templates into the provided registry.»

structure from public/graph-display/js/utils.js:
    [file-summary] public/graph-display/js/utils.js — web-github-task-manager
    function debounce(func, wait)  «Debounce function delays execution until after wait milliseconds have elapsed since the last time the debounced function»
    function getLuminance(hexColor)  «Calculates the relative luminance of a color.»
    function getContrast(hexColor1, hexColor2)  «Calculates the contrast ratio between two colors.»
    function getContrastingTextColorClass(backgroundHex, lightTextHex = '#f0f0f0', darkTextHex = '#333333')  «Determines whether light or dark text provides better contrast against a background color. Targets WCAG AA (4.5:1) for n»
    function generateColorTones(baseHex, count, step = 0.7, direction = 'brighter', fallbackHex = '#aabbc8')  «Generates an array of color tones (hex strings) starting from a base color. Uses d3.color for manipulation. Ensures vali»

structure from public/graph-display/js/walkthrough.js:
    [file-summary] Manages the interactive walkthrough/tour of the graph interface. Relies on CurriculumGraph instance for interactions.
    class Walkthrough  «Drive the guided walkthrough overlay and scripted graph interactions.»:
        constructor()  «Create a walkthrough controller bound to the overlay DOM elements.»
        setSteps(steps)  «Replace current walkthrough steps. Steps should be an array of step objects. Example step: { title, content, nodeId, tar»
        init()  «Initialize the overlay content and bind its event handlers.»
        setGraph(graphInstance)  «Attach the active graph instance used for focus and popup simulation.»
        bindEvents()  «Bind overlay, keyboard, and resize events for the active walkthrough.»
        handleNext()  «Advance from the current step, clearing any pending step simulations.»
        start()  «Start the walkthrough unless it has been skipped or previously completed.»
        startTour()  «Move from the welcome step into the first guided graph step.»
        nextStep()  «Advance to the next configured walkthrough step or finish the tour.»
        executeStepActions()  «Execute the current step's focus, highlight, hover, click, and search actions.»
        updateTooltipContent()  «Render the tooltip content for the current walkthrough step.»
        positionTooltip()  «Position the walkthrough tooltip relative to the current target element.»
        simulateNodeHover(nodeElement)  «Simulate a hover interaction on a graph node for the current step.»
        _createCursor(targetElement)  «Create the temporary walkthrough cursor anchored to a target element.»
        _removeCursor()  «Remove the temporary walkthrough cursor, if present.»
        simulateNodeClick(nodeElement)  «Simulate clicking a node so its detail popup opens during a tour step.»
        simulateSearch(searchTerm)  «Simulate typing into the graph search input for demonstration steps.»
        ensureNodeTextVisibility(nodeElement)  «Ensure a node's label remains visible while the walkthrough focuses it.»
        end()  «End the walkthrough, clear UI state, and persist the completion flag.»


structure from public/graph-display/js/shared/link-types.js:
    [file-summary] Shared link-type definitions and helpers.
    const COMMON_LINK_TYPES  «Shared link-type definitions and helpers.»
    const TASK_LINK_TYPES  «Task-management specific link types layered on top of the shared graph set.»
    const TEMPLATE_LINK_TYPES  «Useful for UIs (legend/debug): shared + template-specific types.»
    function isDependsLinkType(type)  «Check whether a link type encodes a dependency edge in the task template.»
    function isSubcategoryLinkType(type)  «Check whether a link type represents an in-layer subcategory relationship.»
    function isStrongCohesionLinkType(type)  «Identify link types that should render with the stronger cohesion force.»
    function isLayerSpacingLinkType(type)  «Identify link types that should use the wider layer-spacing distance.»
    function getForceLinkDistance(linkType, forcesCfg)  «Returns the link distance to use for a link type. Mirrors existing behavior in main-graph.js, but centralized.»
    function getForceLinkStrength(linkType)  «Returns the link force strength to use for a link type. Mirrors existing behavior in main-graph.js, but centralized.»

structure from public/graph-display/js/shared/tours.js:
    [file-summary] Generates/returns walkthrough steps for different templates. - If a template provides `meta.walkthroughSteps` (array), use that. - Otherwise generate sensible steps from nodes/details for known templa
    function getStepsForTemplate(templateId, nodes = [], details = {}, meta = {})  «Generates/returns walkthrough steps for different templates. - If a template provides `meta.walkthroughSteps` (array), u»
    function resolveTourUrl(path, basePath)  «Resolve a walkthrough JSON path relative to the graph app base path.»
    function resolveStepsForTemplate(templateId, nodes = [], details = {}, meta = {}, basePath = './')  «Resolve steps for a template. Priority: 1) meta.walkthroughSteps (inline) 2) meta.walkthroughStepsPath (JSON file) 3) Ge»

structure from public/health/README.md:
    [file-summary] Health Diagnostics App
    [heading-1] # Health Diagnostics App
    [heading-2] ## Structure

structure from public/health/index.html:
    [file-summary] GitHub Task Manager - Health Check
    [title] <title>GitHub Task Manager - Health Check</title>
    [section] <main id="health-shell">
    [section] <section id="health-card">
    [section] <header id="health-header">
    [heading-1] <h1>GitHub Task Manager</h1>
    [section] <section id="health-panel">
    [heading-2] <h2>Project</h2>
    [section] <section id="health-panel">
    [heading-2] <h2>Route Map</h2>
    [section] <section id="health-panel">
    [heading-2] <h2>TaskDB</h2>
    [section] <section id="health-panel">
    [heading-2] <h2>Module Layout</h2>
    [section] <section id="health-runtime">
    [section] <nav id="health-actions">
    [section] <footer id="health-footer">

structure from public/health/css/health.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/health/css/health.css — web github task manager * ──────────────────────────────────────────────────────────────
    [css-variable] --health-bg
    [css-variable] --health-surface
    [css-variable] --health-border
    [css-variable] --health-shadow
    [css-variable] --health-text
    [css-variable] --health-muted
    [css-variable] --health-accent
    [css-variable] --health-accent-strong
    [css-variable] --health-success
    [css-variable] --health-link
    [selector] .health-shell
    [selector] .health-card
    [selector] .health-header
    [selector] .health-title-group h1
    [selector] .health-title-group p
    [selector] .health-pill
    [selector] .health-pill::before
    [selector] .health-grid
    [selector] .health-panel
    [selector] .health-panel h2
    [selector] .health-panel li
    [selector] .health-panel ul
    [selector] .health-panel code
    [selector] .health-runtime
    [selector] .health-runtime strong
    [selector] .health-runtime p
    [selector] .health-actions
    [selector] .health-actions a
    [selector] .health-actions a:hover
    [selector] .health-actions .primary-link
    [selector] .health-actions .secondary-link
    [selector] .health-footer
    [selector] .health-footer p
    [selector] .health-link

structure from public/health/js/runtime-health-checker.js:
    [file-summary] Lightweight runtime diagnostics for the standalone health page.

structure from public/list-display/README.md:
    [file-summary] List Display App
    [heading-1] # List Display App
    [heading-2] ## Structure
    [heading-2] ## Notes

structure from public/list-display/index.html:
    [file-summary] GitHub Task Manager
    [title] <title>GitHub Task Manager</title>
    [heading-1] <h1>📋 GitHub Task Manager</h1>
    [section] <section id="user-section">
    [section] <section id="controls">
    [section] <section id="stats">
    [heading-3] <h3>Total Tasks</h3>
    [heading-3] <h3>Not Started</h3>
    [heading-3] <h3>In Progress</h3>
    [heading-3] <h3>Done</h3>
    [section] <section id="tasks-section">
    [heading-2] <h2>Root Project</h2>
    [heading-2] <h2>Add New Task</h2>
    [heading-3] <h3>Automatic Fields</h3>
    [heading-2] <h2>🔐 Access Required</h2>
    [heading-2] <h2>🐙 Connect to GitHub</h2>
    [heading-2] <h2>🐙 GitHub Issues Sync</h2>
    [heading-2] <h2>🕘 Change History</h2>

structure from public/list-display/css/README.md:
    [file-summary] List Display Engine - CSS
    [heading-1] # List Display Engine - CSS
    [heading-2] ## Files
    [heading-2] ## Current wiring

structure from public/list-display/css/task-manager.css:
    [file-summary] ══════════════════════════════════════════════════════════════════════════════ * public/list display/css/task manager.css — web github task manager * ──────────────────────────────────────────────────
    [section] /* GitHub Theme Colors */
    [css-variable] --primary-color
    [css-variable] --primary-hover
    [css-variable] --secondary-color
    [css-variable] --danger-color
    [css-variable] --warning-color
    [css-variable] --info-color
    [css-variable] --background
    [css-variable] --surface
    [css-variable] --surface-hover
    [css-variable] --border
    [css-variable] --text-primary
    [css-variable] --text-secondary
    [css-variable] --shadow
    [css-variable] --project-accent
    [css-variable] --project-accent-strong
    [css-variable] --project-accent-soft
    [css-variable] --project-accent-border
    [section] /* Module nav adapts to the dark list-page container */
    [css-variable] --module-nav-bg
    [css-variable] --module-nav-text
    [css-variable] --module-nav-muted
    [css-variable] --module-nav-border
    [css-variable] --module-nav-hover
    [css-variable] --module-nav-active-bg
    [css-variable] --module-nav-active-border
    [css-variable] --module-nav-shadow
    [section] /* Touch & Spacing Variables (Adapted from Graph Display) */
    [css-variable] --touch-target-min
    [css-variable] --spacing-xs
    [css-variable] --spacing-sm
    [css-variable] --spacing-md
    [css-variable] --spacing-lg
    [css-variable] --spacing-xl
    [css-variable] --radius-sm
    [css-variable] --radius-md
    [css-variable] --radius-lg
    [css-variable] --font-size-base
    [css-variable] --font-size-sm
    [css-variable] --transition-base
    [section] /* Base Reset & Typography */
    [section] /* Skip Navigation Link (accessibility) */
    [selector] .skip-link
    [selector] .skip-link:focus
    [section] /* Prevent horizontal scroll on mobile */
    [section] /* Touch Targets & Interactive Elements */
    [selector] .close
    [section] /* Disable double-tap zoom */
    [selector] select
    [selector] button
    [selector] button.disabled
    [section] /* Button Variants */
    [selector] .btn-primary
    [selector] .btn-primary:hover
    [selector] .btn-secondary
    [selector] .btn-secondary:hover
    [selector] .btn-danger
    [selector] .btn-danger:hover
    [selector] .btn-success
    [selector] .btn-success:hover
    [section] /* Layout & Container */
    [selector] .container
    [selector] header
    [selector] header h1
    [selector] .header-subtitle
    [section] /* Auth & User Sections */
    [selector] .auth-section
    [selector] .auth-form
    [selector] .auth-form input
    [selector] .auth-status
    [selector] .auth-status span
    [selector] .folder-project-trigger
    [selector] .folder-project-result
    [selector] .folder-project-result[data-status="success"]
    [selector] .folder-project-result[data-status="error"]
    [selector] .project-select-label
    [selector] .project-select
    [selector] .user-section
    [selector] .user-info
    [selector] .user-info label
    [selector] .user-info input
    [selector] .user-info small
    [selector] .login-message
    [selector] .login-message p
    [section] /* Controls & Filters */
    [selector] .controls
    [selector] .filter-section
    [selector] .filter-section select
    [section] /* Stats Grid */
    [selector] .stats
    [selector] .stat-card
    [selector] .stat-card[data-status]:hover
    [selector] .stat-card[data-status]:focus
    [selector] .stat-card.active
    [selector] .stat-card h3
    [selector] .stat-card p
    [section] /* Tasks List & Cards */
    [selector] .tasks-section
    [selector] .project-navigation-shell
    [selector] .project-navigation-bar
    [selector] .project-navigation-copy
    [selector] .project-navigation-actions
    [selector] .project-navigation-actions .btn-secondary
    [selector] .project-navigation-actions .btn-secondary:hover:not(:disabled)
    [selector] .project-context-eyebrow
    [selector] .project-context-title
    [selector] .project-context-description
    [selector] .project-context-flow
    [selector] .project-context-chip-row
    [selector] .project-context-grid
    [selector] .project-context-section
    [selector] .project-context-section h3
    [selector] .project-context-chip
    [selector] .project-context-chip.meta-chip
    [selector] .project-context-chip.path-chip
    [selector] .project-context-chip.flow-start
    [selector] .project-context-chip.flow-end
    [selector] .project-context-chip.relation-chip
    [selector] .project-context-chip.relation-chip.output
    [selector] .project-context-chip.muted
    [selector] .project-context-note
    [selector] .project-navigation-panel
    [selector] .project-modules-toolbar
    [selector] .project-modules-root
    [selector] .project-modules-leaf.active
    [selector] .project-modules-tree
    [selector] .project-modules-folder
    [selector] .project-modules-summary
    [selector] .project-modules-summary::-webkit-details-marker
    [selector] .project-modules-folder-icon
    [selector] .project-modules-children
    [selector] .project-modules-leaf
    [selector] .project-modules-summary:hover
    [selector] .project-modules-label
    [selector] .project-modules-badge
    [selector] .tasks-list
    [selector] .task-card
    [selector] .task-card:hover
    [section] /* Task Card Visual States */
    [selector] .task-card.status-done
    [selector] .task-card.status-in-progress
    [selector] .task-header
    [selector] .task-title
    [selector] .task-meta
    [selector] .badge
    [section] /* Badge Colors */
    [selector] .badge-status-todo
    [selector] .badge-status-in-progress
    [selector] .badge-status-done
    [selector] .badge-status-blocked
    [selector] .badge-status-pending-review
    [selector] .badge-status-on-hold
    [selector] .badge-status-cancelled
    [selector] .badge-priority-low
    [selector] .badge-priority-medium
    [selector] .badge-priority-high
    [selector] .badge-priority-critical
    [selector] .badge-flow-start
    [selector] .badge-flow-end
    [selector] .badge-module-link
    [selector] .task-description
    [selector] .task-footer
    [selector] .task-info
    [selector] .task-tags
    [selector] .tag
    [selector] .task-actions
    [selector] .task-card.readonly
    [section] /* ===== Read-only dependency links (in task detail modal) ===== */
    [selector] .readonly-dep-links
    [selector] .readonly-dep-links > label
    [selector] .dep-links-list
    [selector] .dep-link-btn
    [selector] .dep-link-btn:hover
    [selector] .dep-type-badge
    [selector] .task-readonly-note
    [selector] .task-actions button
    [section] /* Smaller buttons allowed inside cards */
    [selector] .empty-state
    [section] /* Template & Validation */
    [selector] .template-section
    [selector] .template-actions
    [selector] .template-info
    [selector] .template-info h4
    [selector] .template-info p
    [selector] .validation-messages
    [selector] .validation-error
    [selector] .validation-warning
    [selector] .validation-success
    [section] /* Modals & Overlays */
    [selector] .modal
    [selector] .modal-content
    [section] /* Larger touch target */
    [selector] .close:hover
    [selector] .form-group
    [selector] .form-group label
    [selector] .form-group select
    [section] /* Prevent zoom on iOS */
    [selector] .form-group textarea
    [selector] .form-row
    [selector] .form-actions
    [section] /* Automation Indicators */
    [selector] .automation-indicator
    [selector] .required-field::after
    [selector] .automatic-fields-section
    [selector] .automatic-fields-section h3
    [selector] .automatic-fields-grid
    [selector] .readonly-field
    [section] /* Loading Overlay */
    [selector] .loading-overlay
    [selector] .spinner
    [selector] .loading-overlay p
    [section] /* Toast */
    [selector] .toast
    [selector] .toast.success
    [selector] .toast.error
    [selector] .toast.warning
    [section] /* Calendar Download Dropdown                                   */
    [selector] .calendar-dropdown
    [selector] .calendar-dropdown > summary
    [selector] .calendar-dropdown > summary::-webkit-details-marker
    [selector] .calendar-dropdown-menu
    [selector] .calendar-dropdown-menu button
    [selector] .calendar-dropdown-section
    [selector] .calendar-dropdown-section label
    [selector] .calendar-format-select
    [selector] .calendar-dropdown-menu button:hover
    [selector] .calendar-dropdown-divider
    [section] /* Animations */
    [section] /* Password Modal */
    [selector] #passwordModal .modal-content
    [selector] #passwordModal h2
    [selector] #passwordModal p
    [selector] .password-form
    [selector] .password-form input[type="password"]
    [selector] .password-form input[type="password"]:focus
    [selector] .password-buttons
    [selector] .password-buttons button
    [selector] #passwordError
    [section] /* Auth Status Indicator */
    [selector] .auth-indicator
    [selector] .auth-indicator.locked
    [selector] .auth-indicator.locked:hover
    [selector] .auth-indicator.unlocked
    [selector] .auth-indicator.unlocked:hover
    [section] /* View Toggle */
    [selector] .view-toggle
    [selector] .view-toggle .btn-secondary.active
    [section] /* Timeline View */
    [selector] .timeline-view
    [selector] .timeline-header
    [selector] .timeline-header h3
    [selector] .timeline-header .timeline-actions
    [selector] .timeline-scroll
    [selector] .timeline-grid
    [selector] .timeline-row
    [selector] .timeline-row:hover
    [selector] .timeline-task
    [selector] .timeline-task .task-name
    [selector] .timeline-task .task-sub
    [selector] .timeline-track
    [selector] .timeline-bar
    [selector] .timeline-bar.status-not-started
    [selector] .timeline-bar.status-in-progress
    [selector] .timeline-bar.status-on-hold
    [selector] .timeline-bar.status-blocked
    [selector] .timeline-bar.status-done
    [selector] .timeline-bar.status-cancelled
    [selector] .timeline-bar.status-pending-review
    [selector] .timeline-bar.critical
    [section] /* Issues Sync */
    [selector] .issues-toolbar
    [selector] .issues-list
    [selector] .issues-item
    [selector] .issues-item:last-child
    [selector] .issues-item .issue-title a
    [selector] .issues-item .issue-title a:hover
    [selector] .issues-item .issue-meta
    [section] /* History */
    [selector] .history-list
    [selector] .history-item
    [selector] .history-item:last-child
    [selector] .history-item summary
    [selector] .history-title
    [selector] .history-meta
    [selector] .history-changes
    [selector] .graph-view
    [selector] .graph-frame
    [selector] .graph-view.fullscreen
    [selector] .graph-view.fullscreen .graph-frame
    [section] /* Prevent background scrolling when graph fullscreen is active */
    [section] /* Mobile Responsive Overrides */
    [section] /* Modal Full Screen on Mobile */
    [section] /* Timeline adjustments */
    [section] /* Shrink name col */
    [section] /* Hide subtitle to save space */

structure from public/list-display/js/README.md:
    [file-summary] List Display Engine - JS Module Reference
    [heading-1] # List Display Engine - JS Module Reference
    [heading-2] ## Notes

structure from public/list-display/js/list-display-controller.js:
    [file-summary] List-display runtime controller for the GitHub Task Manager app.
    class TaskManagerApp  «Coordinate the list-display UI, project context, and persistence services.»:
        constructor()  «Create the runtime controller state for this component.»
        getGraphTemplateIdForActiveProject()  «Get graph template id for active project.»
        getStoredFolderProjects()  «Get stored folder projects.»
        registerFolderProjectOption(projectRecord)  «Register folder project option.»
        initializeFolderProjectPicker()  «Initialize folder project picker.»
        buildGraphIframeSrc()  «Build graph iframe src.»
        async ensureGraphIframeLoaded()  «Ensure graph iframe loaded.»
        async initialize()  «Initialize initialize.»
        loadConfig()  «Load config.»
        setupProjectSelector()  «Set up project selector.»
        async setActiveProject(projectId)  «Set active project.»
        normalizeModulePath(value)  «Normalize module path.»
        normalizeModuleEntry(moduleEntry)  «Normalize module entry.»
        getTaskKey(task)  «Get task key.»
        getTaskCode(task)  «Get task code.»
        getTaskPredecessorKeys(task)  «Get task predecessor keys.»
        buildTaskFlowSummary(tasks = [])  «Build task flow summary.»
        applyProjectTheme()  «Apply project theme.»
        updateTaskAuthoringAvailability()  «Update task authoring availability.»
        syncProjectContextFromDatabase()  «Sync project context from database.»
        getModuleByPath(modulePath)  «Get module by path.»
        getModuleByName(moduleName)  «Get module by name.»
        getContextBaseTasks()  «Get context base tasks.»
        filterTaskCollection(tasks, { status = null, priority = null } = {})  «Filter task collection.»
        resolveTaskModulePath(task)  «Resolve task module path.»
        supportsTaskEditing(task)  «Check whether task editing.»
        formatDisplayDate(value)  «Format display date.»
        encodeModulePath(modulePath)  «Encode module path.»
        getModuleFetchCandidates(projectId, modulePath)  «Get module fetch candidates.»
        async fetchModuleData(modulePath)  «Fetch module data.»
        buildModuleContextTasks(moduleEntry, moduleData, modulePath = '')  «Build module context tasks.»
        getActiveModuleLabel()  «Get active module label.»
        syncGraphModuleState()  «Sync graph module state.»
        async setActiveModule(modulePath, options = {})  «Set active module.»
        async restoreCurrentContext(options = {})  «Restore current context.»
        openModuleView(encodedModulePath)  «Open module view.»
        openModuleRelation(encodedModuleName)  «Open module relation.»
        clearModuleView()  «Clear module view.»
        toggleProjectNavigationPanel()  «Toggle project navigation panel.»
        renderProjectNavigation()  «Render project navigation.»
        getAvailableCategoryNames()  «Get available category names.»
        refreshCategoryOptions({ preserveValue = true } = {})  «Refresh category options.»
        getProjectAuthKey(projectId)  «Get project auth key.»
        getProjectPasswordKey(projectId)  «Get project password key.»
        loadUserName()  «Load user name.»
        saveUserName(name)  «Save user name.»
        getAccessConfig()  «Get access config.»
        isGitHubPagesHost()  «Check whether git hub pages host.»
        getQueryParam(name)  «Get query param.»
        isLocalHost()  «Check whether local host.»
        isPasswordProtectionEnabled()  «Check whether password protection enabled.»
        isPasswordProtected()  «Check whether password protected.»
        checkAuth()  «Check auth.»
        requireAuth(action, ...args)  «Require auth.»
        showPasswordModal()  «Show password modal.»
        closePasswordModal()  «Close password modal.»
        async verifyPassword(event)  «Verify password.»
        logout()  «Logout.»
        getGitHubOAuthToken()  «Get git hub oauth token.»
        setGitHubOAuthToken(token, user = '')  «Set git hub oauth token.»
        clearGitHubOAuthToken()  «Clear git hub oauth token.»
        isGitHubConnected()  «Check whether git hub connected.»
        showGitHubLoginModal()  «Show git hub login modal.»
        closeGitHubLoginModal()  «Close git hub login modal.»
        async startGitHubDeviceFlow()  «Start git hub device flow.»
        showManualOAuthInstructions()  «Show manual oauth instructions.»
        showGitHubLoginError(message)  «Show git hub login error.»
        copyDeviceCode()  «Copy device code.»
        updateAccessIndicator()  «Update access indicator.»
        toggleAuthIndicator()  «Toggle auth indicator.»
        isConfigured()  «Check whether configured.»
        showConfigError()  «Show config error.»
        async showTaskManager()  «Show task manager.»
        async loadTasks()  «Load tasks.»
        async saveTasks()  «Save tasks.»
        openHistoryModal()  «Open history modal.»
        closeHistoryModal()  «Close history modal.»
        setHistoryStatus(message, type = 'info')  «Set history status.»
        getWorkerUrl()  «Get worker url.»
        getRawHistoryUrl(projectId)  «Get raw history url.»
        applyHistoryFilter()  «Apply history filter.»
        async refreshHistory()  «Refresh history.»
        async loadHistoryItems({ projectId, taskId = '', limit = 200 })  «Load history items.»
        renderHistory(items)  «Render history.»
        renderTasks()  «Render tasks.»
        setViewMode(mode)  «Set view mode.»
        updateViewToggle()  «Update view toggle.»
        setTimelineScale(scale)  «Set timeline scale.»
        parseDate(dateStr)  «Parse date.»
        daysBetween(a, b)  «Calculate the number of days between two dates.»
        formatShortDate(d)  «Format short date.»
        renderTimeline()  «Render timeline.»
        openIssuesSyncModal()  «Open issues sync modal.»
        _openIssuesSyncModal()  «Open issues sync modal.»
        closeIssuesSyncModal()  «Close issues sync modal.»
        setIssuesSyncStatus(message, type = 'info')  «Set issues sync status.»
        async loadIssuesForSync()  «Load issues for sync.»
        renderIssuesList()  «Render issues list.»
        isIssueAlreadyImported(issueNumber)  «Check whether issue already imported.»
        async importSelectedIssues()  «Import selected issues.»
        _importSelectedIssues()  «Import selected issues.»
        async _importSelectedIssuesAsync()  «Import selected issues async.»
        getLinkedIssue(task)  «Get linked issue.»
        createIssueForTask(taskId)  «Create issue for task.»
        async _createIssueForTask(taskId)  «Create issue for task.»
        updateStats(taskSource = null)  «Update stats.»
        setActiveStatCard(statusValue)  «Set active stat card.»
        setupStatCardFilters()  «Set up stat card filters.»
        filterTasks()  «Filter tasks.»
        showAddTaskModal()  «Show add task modal.»
        _showAddTaskModal()  «Show add task modal.»
        editTask(taskId)  «Edit task.»
        openTaskDetail(taskIndex)  «Open the detail view for a task by its rendered index.»
        _openReadOnlyTask(task)  «Open read only task.»
        _injectReadOnlyDepLinks(task)  «In read-only task detail: hide the deps textarea and show clickable dep-link buttons. Each button navigates to the prede»
        navigateToDependency(predecessorId)  «Close the current modal and open the task detail for the specified predecessor task ID. Works across root tasks and the »
        _editTask(taskId)  «Edit task.»
        setTaskModalReadOnly(readOnly = false)  «Set task modal read only.»
        populateFormWithDefaults()  «Populate form with defaults.»
        populateFormWithTask(task)  «Populate form with task.»
        closeModal()  «Close modal.»
        async saveTask(event)  «Save task.»
        getFormData()  «Collect the current task form values into a task payload.»
        parseAssignedWorkers(input)  «Parse assigned worker input into structured worker records.»
        parseDependencies(input)  «Parse dependency input into structured dependency records.»
        parseParentTaskId(value)  «Parse the parent task id from form input.»
        async deleteTask(taskId)  «Delete task.»
        async _deleteTask(taskId)  «Delete task.»
        updateTemplateUI()  «Update template ui.»
        async importTemplate(templateType)  «Import template.»
        exportToCSV()  «Export to csv.»
        getDownloadFormat()  «Get download format.»
        getDownloadTasksByScope(scope, workerName = '')  «Get download tasks by scope.»
        downloadBlob(content, mimeType, filename)  «Download blob.»
        downloadTasksFile(tasks, format, fileBase)  «Download tasks file.»
        downloadCalendar(scope)  «Download the current project's tasks in the selected format.»
        downloadCalendarWorkers()  «Download one file per worker found in the current project's tasks.»
        showValidationMessages(errors, warnings)  «Show validation messages.»
        clearValidationMessages()  «Clear validation messages.»
        escapeHtml(text)  «Escape HTML text for safe rendering.»
        showLoading()  «Show loading.»
        hideLoading()  «Hide loading.»
        showToast(message, type = 'success')  «Show toast.»
        setupEventListeners()  «Set up the main UI event listeners.»

    class GitHubAPI  «Minimal GitHub REST wrapper for file and issue operations used by the UI.»:
        constructor(config)  «Create the runtime controller state for this component.»
        async request(endpoint, method = 'GET', body = null)  «Send a GitHub API request with the configured authentication.»
        async getFileContent(path)  «Get file content from the configured GitHub repository.»
        async updateFile(path, content, message, sha = null)  «Update a file in the configured GitHub repository.»
        async listIssues(state = 'open')  «List GitHub issues for the configured repository.»
        async createIssue(title, body, labels = [])  «Create a GitHub issue for the configured repository.»

    function showAddTaskModal()  «Show add task modal.»
    function closeModal()  «Close modal.»
    function exportToCSV()  «Export to csv.»
    function loadTasks()  «Load tasks.»
    function closePasswordModal()  «Close password modal.»
    function verifyPassword(event)  «Verify password.»

structure from public/local-folder/README.md:
    [file-summary] Local Folder Integration Module
    [heading-1] # Local Folder Integration Module
    [heading-2] ## Files

structure from public/local-folder/js/folder-picker-trigger.js:
    [file-summary] UI binding layer for launching the local-folder picker from browser surfaces.

structure from public/local-folder/js/local-folder-scanner.js:
    [file-summary] Browser-side local-folder scanner and TaskDB project registry.

structure from public/task-engine/js/task-field-automation.js:
    [file-summary] Task field automation rules for project and task authoring.
    class TemplateAutomation  «Populate and repair task/project fields using TEMPLATE_CONFIG defaults.»:
        constructor(config = TEMPLATE_CONFIG, validator = new TemplateValidator())  «Create an automation helper with config-backed defaults and validation.»
        generateTaskId(existingTasks = [])  «Generate the next available numeric task id for a task collection.»
        autoPopulateTask(task, template = null, creatorId = null)  «Fill task defaults, normalize values, and derive missing metadata.»
        autoPopulateProject(project)  «Fill project-level defaults and normalize configured fields.»
        createTaskFromTemplate(templateTask, template, customizations = {})  «Create a task from a template record and apply automation defaults.»
        autoGenerateDependencies(tasks)  «Suggest finish-to-start dependencies by comparing task date ranges.»
        suggestAssignments(task, workers)  «Rank workers whose skills best match the task tags.»
        calculateSkillMatch(taskTags, workerSkills)  «Calculate a simple overlap score between task tags and worker skills.»
        autoCategorize(task, categories)  «Suggest a category name using keyword matches from the task content.»
        validateAndFix(task, template = null)  «Repair common task issues and return the fixes that were applied.»
        generateProjectSummary(template)  «Build a derived summary block from the current template task list.»


structure from public/task-engine/js/task-schema-validator.js:
    [file-summary] TaskDB schema validation rules for tasks, projects, workers, and templates.
    class TemplateValidator  «Validate TaskDB payloads against the configured template schema.»:
        constructor(config = TEMPLATE_CONFIG)  «Create a validator bound to the active TaskDB template configuration.»
        validate(data, type = 'task')  «Validate a project, task, or template payload by logical type.»
        validateTemplate(template)  «Validate a full TaskDB template document including tasks and related records.»
        validateProject(project)  «Validate project-level metadata and nested planning records.»
        validateTask(task, template = null)  «Validate an individual task record and its embedded substructures.»
        validateCategories(categories)  «Validate category definitions and parent-category references.»
        validateWorkers(workers)  «Validate worker records used by assignments and project staffing.»
        validateDependencies(tasks)  «Validate cross-task dependency references across the full task list.»
        isValidDate(dateString)  «Check whether a string matches the configured TaskDB date format.»
        isValidEmail(email)  «Check whether a string matches the configured email pattern.»
        normalizeStatus(status)  «Normalize a free-form status value to the canonical TaskDB enum when possible.»


structure from public/task-engine/js/task-storage-sync.js:
    [file-summary] Task storage and synchronization layer for TaskDB projects.
    class TaskDatabase  «Manage the active project's tasks, metadata, persistence, and exports.»:
        constructor(githubApi, validator = new TemplateValidator(), automation = new TemplateAutomation())  «Create a task database bound to GitHub, validation, and automation services.»
        resetLoadedMetadata()  «Reset metadata captured from the last loaded project payload.»
        applyLoadedPayload(data)  «Apply a loaded project payload and extract its task list and metadata.»
        cloneTasksSnapshot(tasks)  «Clone a task list snapshot for later history diffing.»
        getHistoryTaskKey(task)  «Resolve the canonical task key used by history diffing.»
        summarizeHistoryChanges(changes)  «Summarize changed fields for compact history event messages.»
        diffTasksForHistory(beforeTasks, afterTasks)  «Diff two task snapshots into create, update, and delete history events.»
        async appendHistoryNdjsonViaWorkerFallback({ projectId, workerUrl, accessPassword, tasksFile, message, actor, commitSha, beforeTasks, afterTasks })  «Append history events through the worker when server-side history writes are unavailable.»
        resolveActor()  «Resolve the actor name used for saves and task history.»
        isLocalDevHost()  «Detect whether the app is running on a local development host.»
        buildFullData(tasks = this.tasks)  «Build the full persisted TaskDB payload for the current task collection.»
        generateStateFiles(tasks = this.tasks)  «Generate state summary files grouped by task status.»
        async saveTasksLocalDisk(message = 'Update tasks')  «Persist the current project through the local disk development API.»
        async initialize()  «Load tasks and templates needed to initialize the active project database.»
        async loadTasks()  «Load tasks from the best available source for the active project context.»
        getDuplicateTaskIds(tasks = this.tasks)  «Collect duplicate numeric task ids from the current task list.»
        escapeCsvValue(value)  «Escape a scalar value for persisted CSV output.»
        generatePersistedCSV(tasks = this.tasks)  «Generate the repo-side persisted CSV companion for the active task list.»
        saveTasksLocal(message = 'Update tasks')  «Persist the current task payload into browser localStorage as a fallback copy.»
        async saveTasks(message = 'Update tasks')  «Persist the current task set using the best available configured backend.»
        async saveTasksViaWorker(message, workerUrl)  «Persist tasks through the Cloudflare worker and keep derived files in sync.»
        getSessionAccessPassword()  «Read the current session's cached access password for the active project.»
        async saveTasksDirectGitHub(message)  «Persist tasks directly through the GitHub API when browser tokens are enabled.»
        async loadTemplates()  «Load available project templates from the configured template sources.»
        async importFromTemplate(template, options = {})  «Import tasks from a validated template into the current project.»
        exportToCSV(tasks = null)  «Export the provided tasks, or the active task list, as CSV text.»
        importFromCSV(csvContent, options = {})  «Import tasks from CSV text and merge or replace the current task list.»
        parseCSVLine(line)  «Parse a CSV line while preserving quoted commas and escaped quotes.»
        createTask(taskData, creatorId = null)  «Create a validated task and append it to the active task list.»
        updateTask(taskId, updates)  «Update an existing task with validated changes while preserving its id.»
        deleteTask(taskId)  «Delete a task from the active task list by id.»
        getTask(taskId)  «Retrieve a single task by id from the active task list.»
        getTasks(filters = {})  «Filter the current task list by status, priority, category, assignee, or text.»
        getStatistics()  «Compute aggregate statistics for the current task collection.»

    function inferProjectIdFromTasksFile(tasksFile)  «Infer a project id from a configured TaskDB tasks file path.»
    function resolveTemplateConfig()  «Resolve the shared template configuration object from browser or test globals.»
    function hasValidGitHubToken()  «Determine whether a usable GitHub token is configured for direct saves.»
    function resolveActiveProjectId()  «Resolve the active project id from config hints or the configured tasks file path.»
    function getProjectScopedStorageKey()  «Build the localStorage key scoped to the currently active project.»

structure from public/tasksDB/README.md:
    [file-summary] TasksDB — Project Graph Data Format
    [heading-1] # TasksDB — Project Graph Data Format
    [heading-2] ## Directory Layout
    [heading-2] ## `tasks.json` Format
    [heading-3] ### `project` object
    [heading-3] ### `categories` array
    [heading-3] ### `workers` array
    [heading-3] ### `tasks` array
    [heading-4] #### `dependencies` format
    [heading-4] #### String-name format (project_task_template)
    [heading-3] ### `navigation` object
    [heading-2] ## `registry.json`
    [heading-2] ## Graph Layers (Topological Depth)
    [heading-2] ## Companion Files
    [heading-2] ## Adding a New Project

structure from public/tasksDB/registry.json:
    [json-array] [5 items]

structure from public/tasksDB/_examples/career/data.json:
    [json-key] rawNodes: [4 items]
    [json-key] rawRelationships: [3 items]
    [json-key] details: {profile, education, experience, community-impact}
    [json-key] meta: {profileNodeId, coreNodeId, walkthroughEnabled, walkthroughStepsPath, showCvButton, +3 more}
    [json-key] configOverrides: {colorMode, sizeMode}

structure from public/tasksDB/_examples/career/tour.json:
    [json-array] [9 items]

structure from public/tasksDB/_examples/task-management/data.json:
    [json-key] project: {name, description}
    [json-key] tasks: [20 items]
    [json-key] meta: {legendMode, walkthroughEnabled, walkthroughStepsPath}
    [json-key] configOverrides: {colorMode, sizeMode, taskSizing}

structure from public/tasksDB/_examples/task-management/tour.json:
    [json-array] [7 items]

structure from public/tasksDB/_schema/graph-template.schema.json:
    [json-key] $schema: "http://json-schema.org/draft-07/schema#"
    [json-key] oneOf: [2 items]

structure from public/tasksDB/_templates/starter_project_template.csv:
    [csv-column] [col 1] task_id
    [csv-column] [col 2] task_name
    [csv-column] [col 3] description
    [csv-column] [col 4] start_date
    [csv-column] [col 5] end_date
    [csv-column] [col 6] priority
    [csv-column] [col 7] status
    [csv-column] [col 8] progress_percentage
    [csv-column] [col 9] estimated_hours
    [csv-column] [col 10] is_critical_path
    [csv-column] [col 11] tags
    [csv-column] [col 12] category_name
    [csv-column] [col 13] assigned_workers
    [csv-column] [col 14] dependencies
    [csv-column] [col 15] parent_task_id
    [csv-column] [col 16] creator_id
    [csv-column] [col 17] created_date
    [csv-column] [col 18] completed_date
    [csv-column] [col 19] comments
    [csv-column] [col 20] attachments

structure from public/tasksDB/_templates/starter_project_template.json:
    [file-summary] A professional project template for a new web application, focusing on clear dependencies, priority, and critical path tracking. This is a template; edit fields as needed.
    [json-key] template_type: "project_task_template"
    [json-key] version: "1.2"
    [json-key] description: "A professional project template for a new web application, f..."
    [json-key] project: {name, description, start_date, end_date, status, +1 more}
    [json-key] categories: [4 items]
    [json-key] workers: [2 items]
    [json-key] tasks: [7 items]
    [json-key] required_fields: [10 items]
    [json-key] optional_fields: [16 items]

structure from public/tasksDB/_templates/starter_project_template_v2.json:
    [file-summary] Agentic project task template for TaskManager. Designed for AI agent readability: flat, consistent, enum-validated, minimal redundancy.
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] template_type: "project_task_template"
    [json-key] version: "3.0"
    [json-key] description: "Agentic project task template for TaskManager. Designed for ..."
    [json-key] enums: {status, project_status, priority, complexity, dependency_type, +8 more}
    [json-key] project: {name, description, start_date, end_date, status, +13 more}
    [json-key] categories: [3 items]
    [json-key] workers: [2 items]
    [json-key] tasks: [2 items]
    [json-key] required_fields: [14 items]
    [json-key] optional_fields: [29 items]

structure from public/tasksDB/external/ai-career-roadmap/README.md:
    [file-summary] AI Career Roadmap (tasksDB)
    [heading-1] # AI Career Roadmap (tasksDB)
    [heading-2] ## Files
    [heading-2] ## Regenerating derived files

structure from public/tasksDB/external/ai-career-roadmap/node.tasks.json:
    [file-summary] Complete task breakdown for the Roadmap Integration on deeplearning.ai project, based on the web-integration-plan.md phases, roles, and sprint plan. Tasks are sorted by priority order (Critical first)
    [json-key] template_type: "project_task_template"
    [json-key] version: "1.2"
    [json-key] description: "Complete task breakdown for the Roadmap Integration on deepl..."
    [json-key] project: {name, description, start_date, end_date, status, +1 more}
    [json-key] categories: [5 items]
    [json-key] workers: [6 items]
    [json-key] tasks: [43 items]
    [json-key] required_fields: [10 items]
    [json-key] optional_fields: [16 items]

structure from public/tasksDB/external/ai-career-roadmap/tour/graph-tour.json:
    [json-array] [9 items]

structure from public/tasksDB/external/first-graph/node.tasks.json:
    [json-key] project: {name, description, owner, repo}
    [json-key] categories: [2 items]
    [json-key] workers: [1 items]
    [json-key] tasks: [12 items]
    [json-key] graphTemplate: {description, rawNodes, rawRelationships, details, meta, +1 more}

structure from public/tasksDB/external/first-graph/tour/graph-tour.json:
    [json-array] [15 items]

structure from public/tasksDB/external/github-task-manager/README.md:
    [file-summary] Task Database (tasksDB)
    [heading-1] # Task Database (tasksDB)
    [heading-2] ## Files
    [heading-3] ### node.tasks.json
    [heading-3] ### tasks.csv
    [heading-3] ### history/
    [heading-2] ## Data Synchronization
    [heading-2] ## Adding Tasks Through UI
    [heading-2] ## Manual Updates
    [heading-3] ### JSON
    [heading-3] ### CSV
    [heading-2] ## Schema Validation
    [heading-2] ## Backup & Recovery
    [heading-3] ### Temporary output artifacts
    [heading-2] ## Integration Points
    [heading-2] ## Best Practices
    [heading-2] ## Future Enhancements

structure from public/tasksDB/external/github-task-manager/node.tasks.json:
    [json-key] project: {name, description, start_date, end_date, status, +2 more}
    [json-key] categories: [19 items]
    [json-key] workers: [4 items]
    [json-key] tasks: [33 items]

structure from public/tasksDB/external/github-task-manager/tour/graph-tour.json:
    [json-array] [8 items]

structure from tests/playwright.config.js:
    [file-summary] tests/playwright.config.js — web-github-task-manager

structure from tests/run-tests.js:
    [file-summary] Test Runner for GitHub Task Manager Runs all component tests and reports results
    function main()  «Load the unit test files, execute the queued suites, and print a summary.»

structure from tests/e2e/crud-operations.spec.js:
    [file-summary] End-to-end coverage for CRUD, filtering, export, and statistics in list-display.
    const BASE_URL  «Base route for the list-display app under the local Playwright server.»
    const TIMEOUT  «Default timeout budget for waits in this CRUD regression suite.»
    function waitForAppReady(page)  «Wait until the list-display app has rendered either tasks or the empty state.»
    [describe] GitHub Task Manager - Create Task  «Validate task creation flows, defaults, and required-field handling.»
    [describe] GitHub Task Manager - Edit Task  «Validate editing flows for existing tasks and edit-modal regressions.»
    [describe] GitHub Task Manager - Delete Task  «Validate destructive task removal flows and confirmation handling.»
    [describe] GitHub Task Manager - Filter & Search  «Validate task filtering and search-related list narrowing behavior.»
    [describe] GitHub Task Manager - Refresh & Persistence  «Validate refresh behavior and state persistence across reload-style actions.»
    [describe] GitHub Task Manager - CSV Export  «Validate CSV export availability and basic download payload generation.»
    [describe] GitHub Task Manager - Statistics  «Validate the list-display statistics cards and count updates.»
    [describe] GitHub Task Manager - UI/UX  «Validate core UI affordances, visibility, and responsive behavior.»

structure from tests/e2e/graph-fullscreen.spec.js:
    [file-summary] End-to-end checks for graph fullscreen behavior launched from list-display.
    const BASE_URL  «Base route for the list-display app under the local Playwright server.»
    const TIMEOUT  «Default timeout budget for fullscreen flow assertions in this suite.»
    function waitForAppReady(page)  «Wait until the list-display app has rendered either tasks or the empty state.»
    [describe] Graph Fullscreen  «Validate entering and exiting fullscreen graph mode from list-display.»

structure from tests/e2e/live-multi-project-saves.spec.js:
    [file-summary] Live-site regression coverage for saving the correct project after project switches.
    const LIVE_URL  «Live-site URL used for GitHub Pages regression coverage.»
    const TIMEOUT  «Timeout budget for live-site navigation, unlock, and save flows.»
    const LIVE_PASSWORD_GITHUB_TASK_MANAGER  «Password for unlocking the github-task-manager live project during tests.»
    const LIVE_PASSWORD_AI_CAREER_ROADMAP  «Password for unlocking the ai-career-roadmap live project during tests.»
    const RUN_LIVE  «Feature flag that enables live-site Playwright coverage in opted-in environments.»
    function selectProjectAndWait(page, projectId, { expectTaskText, minTotalTasks, maxTotalTasks } = {})  «Switch to a project and wait until its task list characteristics are visible.»
    function waitForAppReady(page)  «Wait until the app has rendered either tasks or the empty-state placeholder.»
    function getWorkerUrl(page)  «Read the rendered Worker URL from the live-site diagnostics panel.»
    function getTasksFile(page)  «Read the active node.tasks.json path from the live-site diagnostics panel.»
    function getRepoInfo(page)  «Read the active repository identifier from the live-site diagnostics panel.»
    function unlockProject(page, password)  «Unlock the current password-protected project before save actions.»
    function createTestTask(page, taskName = 'Test Task ' + Math.random().toString(36).slice(2,8))  «Create a minimal test task through the live UI and return its generated name.»
    function editFirstTask(page, newName = 'Edited Task ' + Math.random().toString(36).slice(2,8))  «Edit the first visible task through the live UI and return the updated name.»
    function waitForSaveToast(page, expectedText, timeout = 10000)  «Wait for the save toast to appear, assert its text, and wait for dismissal.»
    [describe] @live Live Site - Multi-Project GitHub Saves  «Validate live-site save behavior across multiple password-protected projects.»

structure from tests/e2e/module-navigation.spec.js:
    [file-summary] End-to-end validation for synchronized module navigation between list and graph views.
    const TIMEOUT  «Timeout budget for synchronized list and graph navigation assertions.»
    function waitForAppReady(page)  «Wait until the list-display shell has finished loading project metadata.»
    [describe] module navigation sync  «Validate that module navigation stays synchronized across list and graph views.»

structure from tests/e2e/password-timeline-issues.spec.js:
    [file-summary] End-to-end regression coverage for password, timeline, and GitHub issue workflows.
    const BASE_URL  «Base route for local list-display password, timeline, and issues coverage.»
    const LIVE_URL  «Live GitHub Pages URL used by the opted-in regression suite.»
    const TIMEOUT  «Timeout budget for local and live feature regressions in this suite.»
    const LIVE_PASSWORD  «Default live-site password for the primary project under test.»
    const LIVE_PASSWORD_AI_CAREER_ROADMAP  «Live-site password for the ai-career-roadmap project switch regression.»
    const RUN_LIVE  «Feature flag that enables the live-site portion of this regression suite.»
    function waitForAppReady(page)  «Wait until the list-display app has rendered either tasks or the empty state.»
    [describe] New Features - Password / Timeline / Issues  «Validate local password-gate, timeline, and issue-sync behavior.»
    [describe] Live Site - Password Protection & New Features  «await route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(mockIssues) }); »

structure from tests/e2e/smoke.spec.js:
    [file-summary] Smoke tests: app boot and basic create task flow.
    const TIMEOUT  «Timeout budget for the fast smoke coverage path.»
    function waitForAppReady(page)  «Wait until the app shell, debug metadata, and loading overlay settle.»
    function unlockIfNeeded(page)  «Unlock the active project when password protection is enabled.»
    [describe] @smoke app boot + create task  «Validate that the app boots and can create a task in the local test environment.»

structure from tests/e2e/update-task-via-ui.spec.js:
    [file-summary] Playwright utility coverage for updating tasks through the UI instead of raw JSON edits.
    const BASE_URL  «Base route for the list-display app under the local Playwright server.»
    const TIMEOUT  «Timeout budget for task edit and save assertions in this suite.»
    function waitForAppReady(page)  «Wait for the app to be ready and all tasks loaded»
    function updateTaskViaUI(page, taskId, taskData)  «Update a task by task ID through the UI»
    function createTaskViaUI(page, taskData)  «Create a new task with specified data»
    [describe] Update Tasks Via UI Automation  «Validate reusable UI helpers for updating and creating tasks through the app.»

structure from tests/e2e/verify-commit-structure.spec.js:
    [file-summary] Live-site verification for TaskDB commit subjects and machine-readable payload structure.
    const LIVE_URL  «Live GitHub Pages URL used for commit-verification regressions.»
    const TIMEOUT  «Timeout budget for worker saves and GitHub commit propagation checks.»
    const RUN_LIVE  «Feature flag that enables the live-site commit verification suite.»
    const LIVE_PASSWORD_AI_CAREER_ROADMAP  «Password for unlocking the ai-career-roadmap live project during this suite.»
    function waitForSaveToast(page, expectedText, timeout = 15000)  «Wait for the save toast to appear, assert its text, and wait for dismissal.»
    function pollForCommitWithMessageContaining(page, repoOwner, repoName, needle, timeout = TIMEOUT)  «Poll the GitHub commits API until a commit message contains the requested marker.»
    function extractTaskDbCommitPayload(message)  «Extract the legacy TaskDB payload block from a commit message when present.»
    [describe] @live Verify commit subject + payload structure  «Validate live TaskDB commit subjects and payload structure after worker saves.»

structure from tests/e2e/visual-states.spec.js:
    [file-summary] Visual-state checks for list-display task status classes and styling hooks.
    [describe] Task Visual States  «Validate list and graph styling hooks for task status-driven visual states.»

structure from tests/graph-display/graph-display.spec.js:
    [file-summary] Graph-display interaction tests for modal navigation and persistent node selection.
    function parseTranslate(transform)  «Parse an SVG translate transform string into numeric x/y coordinates.»
    [describe] graph-display task-management template  «Validate graph-display rendering, navigation, and task-graph layout behavior.»

structure from tests/graph-display/inline-subtask-navigation.spec.js:
    [file-summary] Graph-display regression coverage for inline subtask drill-down behavior.
    function waitForNodeCount(page, minimum)  «Wait until the graph contains more than the requested number of nodes.»
    [describe] inline subtask navigation  «Validate inline task-subgraph drill-down and parent navigation behavior.»

structure from tests/graph-display/playwright.config.js:
    [file-summary] tests/graph-display/playwright.config.js — web-github-task-manager

structure from tests/graph-display/server.js:
    [file-summary] Minimal static server used by graph-display Playwright tests.
    function contentTypeFor(filePath)  «Resolve the response content type for a requested static asset path.»
    function safeJoin(root, requestPath)  «Safely resolve a request path under the configured root without traversal.»

structure from tests/graph-display/web-e2e-bussines-navigation.spec.js:
    [file-summary] Graph-display navigation coverage for the web-e2e-bussines project template.
    function waitForNodeCount(page, minimum)  «Wait until the graph contains more than the requested number of nodes.»
    [describe] web-e2e-bussines graph navigation  «Validate graph navigation and sidebar drilling for the web-e2e-bussines template.»

structure from tests/unit/generate-project-calendars.test.js:
    [file-summary] Unit coverage for TaskDB-to-calendar generation and project descriptor discovery.
    [describe] Calendar Parser  «Validate calendar state generation and descriptor discovery from TaskDB data.»

structure from tests/unit/graph-data.test.js:
    [file-summary] Basic sanity test for `public/graph-display/js/graph-data.js` to ensure it parses without syntax errors in the Node test environment.
    function loadGraphDataModule(windowMock = { location: { pathname: '/public/graph-display/index.html', hostname: '127.0.0.1', search: '' } }, fetchMock = async () => ({ ok: false, status: 404, json: async () => ({}) })  «Load the browser graph-data module into a Node test harness with mocked globals.»
    [describe] Graph Data Module  «Validate that the graph-data module parses and builds task graph templates correctly.»

structure from tests/unit/local-folder-scanner.test.js:
    [file-summary] Unit coverage for browser-side local-folder TaskDB discovery and registration.
    function loadFolderProjectService(initialStorage = {})  «Load the browser folder-project service into a Node test harness with mocked storage.»
    [describe] Folder Project Service  «Validate local folder TaskDB discovery, registration, and lookup behavior.»

structure from tests/unit/projects-config.test.js:
    [file-summary] Projects Config Tests Verify that a centralized PROJECTS_CONFIG is loaded and applied to TEMPLATE_CONFIG
    const TEMPLATE_CONFIG  «Evaluated template configuration with an injected PROJECTS_CONFIG test fixture.»
    [describe] PROJECTS_CONFIG override  «Validate that PROJECTS_CONFIG overrides are wired into TEMPLATE_CONFIG.»

structure from tests/unit/server-api.test.js:
    [file-summary] Server API Tests Validates local disk persistence API and derived state files generation.
    function httpRequest({ port, method, path: reqPath, body, headers = {} })  «Send a raw HTTP request to a locally running server and resolve with status code and body.»
    [describe] Server API - /api/tasks  «Validate the /api/tasks REST endpoints for task persistence and derived state file generation.»

structure from tests/unit/task-field-automation.test.js:
    [file-summary] Template Automation Tests Tests for automated field population
    const TEMPLATE_CONFIG  «Evaluated TEMPLATE_CONFIG loaded directly from the production config file.»
    const TemplateValidator  «TemplateValidator class evaluated from the browser module in a Node test harness.»
    const TemplateAutomation  «TemplateAutomation class evaluated from the browser module in a Node test harness.»
    [describe] TemplateAutomation Initialization  «Verify that TemplateAutomation can be instantiated with a TEMPLATE_CONFIG.»
    [describe] Task ID Generation  «Validate sequential task ID generation and gap-filling logic.»
    [describe] Auto-populate Task  «Validate auto-population of individual task fields from TEMPLATE_CONFIG defaults and rules.»
    [describe] Auto-populate Project  «Validate auto-population of project-level fields.»
    [describe] Skill Match Calculation  «Validate worker skill matching score calculation against task requirements.»
    [describe] v3 Agentic Field Auto-Population  «Validate v3 agentic field auto-population including effort, complexity, and risk fields.»
    [describe] v3 Project Auto-Population  «Validate v3 project-level field auto-population including budget and health scores.»
    [describe] validateAndFix v3 Support  «Validate that validateAndFix correctly handles v3 schema fields.»

structure from tests/unit/task-schema-validator.test.js:
    [file-summary] Template Validator Tests Tests for validation logic
    const TEMPLATE_CONFIG  «Evaluated TEMPLATE_CONFIG loaded directly from the production config file.»
    const TemplateValidator  «TemplateValidator class evaluated from the browser module in a Node test harness.»
    [describe] TemplateValidator Initialization  «Verify that TemplateValidator can be instantiated with a TEMPLATE_CONFIG.»
    [describe] Date Validation  «Validate YYYY-MM-DD date format detection and rejection of non-conformant values.»
    [describe] Email Validation  «Validate RFC-5322-style email format detection.»
    [describe] Status Normalization  «Validate case-insensitive status string normalization to canonical enum values.»
    [describe] Task Validation  «Validate task-level field validation rules including required fields and enum constraints.»
    [describe] Project Validation  «Validate project-level field validation rules including dates and status values.»
    [describe] v3 Task Field Validation  «Validate v3 schema task fields including agentic, risk, and milestone properties.»

structure from tests/unit/task-storage-sync.test.js:
    [file-summary] Task Database Tests Tests for task storage and operations
    const TEMPLATE_CONFIG  «Evaluated TEMPLATE_CONFIG loaded directly from the production config file.»
    const TemplateValidator  «TemplateValidator class evaluated from the browser module in a Node test harness.»
    const TemplateAutomation  «TemplateAutomation class evaluated from the browser module in a Node test harness.»
    class MockGitHubAPI  «In-memory stub that replaces the real GitHub API client for isolated task storage tests.»:
        constructor()  «Initialize with an empty in-memory file store.»
        async getFileContent(path)  «Return the stored content and a deterministic SHA for the given path.»
        async updateFile(path, content, message, sha)  «Persist the content in the in-memory store and return a new mock SHA.»

    [describe] TaskDatabase Initialization  «Verify that TaskDatabase can be created and exposes an empty tasks array initially.»
    [describe] Task CRUD Operations  «Validate create, read, update, and delete operations on tasks within TaskDatabase.»
    [describe] Task Filtering  «Validate filtering tasks by status, priority, and category.»
    [describe] Statistics Generation  «Validate task statistics aggregation including counts by status and priority.»
    [describe] TaskDatabase Persistence  «Validate that TaskDatabase correctly loads from and saves to the mock GitHub storage backend.»

structure from tests/unit/tasks-json-format.test.js:
    [file-summary] node.tasks.json format validation tests.
    const TASKS_DB_ROOT  «Absolute path to the root tasksDB directory scanned for node.tasks.json files.»
    const VALID_PROJECT_STATUS  «Allowed values for the project-level `status` field.»
    const VALID_TASK_STATUS  «Allowed values for a task-level `status` field.»
    const VALID_PRIORITY  «Allowed values for a task-level `priority` field.»
    const VALID_DEP_TYPES  «Allowed dependency link type codes (Finish-to-Start, Start-to-Start, Finish-to-Finish, Start-to-Finish).»
    const DATE_RE  «Regular expression that matches the YYYY-MM-DD date format.»
    function findTasksJsonFiles(dir, results = [])  «Recursively walk a directory tree and collect all `node.tasks.json` file paths.»
    function validateTasksJson(filePath)  «Validate a single `node.tasks.json` file against the expected schema and return all collected errors and warnings.»
    [describe] node.tasks.json format validation  «Validate every node.tasks.json discovered under the tasksDB directory against the project schema.»

structure from tests/unit/template-config.test.js:
    [file-summary] Template Config Tests Tests for TEMPLATE_CONFIG structure and values
    const TEMPLATE_CONFIG  «Evaluated TEMPLATE_CONFIG loaded directly from the production config file.»
    [describe] TEMPLATE_CONFIG Structure  «Verify that TEMPLATE_CONFIG exposes all mandatory top-level keys and metadata.»
    [describe] FIELD_CATEGORIES  «Validate FIELD_CATEGORIES arrays for automatic, required, and optional input fields.»
    [describe] ENUMS Validation  «Validate that ENUMS covers all required status, priority, and v3 extension values.»
    [describe] v3 Defaults  «Validate v3 task and project default values are correct types and initial states.»
    [describe] v3 Optional Fields  «Validate that v3 optional task fields are registered in OPTIONAL_FIELDS and FIELD_CATEGORIES.»
    [describe] STATUS_NORMALIZATION v3  «Validate that STATUS_NORMALIZATION maps lowercase and underscore variants to canonical v3 values.»
    [describe] GITHUB Configuration  «Validate the GITHUB configuration block for owner, repo, branch, and project resolver methods.»
    [describe] CATEGORIES List  «Validate that the CATEGORIES list is populated with the expected category names.»

structure from tests/unit/validate-schema.js:
    [file-summary] Schema Validation Script Validates node.tasks.json against the template schema
    const PROJECT_STATUS  «Allowed values for the project-level `status` field.»
    const TASK_STATUS  «Allowed values for a task-level `status` field.»
    const TASK_PRIORITY  «Allowed values for a task-level `priority` field.»
    const DEPENDENCY_TYPES  «Allowed dependency link type codes.»
    function validateRequired(obj, fields, prefix = '')  «Assert that all listed fields exist and are non-empty on the given object.»
    function validateEnum(value, validValues, fieldName)  «Record an error when a value is defined but not included in the allowed values list.»
    function validateDateFormat(dateStr, fieldName)  «Record an error when a date string is defined but does not match the YYYY-MM-DD format.»

structure from tools/calendar/README.md:
    [file-summary] Calendar Export Tooling
    [heading-1] # Calendar Export Tooling
    [heading-2] ## Structure
    [heading-2] ## Why This Lives In `tools/`
    [heading-2] ## Schema Coverage Review
    [heading-2] ## Usage

structure from tools/calendar/calendar-appointment-schema.js:
    [file-summary] Task-to-calendar field mappings and appointment schema metadata.
    const TEMPLATE_CONFIG  «Task-to-calendar field mappings and appointment schema metadata.»
    const TASK_KNOWN_FIELDS  «All known task field names, flattened from TEMPLATE_CONFIG.FIELD_CATEGORIES. Use this as an authoritative whitelist when»
    const TASK_FIELD_SCHEMA  «Type-annotated schema for documentation purposes. Extends TASK_KNOWN_FIELDS with calendar-alias fields supported by the »
    const CALENDAR_META_FIELD_NAMES  «Field names that may contain an embedded calendar override inside a task object. The parser checks these in order and me»
    const WORKER_FIELD_MAP  «Defines how an assigned_workers entry maps to calendar appointment fields.»
    const PRIORITY_MAP  «Maps TEMPLATE_CONFIG.ENUMS.TASK_PRIORITY string values to numeric appointment priority (1–10 scale). Unknown values fall»
    const STATUS_TO_APPOINTMENT_MAP  «Maps TEMPLATE_CONFIG.ENUMS.TASK_STATUS values to calendar appointment status. Status values not present here resolve to »
    const APPOINTMENT_FIELDS  «Ordered list of field names in a normalized calendar appointment object. This is the authoritative shape consumed by cal»
    const APPOINTMENT_DEFAULTS  «Default values for a normalized appointment, used when a source field is absent or null. Numeric/string defaults align w»
    const TASK_TO_CALENDAR_FIELD_SOURCES  «Ordered task and meta source paths used to resolve each appointment field.»
    const CALENDAR_APPOINTMENT_SCHEMA  «Type annotations for calendar appointment output fields (documentation). Keys match APPOINTMENT_FIELDS order exactly.»

structure from tools/calendar/calendar-constants.js:
    [file-summary] Shared constants for calendar export sorting, recurrence, colors, and defaults.
    const RECURRENCE_VALUES  «Shared constants for calendar export sorting, recurrence, colors, and defaults.»
    const SORT_MODES  «Supported appointment sort modes for generated calendar state files.»
    const APPOINTMENT_STATUSES  «Valid normalized appointment status values for calendar exports.»
    const DEFAULT_CALENDAR_ID  «Default calendar identifier when no task-specific calendar id is provided.»
    const DEFAULT_SORT_MODE  «Default sort mode applied to generated calendar exports.»
    const DEFAULT_TIMEZONE  «Default timezone used when the task or project does not provide one.»
    const DEFAULT_PRIORITY  «Default numeric appointment priority used when no explicit priority is mapped.»
    const DEFAULT_CALENDAR_COLOR  «Default fallback color applied to generated calendar definitions.»
    const CALENDAR_COLOR_PALETTE  «Palette cycled across generated calendars when no explicit color is configured.»

structure from tools/calendar/generate-project-calendars.js:
    [file-summary] CLI and library entrypoint for generating calendar JSON from TaskDB projects.
    const EXCLUDED_ROOT_PROJECT_DIRS  «Excluded root project dirs.»
    const TASK_SCOPE_VALUES  «Task scope values.»
    const TERMINAL_TASK_STATUSES  «Terminal task statuses.»
    function isPlainObject(value)  «Is plain object.»
    function toFlatArray(value)  «To flat array.»
    function uniqueStrings(values)  «Unique strings.»
    function normalizeProjectId(rawValue)  «Normalize project id.»
    function normalizeTaskScope(value, { allowBoth = false } = {})  «Normalize task scope.»
    function slugify(value)  «Slugify.»
    function prettifyIdentifier(value)  «Prettify identifier.»
    function isDateOnlyString(value)  «Is date only string.»
    function hasExplicitTime(value)  «Has explicit time.»
    function toIsoDateTime(value, { endOfDay = false } = {})  «To iso date time.»
    function normalizeNullableNumber(value, { integer = false } = {})  «Normalize nullable number.»
    function normalizePositiveCount(value)  «Normalize positive count.»
    function normalizeReminderMinutes(value)  «Normalize reminder minutes.»
    function getNestedFieldValue(obj, path)  «Get nested field value.»
    function isDefinedValue(value)  «Is defined value.»
    function resolveTaskFieldValue(task, meta, sources)  «Resolve task field value.»
    function normalizeRecurrence(value)  «Normalize recurrence.»
    function normalizeAppointmentStatus(value, fallback = 'tentative')  «Normalize appointment status.»
    function mapTaskStatusToAppointmentStatus(taskStatus)  «Map task status to appointment status.»
    function mapPriorityToNumber(explicitPriority, taskPriority)  «Map priority to number.»
    function normalizeColor(color, fallback)  «Normalize color.»
    function looksLikeEmail(value)  «Looks like email.»
    function createOpaqueWorkerId(seed)  «Create opaque worker id.»
    function resolveWorkerContact(worker)  «Resolve worker contact.»
    function resolveWorkerProfessionalLabel(worker)  «Resolve worker professional label.»
    function resolveWorkerAttendeeLabel(worker)  «Resolve worker attendee label.»
    function resolveWorkerProfessionalId(worker)  «Resolve worker professional id.»
    function extractTaskCalendarMeta(task)  «Extract task calendar meta.»
    function pickFirstUrl(values)  «Pick first url.»
    function buildAttendees(task, meta)  «Build attendees.»
    function buildContacts(task, meta)  «Build contacts.»
    function buildAppointment(task, context)  «Build appointment.»
    function buildCalendars(appointments, calendarMetaById, projectName)  «Build calendars.»
    function isPendingTask(task)  «Is pending task.»
    function filterTasksByScope(tasks, taskScope)  «Filter tasks by scope.»
    function buildCalendarState(payload, options = {})  «Build calendar state.»
    function readJson(filePath)  «Read json.»
    function resolveProjectDescriptor(projectId, repoRoot)  «Resolve project descriptor.»
    function normalizeTaskPathId(value)  «Normalize task path id.»
    function findNestedTaskJsonPaths(rootDir, excludePath)  «Find nested task json paths.»
    function expandProjectDescriptor(descriptor)  «Expand project descriptor.»
    function listProjectDescriptors(repoRoot)  «List project descriptors.»
    function getOutputFileName(descriptor)  «Get output file name.»
    function getProjectOutputDirectory(descriptor, outputDir)  «Get project output directory.»
    function getCalendarOutputDirectory(descriptor, outputDir, taskScope)  «Get calendar output directory.»
    function getWorkerOutputDirectory(descriptor, outputDir, taskScope)  «Get worker output directory.»
    function cleanupLegacyOutputLayout(descriptor, outputDir)  «Cleanup legacy output layout.»
    function writeCalendarFile(descriptor, state, outputDir, options = {})  «Write calendar file.»
    function loadDescriptorPayload(descriptor)  «Load descriptor payload.»
    function extractWorkersFromTasks(tasks)  «Extracts all unique assigned workers from a tasks array. Returns a Map keyed by stable professionalId → { name, email, r»
    function buildWorkerCalendarState(workerInfo, appointments, options = {})  «Builds a calendar state scoped to a single worker. Filters appointments where the worker appears by stable professionalI»
    function generateWorkerCalendarFiles(descriptor, globalState, tasks, options = {})  «Generates per-worker calendar files into a `workers-calendar/` subfolder inside the project's output directory.»
    function generateCalendarFile(descriptor, options = {})  «Generate calendar file.»
    function parseCliArgs(argv)  «Parse cli args.»
    function main(argv = process.argv.slice(2))  «Run the calendar generation CLI for one or more TaskDB projects.»
    function groupAppointmentsByWorker(appointments)  «Groups appointments by assigned worker, returning a Map keyed by worker identifier (professionalId → fallback profession»

structure from tools/cloudflare-worker/README.md:
    [file-summary] Cloudflare Worker for Secure GitHub Writes
    [heading-1] # Cloudflare Worker for Secure GitHub Writes
    [heading-2] ## Setup
    [heading-3] ### 1. Create Cloudflare Account
    [heading-3] ### 2. Deploy the Worker
    [heading-3] ### 3. Configure Environment Variables
    [heading-3] ### 4. Get Your Worker URL
    [heading-3] ### 5. Configure the App
    [heading-2] ## Security Features
    [heading-3] ### Path Validation
    [heading-3] ### Password Validation
    [heading-3] ### CORS Protection
    [heading-2] ## API Endpoints
    [heading-3] ### PUT /api/tasks
    [heading-3] ### GET /api/task-history
    [heading-3] ### GET /health
    [heading-2] ## Cost
    [heading-2] ## Set Worker secrets (recommended)
    [heading-1] # Set per-project token (preferred):
    [heading-1] # Or set shared token fallback:
    [heading-1] # Set per-project password and master password:
    [heading-1] # After setting secrets, deploy:
    [heading-2] ## Validate token access locally
    [heading-1] # Test per-project token
    [heading-1] # Test shared token
    [heading-2] ## Alternative: Vercel Edge Functions

structure from tools/cloudflare-worker/deploy.ps1:  (no extractable definitions)

structure from tools/cloudflare-worker/deploy.sh:  (no extractable definitions)

structure from tools/cloudflare-worker/package.json:
    [file-summary] github-task-manager-worker — Cloudflare Worker for secure GitHub API writes
    [json-key] name: "github-task-manager-worker"
    [json-key] version: "1.0.0"
    [json-key] description: "Cloudflare Worker for secure GitHub API writes"
    [json-key] type: "module"
    [json-key] main: "worker.js"
    [json-key] scripts: {dev, deploy, test}
    [json-key] dependencies: {}
    [json-key] devDependencies: {wrangler}

structure from tools/cloudflare-worker/validate-secrets.js:
    [file-summary] Validate Cloudflare worker GitHub tokens against the target repository.
    function getEnvVar(keys)  «Return the first configured environment variable from a list of candidate names.»
    function checkRepoToken({ owner, repo, branch, path }, token)  «Check whether a token can read a known repository path via the GitHub contents API.»

structure from tools/cloudflare-worker/worker.js:
    [file-summary] Cloudflare worker that brokers secure TaskDB writes and history reads.
    const ALLOWED_ORIGINS  «Cloudflare worker that brokers secure TaskDB writes and history reads.»
    const ALLOWED_PATHS  «Allowed repository paths that the worker may read or write.»
    function getTokenForProject(projectId, env)  «Resolve the GitHub token to use for a specific project write operation.»
    function safeProjectId(value)  «Sanitize a project id before using it in paths, keys, or env lookups.»
    function normalizeScope(value)  «Normalize a configured project scope to the supported TaskDB scopes.»
    function getProjectBasePath(cfg)  «Build the base repository path used for a project's TaskDB files.»
    function getProjectConfig(projectId, env)  «Resolve project repository configuration from worker env or defaults.»
    function getFileContentAndShaForRepo({ owner, repo, branch }, filePath, token)  «Fetch an existing repository file and its SHA from the GitHub contents API.»
    function safeJsonParse(text, fallback = null)  «Parse JSON safely when reading stored history and task payloads.»
    function getTaskKey(task)  «Resolve the canonical task key used to diff old and new task payloads.»
    function summarizeChanges(changes)  «Summarize changed fields for compact task-history entries.»
    function diffTasks(oldTasks, newTasks)  «Diff two task arrays and emit create, update, and delete events.»
    function appendNdjsonEvents(projectId, token, events, env)  «Append task change events to the project's NDJSON history file.»
    function handleGetTaskHistory(request, env, origin)  «Read the project task-history stream and return recent matching events.»
    function handleTasksUpdate(request, env, origin)  «Validate and persist a TaskDB file update through the GitHub contents API.»
    function handleCORS(request)  «Build the CORS preflight response for allowed browser origins.»
    function jsonResponse(data, origin, status = 200)  «Serialize a JSON API response with the appropriate CORS headers.»

structure from tools/cloudflare-worker/wrangler.toml:  (no extractable definitions)

structure from tools/docs/COMMIT_MESSAGE_FORMAT.md:
    [file-summary] TaskDB Commit Message Format
    [heading-1] # TaskDB Commit Message Format
    [heading-2] ## Format Specification
    [heading-3] ### Subject Line
    [heading-3] ### Components
    [heading-3] ### Summary Field by Action
    [heading-2] ## Examples
    [heading-3] ### Create
    [heading-3] ### Update
    [heading-3] ### Delete
    [heading-2] ## Machine Parsing
    [heading-3] ### JavaScript Parsing Helper
    [heading-3] ### Example: Parsing in Your Tool
    [heading-2] ## Commit Body
    [heading-2] ## Use Cases
    [heading-2] ## Sanitization Rules
    [heading-2] ## Validation Schema

structure from tools/docs/DEPLOYMENT_SUMMARY.md:
    [file-summary] Deployment Summary — GitHub Task Manager
    [heading-1] # Deployment Summary — GitHub Task Manager
    [heading-2] ## 🎯 Status Summary
    [heading-2] ## 📊 What's Been Done
    [heading-3] ### 1. Fixed GitHub Actions Workflow
    [heading-3] ### 2. Created Task Database Structure
    [heading-3] ### 3. GitHub Pages Setup Files
    [heading-2] ## 🚀 NEXT STEPS: Enable GitHub Pages (Manual Configuration Required)
    [heading-3] ### Step 1: Enable GitHub Pages in Repository Settings
    [heading-3] ### Step 2: Add Repository Secret
    [heading-3] ### Step 3: Trigger Workflow (Manual or Automatic)
    [heading-3] ### Step 4: Monitor Deployment
    [heading-3] ### Step 5: Test Live Site
    [heading-2] ## 🗂️ Project Structure
    [heading-2] ## 🔧 Workflow Details
    [heading-3] ### Before (Broken)
    [heading-3] ### After (Fixed)
    [heading-2] ## 📝 Task Database Management
    [heading-3] ### How Tasks Are Stored
    [heading-3] ### Adding New Tasks
    [heading-3] ### Task Fields
    [heading-2] ## 🧪 Testing the Deployment
    [heading-3] ### Before GitHub Pages is Configured
    [heading-1] # Python
    [heading-1] # Or Node.js
    [heading-3] ### After GitHub Pages is Configured
    [heading-2] ## ✅ Verification Checklist
    [heading-2] ## 📞 Support & Troubleshooting
    [heading-3] ### GitHub Pages Not Live
    [heading-3] ### Token Not Working
    [heading-3] ### Workflow Failing
    [heading-2] ## 🎉 Summary

structure from tools/docs/GITHUB_PAGES_SETUP.md:
    [file-summary] GitHub Pages Setup — Quick Guide
    [heading-1] # GitHub Pages Setup — Quick Guide
    [heading-2] ## Enable GitHub Pages
    [heading-3] ### Step 1: Enable GitHub Pages
    [heading-3] ### Step 2: Configure GitHub Secret
    [heading-3] ### Step 3: Trigger Deployment
    [heading-3] ### Step 4: Verify Live Site
    [heading-2] ## Workflow Status
    [heading-2] ## Troubleshooting
    [heading-3] ### "Source is not GitHub Actions"
    [heading-3] ### "Deployment failed"
    [heading-3] ### "404 Page not found"
    [heading-3] ### "Cannot read github-token.js"
    [heading-2] ## Local Testing (Before GitHub Pages)
    [heading-1] # Simple HTTP server (Python)
    [heading-1] # Or using Node.js http-server
    [heading-2] ## Important Notes

structure from tools/docs/PLAYWRIGHT_TEST_REPORT.md:
    [file-summary] Playwright Test Report — GitHub Task Manager
    [heading-1] # Playwright Test Report — GitHub Task Manager
    [heading-2] ## Executive Summary
    [heading-2] ## How to Reproduce Locally
    [heading-2] ## Quick Results
    [heading-2] ## Recommendations
    [heading-2] ## Executive Summary
    [heading-2] ## Test Cases & Results
    [heading-3] ### 1. Initial Load Test
    [heading-3] ### 2. User Name Input
    [heading-3] ### 3. Create Task (CREATE)
    [heading-3] ### 4. Delete Task (DELETE) - Attempted
    [heading-3] ### 5. Refresh/Reload (READ from GitHub)
    [heading-2] ## Feature Verification
    [heading-3] ### Auto-Population Works
    [heading-3] ### Form Validation Works
    [heading-3] ### GitHub Integration Works
    [heading-3] ### Statistics Update Works
    [heading-2] ## Technical Details
    [heading-3] ### Data Persistence Flow
    [heading-3] ### Auto-Generated Fields
    [heading-3] ### Database Operations
    [heading-2] ## Browser Console Errors
    [heading-2] ## Performance Metrics
    [heading-2] ## Conclusion
    [heading-3] ### Summary
    [heading-3] ### What Works Perfectly
    [heading-3] ### Minor Issues to Address
    [heading-3] ### Recommendations
    [heading-2] ## Test Environment
    [heading-2] ## Attachments

structure from tools/docs/QUICKSTART.md:
    [file-summary] Quickstart — GitHub Task Manager
    [heading-1] # Quickstart — GitHub Task Manager
    [heading-2] ## Local Development
    [heading-2] ## Enable GitHub Pages
    [heading-2] ## Quick Tests
    [heading-2] ## ⚡ 2-Minute Setup
    [heading-3] ### 1. Go to Settings
    [heading-3] ### 2. Find "Pages" Section
    [heading-3] ### 3. Change Source
    [heading-3] ### 4. Add Secret
    [heading-3] ### 5. Done!
    [heading-2] ## 📋 Files Changed Today
    [heading-2] ## 🎯 Current Project State
    [heading-2] ## 🌐 After Setup Complete
    [heading-2] ## 💡 Key Features Ready
    [heading-2] ## 📞 Issues During Setup?
    [heading-1] # Visit http://localhost:8000

structure from tools/docs/TEMPLATE_VALIDATION_GUIDE.md:
    [file-summary] Template Validation Guide
    [heading-1] # Template Validation Guide
    [heading-2] ## Required Database ENUM Values
    [heading-3] ### Project Status
    [heading-3] ### Task Status
    [heading-3] ### Task Priority
    [heading-3] ### Dependency Types
    [heading-2] ## Template Structure Examples
    [heading-3] ### 1. Standard Project Template (Flat Structure)
    [heading-3] ### 2. Current State Template (Timeline/Subtasks Structure)
    [heading-2] ## Required Fields
    [heading-3] ### Project (Minimum)
    [heading-3] ### Task (Minimum for Functional Tracking)
    [heading-3] ### Using `required_fields` and `optional_fields` for Validation
    [heading-3] ### Optional but Recommended (for Advanced Tracking and LLM Content Generation)
    [heading-3] ### Collaboration Without Personal Data (PII-Safe)
    [heading-3] ### Recommended Task Fields (Recommended)
    [heading-3] ### New Collaboration & Hierarchy Fields (Recommended)
    [heading-2] ## Status Normalization
    [heading-2] ## Date Format
    [heading-2] ## Dependency References
    [heading-2] ## CSV Formatting Conventions
    [heading-2] ## Testing Your Template
    [heading-2] ## Logical Flow & Bottleneck Tracking
    [heading-2] ## Template Versioning
    [heading-2] ## Common Validation Errors
    [heading-3] ### Error: "Data truncated for column 'status'"
    [heading-3] ### Error: "Invalid project file: missing tasks array"
    [heading-3] ### Error: "Unknown column 'dependency_type'"
    [heading-3] ### Error: Task dates invalid
    [heading-2] ## Business Template Examples
    [heading-2] ## Template Checklist
    [heading-2] ## Status Mapping Reference
    [heading-2] ## Coverage: Top 20 Task Fields (score)

structure from tools/docs/TESTING.md:
    [file-summary] Live Testing Guide - GitHub Task Manager
    [heading-1] # Live Testing Guide - GitHub Task Manager
    [heading-2] ## ✓ Issues Fixed
    [heading-2] ## 🚀 Live Website
    [heading-2] ## ✅ Features to Test
    [heading-3] ### 1. **View Existing Tasks**
    [heading-3] ### 2. **Task Statistics**
    [heading-3] ### 3. **Filters**
    [heading-3] ### 4. **Task List Display**
    [heading-3] ### 5. **Add New Task**
    [heading-3] ### 6. **Task Management**
    [heading-3] ### 7. **Data Persistence**
    [heading-3] ### 8. **Validation**
    [heading-3] ### 9. **GitHub Integration**
    [heading-3] ### 10. **User Collaboration**
    [heading-2] ## 📊 Current Project State
    [heading-3] ### Task Breakdown
    [heading-2] ## 🔧 Technical Details
    [heading-2] ## 🐛 Error Handling
    [heading-2] ## 📝 Test Checklist

structure from tools/scripts/archive-root-tasks.js:
    [file-summary] Archive the legacy root-level TaskDB files with a timestamped backup snapshot.
    function pad2(n)  «Pad a number to two digits for timestamp formatting.»
    function timestamp()  «Build a filesystem-safe timestamp string for archive naming.»
    function escapeCsvValue(value)  «Escape a value for inclusion in generated CSV output.»
    function generatePersistedCSV(tasks = [])  «Generate a persisted CSV snapshot from a TaskDB task list.»
    function main()  «Run the script entrypoint for this file.»

structure from tools/scripts/enrich-tasks-workers.js:
    [file-summary] enrich-tasks-workers.js ---------------------- Adds/normalizes tasks/workers expectation fields on a TaskDB JSON file.
    function isNonEmptyString(v)  «Check whether a value is a non-empty string.»
    function uniq(arr)  «Return the ordered unique values from an array.»
    function loadJson(filePath)  «Load and parse a JSON file from disk.»
    function saveJson(filePath, obj)  «Write a JSON object to disk with stable formatting.»
    function buildTasksById(tasks)  «Build a lookup map keyed by task id.»
    function taskRefToRequisiteString(ref, tasksById)  «Convert a task reference into a normalized requisite string.»
    function normalizeRequisites(task, tasksById)  «Normalize task requisite fields using task lookup information.»
    function roleToSkills(role)  «Map a reviewer or worker role to default skill tags.»
    function categoryToRequisites(categoryName)  «Infer default requisites from a task category.»
    function tagsToRequisites(tags)  «Infer requisites from task tags.»
    function inferReviewerRole(task)  «Infer the reviewer role that best matches a task.»
    function main(argv = process.argv)  «Run the script entrypoint for this file.»

structure from tools/scripts/generate-state-files.js:
    [file-summary] generate-state-files.js ----------------------- Generates derived state JSON files from public/tasksDB/<scope>/<project>/node.tasks.json Output: public/tasksDB/<scope>/<project>/state/*.json Usage: no
    function ensureDir(dirPath)  «Ensure that a directory exists before writing derived files.»
    function writeJson(filePath, data)  «Write a JSON file with pretty-printed output.»
    function generateStateData(tasks)  «Generate derived state payloads from a task list.»
    function main()  «Run the script entrypoint for this file.»

structure from tools/scripts/prepare-public-graph.js:
    [file-summary] Copy the graph-display app into the public deployment tree.
    function copyGraphDisplayIntoPublic()  «Copy the graph-display source app into the public deployment directory.»

structure from tools/scripts/regenerate-tasks-csv.js:
    [file-summary] regenerate-tasks-csv.js ------------------------ Generates a flattened CSV export from public/tasksDB/<scope>/<project>/node.tasks.json Output: public/tasksDB/<scope>/<project>/tasks.csv Usage: node t
    function escapeCsvValue(value)  «Escape a value for inclusion in generated CSV output.»
    function main()  «Run the script entrypoint for this file.»

structure from tools/scripts/setup.bat:  (no extractable definitions)

structure from tools/scripts/setup.js:
    [file-summary] Repository bootstrap helper for initializing and publishing the project.
    const GH_TOKEN  «GitHub token used during interactive repository setup commands.»
    function question(prompt)  «Prompt the user for input from the interactive setup workflow.»
    function exec(cmd, options = {})  «Execute a shell command for the repository setup workflow.»
    function main()  «Run the interactive repository bootstrap and publishing flow.»

structure from tools/scripts/validate-commit-format.js:
    [file-summary] TaskDB Commit Format Validator
    function parseArgs(argv)  «Parse CLI arguments for this validation or export script.»
    function git(cmd)  «Run a git command and return its captured output.»
    function extractTaskDbPayload(commitBody)  «Extract the TaskDB payload block from a commit message body.»
    function validateSubject(subject)  «Validate that a commit subject matches the expected TaskDB format.»
    function determineRange(args)  «Resolve the git revision range to validate.»
    function listCommits(range, max)  «List commits in the requested git revision range.»
    function main()  «Run the script entrypoint for this file.»

structure from tools/scripts/validate-tasks-schema.js:
    [file-summary] TaskDB Task Schema Validator
    function parseArgs(argv)  «Parse CLI arguments for this validation or export script.»
    function sanitizeProjectId(s)  «Sanitize a project id passed through CLI arguments.»
    function loadTasksJson(projectId)  «Load the node.tasks.json payload for a project.»
    function isValidDateYYYYMMDD(dateStr)  «Check whether a string matches the YYYY-MM-DD date format.»
    function hasTimestampPollution(taskName)  «Check whether a task name appears to contain an injected timestamp.»
    function validateProjectFile(projectId, tasksJson)  «Validate one project node.tasks.json payload against the expected schema rules.»
    function main()  «Run the script entrypoint for this file.»

structure from tools/scripts/validate-tasks-workers.js:
    [file-summary] validate-tasks-workers.js ------------------------ Validates tasks/workers expectation fields on TaskDB projects.
    function parseArgs(argv)  «Parse CLI arguments for this validation or export script.»
    function sanitizeProjectId(s)  «Sanitize a project id passed through CLI arguments.»
    function loadProjectTasks(projectId)  «Load the TaskDB payload for a worker validation run.»
    function isNonEmptyString(v)  «Check whether a value is a non-empty string.»
    function isNonEmptyStringArray(v)  «Check whether a value is an array of non-empty strings.»
    function isNonEmptyArray(v)  «Check whether a value is a non-empty array.»
    function validate(projectId, tasksJson, { strict })  «Validate tasks and workers metadata for a TaskDB project.»
    function main(argv = process.argv)  «Run the script entrypoint for this file.»

---

## Relations structure

relations from server.js:
    [require] http
    [require] fs
    [require] path
    [require] url

relations from public/graph-display/index.html:
    [asset] images/favicon.svg
    [asset] images/favicon.png
    [asset] manifest.json
    [asset] css/styles-new.css
    [asset] js/d3.v7.min.js
    [asset] ../local-folder/js/local-folder-scanner.js
    [asset] ../local-folder/js/folder-picker-trigger.js
    [asset] ../calendar/js/task-ics-export.js
    [asset] js/utils.js
    [asset] js/main-graph.js
    [asset] images/team/profile-placeholder.svg

relations from public/graph-display/css/styles-new.css:
    [import] components/_variables.css
    [import] components/_base.css
    [import] components/_accessibility.css
    [import] components/_buttons.css
    [import] components/_header.css
    [import] components/_graph.css
    [import] components/_menu.css
    [import] components/_popups.css
    [import] components/_tooltip.css
    [import] components/_walkthrough.css
    [import] components/_colors.css
    [import] components/_responsive.css
    [import] components/_modules-sidebar.css

relations from public/graph-display/js/graph-data.js:
    [import] ./template-loader.js

relations from public/graph-display/js/main-graph.js:
    [import] ./graph-data.js
    [import] ./cv-generator.js
    [import] ./walkthrough.js
    [import] ./shared/tours.js
    [import] ./utils.js
    [import] ./shared/link-types.js

relations from public/graph-display/js/walkthrough.js:
    [import] ./utils.js

relations from public/health/index.html:
    [asset] ./css/health.css
    [asset] ./js/runtime-health-checker.js

relations from public/list-display/index.html:
    [asset] ./css/task-manager.css
    [asset] ../config/access-secret.local.js
    [asset] ../config/access-secret.js
    [asset] ../config/github-token.local.js
    [asset] ../config/github-token.js
    [asset] ../config/github-oauth.js
    [asset] ../config/worker-url.local.js
    [asset] ../config/worker-url.js
    [asset] ../config/projects-config.js
    [asset] ../config/tasks-template-config.js
    [asset] ../local-folder/js/local-folder-scanner.js
    [asset] ../local-folder/js/folder-picker-trigger.js
    [asset] ../task-engine/js/task-schema-validator.js
    [asset] ../task-engine/js/task-field-automation.js
    [asset] ../task-engine/js/task-storage-sync.js
    [asset] ../calendar/js/task-ics-export.js
    [asset] ./js/list-display-controller.js

relations from tests/playwright.config.js:
    [import] @playwright/test
    [import] os

relations from tests/run-tests.js:
    [require] fs
    [require] path

relations from tests/e2e/crud-operations.spec.js:
    [import] @playwright/test

relations from tests/e2e/graph-fullscreen.spec.js:
    [import] @playwright/test

relations from tests/e2e/live-multi-project-saves.spec.js:
    [import] @playwright/test

relations from tests/e2e/module-navigation.spec.js:
    [import] @playwright/test

relations from tests/e2e/password-timeline-issues.spec.js:
    [import] @playwright/test

relations from tests/e2e/smoke.spec.js:
    [import] @playwright/test

relations from tests/e2e/update-task-via-ui.spec.js:
    [import] @playwright/test

relations from tests/e2e/verify-commit-structure.spec.js:
    [import] @playwright/test

relations from tests/e2e/visual-states.spec.js:
    [import] @playwright/test

relations from tests/graph-display/graph-display.spec.js:
    [import] @playwright/test

relations from tests/graph-display/inline-subtask-navigation.spec.js:
    [import] @playwright/test

relations from tests/graph-display/playwright.config.js:
    [import] @playwright/test

relations from tests/graph-display/server.js:
    [require] http
    [require] fs
    [require] path
    [require] url

relations from tests/graph-display/web-e2e-bussines-navigation.spec.js:
    [import] @playwright/test

relations from tests/unit/generate-project-calendars.test.js:
    [require] ../../tools/calendar/generate-project-calendars.js
    [require] ../../tools/calendar/calendar-constants.js
    [require] path

relations from tests/unit/graph-data.test.js:
    [require] fs
    [require] path

relations from tests/unit/local-folder-scanner.test.js:
    [require] fs
    [require] path

relations from tests/unit/projects-config.test.js:
    [require] fs
    [require] path

relations from tests/unit/server-api.test.js:
    [require] http
    [require] fs
    [require] path
    [require] ../../server

relations from tests/unit/task-field-automation.test.js:
    [require] fs
    [require] path

relations from tests/unit/task-schema-validator.test.js:
    [require] fs
    [require] path

relations from tests/unit/task-storage-sync.test.js:
    [require] fs
    [require] path

relations from tests/unit/tasks-json-format.test.js:
    [require] fs
    [require] path

relations from tests/unit/template-config.test.js:
    [require] fs
    [require] path

relations from tests/unit/validate-schema.js:
    [require] fs
    [require] path

relations from tools/calendar/calendar-appointment-schema.js:
    [require] ../../public/config/tasks-template-config.js

relations from tools/calendar/generate-project-calendars.js:
    [require] crypto
    [require] fs
    [require] path
    [require] ./calendar-constants
    [require] ./calendar-appointment-schema

relations from tools/cloudflare-worker/validate-secrets.js:
    [require] node-fetch

relations from tools/scripts/archive-root-tasks.js:
    [require] fs
    [require] path

relations from tools/scripts/enrich-tasks-workers.js:
    [require] fs
    [require] path

relations from tools/scripts/generate-state-files.js:
    [require] fs
    [require] path

relations from tools/scripts/prepare-public-graph.js:
    [require] fs
    [require] path

relations from tools/scripts/regenerate-tasks-csv.js:
    [require] fs
    [require] path

relations from tools/scripts/setup.js:
    [require] child_process
    [require] fs
    [require] path
    [require] readline

relations from tools/scripts/validate-commit-format.js:
    [require] child_process

relations from tools/scripts/validate-tasks-schema.js:
    [require] fs
    [require] path

relations from tools/scripts/validate-tasks-workers.js:
    [require] fs
    [require] path

---

## Flow structure

flow from server.js:
    input -> transform -> state -> output
    [input] readBody, readJsonFile, readDirectoryEntries, discoverProjectTaskFiles
    [transform] generatePersistedCSV, normalizeRelativePath, inferModuleDepartment, inferModuleType
    [state] generatePersistedCSV, writeProjectPayload, writeStateFiles
    [output] sendJson, createServer

flow from public/config/worker-url.js:
    transform
    [transform] __resolveWorkerUrlRuntime

flow from public/graph-display/sw.js:
    state
    [state] precacheAssets

flow from public/graph-display/js/cv-generator.js:
    transform
    [transform] generateGenericSectionItems, generateSkillsSectionInternal, generateClassicCV

flow from public/graph-display/js/d3.v7.min.js:
    state
    [state] InternSet

flow from public/graph-display/js/graph-data.js:
    input -> transform
    [input] loadTemplate
    [transform] normalizePriority, buildDependencyLayering, validateAgainstSchema, resolveProjectIdFromTasksPath

flow from public/graph-display/js/main-graph.js:
    input -> transform -> state -> output
    [input] downloadCalendar, _openNodeDetails, openNodeModal
    [transform] _extractCalendarTasks
    [state] setSelectedTemplateId, setProfileButtonImage, setupNodeInteractions, setupTooltip
    [output] renderError, displayPopup

flow from public/graph-display/js/template-loader.js:
    transform -> state
    [transform] buildCareerTemplateFromData, buildTaskMgmtFromData
    [state] syncBuiltInTemplates

flow from public/graph-display/js/utils.js:
    transform
    [transform] generateColorTones

flow from public/graph-display/js/walkthrough.js:
    state
    [state] setSteps, setGraph, updateTooltipContent

flow from public/graph-display/js/shared/tours.js:
    transform
    [transform] resolveTourUrl, resolveStepsForTemplate

flow from public/list-display/js/list-display-controller.js:
    input -> transform -> state -> output
    [input] ensureGraphIframeLoaded, loadConfig, getModuleFetchCandidates, fetchModuleData
    [transform] buildGraphIframeSrc, normalizeModulePath, normalizeModuleEntry, buildTaskFlowSummary
    [state] getStoredFolderProjects, setupProjectSelector, setActiveProject, updateTaskAuthoringAvailability
    [output] formatDisplayDate, renderProjectNavigation, renderHistory, renderTasks

flow from public/task-engine/js/task-field-automation.js:
    transform
    [transform] generateTaskId, autoGenerateDependencies, validateAndFix, generateProjectSummary

flow from public/task-engine/js/task-schema-validator.js:
    transform
    [transform] validate, validateTemplate, validateProject, validateTask

flow from public/task-engine/js/task-storage-sync.js:
    input -> transform -> state -> output
    [input] resetLoadedMetadata, applyLoadedPayload, loadTasks, loadTemplates
    [transform] inferProjectIdFromTasksFile, resolveTemplateConfig, resolveActiveProjectId, summarizeHistoryChanges
    [state] resetLoadedMetadata, saveTasksLocalDisk, generatePersistedCSV, saveTasksLocal
    [output] exportToCSV

flow from tests/e2e/crud-operations.spec.js:
    input
    [input] waitForAppReady

flow from tests/e2e/graph-fullscreen.spec.js:
    input
    [input] waitForAppReady

flow from tests/e2e/live-multi-project-saves.spec.js:
    input -> state
    [input] waitForAppReady
    [state] waitForSaveToast

flow from tests/e2e/module-navigation.spec.js:
    input
    [input] waitForAppReady

flow from tests/e2e/password-timeline-issues.spec.js:
    input
    [input] waitForAppReady

flow from tests/e2e/smoke.spec.js:
    input
    [input] waitForAppReady

flow from tests/e2e/update-task-via-ui.spec.js:
    input -> state
    [input] waitForAppReady
    [state] updateTaskViaUI

flow from tests/e2e/verify-commit-structure.spec.js:
    input -> transform -> state
    [input] extractTaskDbCommitPayload
    [transform] extractTaskDbCommitPayload
    [state] waitForSaveToast

flow from tests/graph-display/graph-display.spec.js:
    transform -> state
    [transform] parseTranslate
    [state] parseTranslate

flow from tests/unit/graph-data.test.js:
    input
    [input] loadGraphDataModule

flow from tests/unit/local-folder-scanner.test.js:
    input
    [input] loadFolderProjectService

flow from tests/unit/task-storage-sync.test.js:
    state
    [state] updateFile

flow from tests/unit/tasks-json-format.test.js:
    transform
    [transform] validateTasksJson

flow from tests/unit/validate-schema.js:
    transform
    [transform] validateRequired, validateEnum, validateDateFormat

flow from tools/calendar/generate-project-calendars.js:
    input -> transform -> state
    [input] readJson, loadDescriptorPayload
    [transform] normalizeProjectId, normalizeTaskScope, normalizeNullableNumber, normalizePositiveCount
    [state] writeCalendarFile

flow from tools/cloudflare-worker/worker.js:
    transform -> state
    [transform] normalizeScope, safeJsonParse, summarizeChanges
    [state] handleTasksUpdate

flow from tools/scripts/archive-root-tasks.js:
    transform -> state
    [transform] generatePersistedCSV
    [state] generatePersistedCSV

flow from tools/scripts/enrich-tasks-workers.js:
    input -> transform -> state
    [input] loadJson
    [transform] buildTasksById, normalizeRequisites, inferReviewerRole
    [state] saveJson, tagsToRequisites

flow from tools/scripts/generate-state-files.js:
    transform -> state
    [transform] generateStateData
    [state] writeJson

flow from tools/scripts/prepare-public-graph.js:
    output
    [output] copyGraphDisplayIntoPublic

flow from tools/scripts/validate-commit-format.js:
    input -> transform
    [input] extractTaskDbPayload
    [transform] parseArgs, extractTaskDbPayload, validateSubject

flow from tools/scripts/validate-tasks-schema.js:
    input -> transform
    [input] loadTasksJson
    [transform] parseArgs, validateProjectFile

flow from tools/scripts/validate-tasks-workers.js:
    input -> transform
    [input] loadProjectTasks
    [transform] parseArgs, validate

---

## API endpoints

api posture:
    [gap] public/api/ is documentation-only; no runtime endpoint provider was detected under public/
    [runtime-provider] runtime endpoints currently live in server.js, tools/cloudflare-worker/worker.js
    [gap] /api/tasks uses a full-payload GET/PUT model; no item-level POST/PATCH/DELETE task endpoints were detected
    [gap] no registry endpoint provider was detected; registry management appears file-based
    [gap] no machine-readable API contract (OpenAPI/JSON) was detected under public/api/

cli entry points:
    [cli] tools/calendar/generate-project-calendars.js — process.argv CLI
    [cli] tools/scripts/enrich-tasks-workers.js — process.argv CLI
    [cli] tools/scripts/generate-state-files.js — process.argv CLI
    [cli] tools/scripts/regenerate-tasks-csv.js — process.argv CLI
    [cli] tools/scripts/validate-commit-format.js — process.argv CLI
    [cli] tools/scripts/validate-tasks-schema.js — process.argv CLI
    [cli] tools/scripts/validate-tasks-workers.js — process.argv CLI

core surface candidates for API/MCP exposure:
    [candidate] public/graph-display/js/main-graph.js: isEmbeddedMode, getInitialTemplateId, setSelectedTemplateId, CurriculumGraph, constructor (+3 more)
    [candidate] public/list-display/js/list-display-controller.js: TaskManagerApp, constructor, getGraphTemplateIdForActiveProject, getStoredFolderProjects, registerFolderProjectOption (+3 more)
    [candidate] public/task-engine/js/task-storage-sync.js: inferProjectIdFromTasksFile, resolveTemplateConfig, hasValidGitHubToken, resolveActiveProjectId, getProjectScopedStorageKey (+3 more)
    [candidate] tools/calendar/generate-project-calendars.js: isPlainObject, toFlatArray, uniqueStrings, normalizeProjectId, normalizeTaskScope (+3 more)
    [candidate] tools/scripts/enrich-tasks-workers.js: isNonEmptyString, uniq, loadJson, saveJson, buildTasksById (+3 more)
    [candidate] public/graph-display/js/graph-data.js: convertCypherToGraph, normalizePriority, getTaskPredecessorIds, getDependencyLinkType, buildDependencyLayering (+3 more)

automation suggestions:
    [suggest-mcp] wrap core functions with MCP SDK tool decorators for agent integration
    [suggest-contract] add an OpenAPI/JSON schema to document the API surface

api from server.js:
    [route] GET /api/health
    [route] GET /api/projects
    [route] GET /api/module
    [route] GET /api/scan-path
    [route] GET /api/tasks
    [route] PUT /api/tasks

api from tools/cloudflare-worker/worker.js:
    [route] GET /health
    [route] GET /api/task-history
    [route] PUT /api/tasks

---
*144 files indexed · generated by extract_project_spec.py*