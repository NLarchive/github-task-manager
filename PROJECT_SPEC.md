# Project Specification: web-github-task-manager
Generated: 2026-04-18 21:45

## Folder structure

.github
.github\workflows
public
public\api
public\config
public\graph-display
public\graph-display\css
public\graph-display\css\components
public\graph-display\images
public\graph-display\images\team
public\graph-display\js
public\graph-display\js\shared
public\graph-display\templates
public\scripts
public\styles
public\tasksDB
public\tasksDB\_examples
public\tasksDB\_examples\career
public\tasksDB\_examples\task-management
public\tasksDB\_schema
public\tasksDB\_templates
public\tasksDB\external
public\tasksDB\external\ai-career-roadmap
public\tasksDB\external\ai-career-roadmap\history
public\tasksDB\external\ai-career-roadmap\tour
public\tasksDB\external\extract-project-spec
public\tasksDB\external\first-graph
public\tasksDB\external\first-graph\tour
public\tasksDB\external\github-task-manager
public\tasksDB\external\github-task-manager\history
public\tasksDB\external\github-task-manager\tour
tests
tests\e2e
tests\graph-display
tests\unit
tools
tools\cloudflare-worker
tools\docs
tools\scripts
.github\workflows\deploy.yml
.github\workflows\validate-taskdb.yml
.gitignore
AGENTS.md
CONTRIBUTING.md
LICENSE
package.json
public\api\README.md
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
public\graph-display\templates\registry.json
public\health-check.html
public\index.html
public\README.md
public\scripts\folder-project-service.js
public\scripts\folder-project-ui.js
public\scripts\task-database.js
public\scripts\task-manager-app.js
public\scripts\template-automation.js
public\scripts\template-validator.js
public\styles.css
public\styles\task-manager.css
public\tasksDB\_examples\career\data.json
public\tasksDB\_examples\career\tour.json
public\tasksDB\_examples\task-management\data.json
public\tasksDB\_examples\task-management\tour.json
public\tasksDB\_schema\graph-template.schema.json
public\tasksDB\_templates\starter_project_template.csv
public\tasksDB\_templates\starter_project_template.json
public\tasksDB\_templates\starter_project_template_v2.json
public\tasksDB\external\ai-career-roadmap\history\.gitkeep
public\tasksDB\external\ai-career-roadmap\history\changes.ndjson
public\tasksDB\external\ai-career-roadmap\README.md
public\tasksDB\external\ai-career-roadmap\tasks.json
public\tasksDB\external\ai-career-roadmap\tour\graph-tour.json
public\tasksDB\external\extract-project-spec\structure.json
public\tasksDB\external\extract-project-spec\tasks.json
public\tasksDB\external\first-graph\tasks.json
public\tasksDB\external\first-graph\tour\graph-tour.json
public\tasksDB\external\github-task-manager\history\changes.ndjson
public\tasksDB\external\github-task-manager\history\tasks-root-legacy-20251211-200742.csv
public\tasksDB\external\github-task-manager\history\tasks-root-legacy-20251211-200742.json
public\tasksDB\external\github-task-manager\README.md
public\tasksDB\external\github-task-manager\tasks.json
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
tests\unit\folder-project-service.test.js
tests\unit\graph-data.test.js
tests\unit\projects-config.test.js
tests\unit\server-api.test.js
tests\unit\task-database.test.js
tests\unit\tasks-json-format.test.js
tests\unit\template-automation.test.js
tests\unit\tasks-template-config.test.js
tests\unit\template-validator.test.js
tests\unit\validate-schema.js
tmp-test-output.txt
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
    [suggested-core-file] public/scripts/task-manager-app.js — main task manager controller
    [suggested-core-file] public/scripts/task-database.js — task data and persistence layer
    [suggested-core-file] public/scripts/template-validator.js — task validation layer
    [suggested-core-file] public/scripts/template-automation.js — task automation helpers
    [suggested-core-file] public/graph-display/index.html — Template: interactive graph-based CV/portfolio. Replace the sample graph data with your own career, skills, and outcomes.
    [suggested-core-file] public/graph-display/js/main-graph.js — Main script for initializing and managing the Curriculum Graph. Imports data, CV generator, walkthrough, utilities. Uses CSS classes for color and manages accessibility. UPDATED: Touch interaction mir
    [suggested-core-file] public/graph-display/js/graph-data.js — graph data normalization layer
    [suggested-core-file] public/config/projects-config.js — runtime project selection config
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

structure from package.json:
    [file-summary] github-task-manager — Collaborative task management system integrated with GitHub for public collaboration
    [json-key] name: "github-task-manager"
    [json-key] version: "1.0.0"
    [json-key] description: "Collaborative task management system integrated with GitHub ..."
    [json-key] main: "public/scripts/task-manager-app.js"
    [json-key] scripts: {start, start:static, test, test:validate, validate:tasks, +22 more}
    [json-key] repository: {type, url}
    [json-key] keywords: [4 items]
    [json-key] author: "nlarchive"
    [json-key] license: "MIT"
    [json-key] bugs: {url}
    [json-key] homepage: "https://nlarchive.github.io/github-task-manager"
    [json-key] devDependencies: {@playwright/test, cross-env, eslint, gh-pages, prettier, +1 more}
    [json-key] dependencies: {github-task-manager}

structure from server.js:
    [file-summary] No top-level file docstring detected
    const TASK_FILE_CANDIDATES  «docstring: none»
    const DISCOVERY_IGNORED_DIRS  «docstring: none»
    function escapeCsvValue(value)  «docstring: none»
    function generatePersistedCSV(tasks = [])  «docstring: none»
    function getDuplicateTaskIds(tasks = [])  «docstring: none»
    function safeJoin(root, requestPath)  «docstring: none»
    function contentTypeFor(filePath)  «docstring: none»
    function sendJson(res, status, payload)  «docstring: none»
    function readBody(req)  «docstring: none»
    function readJsonFile(filePath)  «docstring: none»
    function normalizeRelativePath(value)  «docstring: none»
    function inferModuleDepartment(relativePath)  «docstring: none»
    function inferModuleType(relativePath, moduleData)  «docstring: none»
    function isTaskFileCandidate(fileName)  «docstring: none»
    function readDirectoryEntries(dirPath)  «docstring: none»
    function pickPreferredTaskFileName(entries)  «docstring: none»
    function discoverProjectTaskFiles(projectDir)  «docstring: none»
    function getTaskKey(task)  «docstring: none»
    function getTaskCode(task)  «docstring: none»
    function getTaskPredecessorKeys(task)  «docstring: none»
    function computeTaskFlowSummary(tasks)  «docstring: none»
    function scoreRootModuleCandidate(relativePath, rawData)  «docstring: none»
    function resolveRootModuleRelative(projectDir, tasksIndexData)  «docstring: none»
    function collectProjectModules(projectDir, rootModuleRelative)  «docstring: none»
    function buildRootRelativeModules(modules, rootModuleRelative)  «docstring: none»
    function buildProjectPayload(projectDir)  «docstring: none»
    function writeProjectPayload(projectDir, fullData)  «docstring: none»
    function ensureDir(dirPath)  «docstring: none»
    function sanitizeProjectId(value)  «docstring: none»
    function maybeBootstrapTasksDb(tasksDbDir, fallbackDir)  «docstring: none»
    function copyDirRecursive(sourceDir, targetDir)  «docstring: none»
    function writeStateFiles(tasksDbDir, fullData)  «docstring: none»
    function createServer({ publicDir, tasksDbDir, graphDir })  «docstring: none»

structure from tmp-test-output.txt:  (no extractable definitions)

structure from .github/workflows/deploy.yml:
    [file-summary] Deploy GitHub Task Manager
    [yaml-key] name: "Deploy GitHub Task Manager"
    [yaml-key] True: {push, pull_request, workflow_dispatch}
    [yaml-key] permissions: {contents, pages, id-token}
    [yaml-key] concurrency: {group, cancel-in-progress}
    [yaml-key] jobs: {build}
    [yaml-job] job: build (11 steps) — Build and Deploy

structure from .github/workflows/validate-taskdb.yml:
    [file-summary] Validate TaskDB (Schema + Commit Format)
    [yaml-key] name: "Validate TaskDB (Schema + Commit Format)"
    [yaml-key] True: {pull_request, push, workflow_dispatch}
    [yaml-key] permissions: {contents}
    [yaml-key] jobs: {validate}
    [yaml-job] job: validate (4 steps)

structure from public/README.md:
    [file-summary] Web GitHub Task Manager — Public Frontend
    [heading-1] # Web GitHub Task Manager — Public Frontend
    [heading-2] ## Top-level Files
    [heading-2] ## Core Runtime Files
    [heading-2] ## Sub-folders
    [heading-2] ## Application Modes
    [heading-3] ### 1. Task Manager List UI (`index.html`)
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

structure from public/health-check.html:
    [file-summary] GitHub Task Manager - Health Check
    [title] <title>GitHub Task Manager - Health Check</title>
    [heading-1] <h1>✓ GitHub Task Manager</h1>
    [heading-3] <h3>🎯 Project Status</h3>
    [heading-3] <h3>📊 Task Database</h3>
    [heading-3] <h3>🔧 Recent Changes</h3>
    [heading-3] <h3>⚠ Next Steps</h3>
    [heading-3] <h3>📋 Current Project Tasks</h3>

structure from public/index.html:
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

structure from public/styles.css:
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

structure from public/config/projects-config.js:
    [file-summary] No top-level file docstring detected
    const PROJECTS_CONFIG  «docstring: none»

structure from public/config/tasks-template-config.js:
    [file-summary] No top-level file docstring detected
    const TEMPLATE_CONFIG  «docstring: none»

structure from public/config/worker-url.js:
    [file-summary] No top-level file docstring detected
    function __resolveWorkerUrlRuntime()  «docstring: none»

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
    [file-summary] No top-level file docstring detected
    const CACHE_NAME  «docstring: none»
    const ASSET_PATHS  «docstring: none»
    precacheAssets = (cache) =>  «docstring: none»

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
    [file-summary] Interactive Career Graph - MOBILE-FIRST STYLESHEET (Template)
    [section] /* ========== Interactive Career Graph - MOBILE-FIRST STYLESHEET (Template) ======== */
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
    [file-summary] Interactive Career Graph - MAIN STYLESHEET (Template)
    [section] /* Interactive Career Graph - MAIN STYLESHEET (Template) */
    [section] /* END OF MAIN STYLESHEET */

structure from public/graph-display/css/styles.css:
    [file-summary] FULL CSS START
    [section] /* ==================== FULL CSS START ======================== */
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
    [section] /* ACCESSIBILITY COMPONENTS */
    [section] /* Skip Navigation Link */
    [selector] .skip-link
    [selector] .skip-link:focus

structure from public/graph-display/css/components/_base.css:
    [file-summary] BASE RESET & TYPOGRAPHY
    [section] /* BASE RESET & TYPOGRAPHY */
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
    [section] /* BUTTON COMPONENTS */
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
    [file-summary] COLOR UTILITIES & CLASSES
    [section] /* COLOR UTILITIES & CLASSES */
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
    [file-summary] D3 GRAPH VISUALIZATION
    [section] /* D3 GRAPH VISUALIZATION */
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
    [selector] .node.layer-0.color-variant-0 circle
    [selector] .node.layer-0.color-variant-1 circle
    [selector] .node.layer-0.color-variant-2 circle
    [selector] .node.layer-0.color-variant-3 circle
    [selector] .node.layer-0.color-variant-4 circle
    [section] /* Layer 1 (Foundations Blue) */
    [selector] .node.layer-1.color-variant-0 circle
    [selector] .node.layer-1.color-variant-1 circle
    [selector] .node.layer-1.color-variant-2 circle
    [selector] .node.layer-1.color-variant-3 circle
    [selector] .node.layer-1.color-variant-4 circle
    [section] /* Layer 2 (Skills Orange) */
    [selector] .node.layer-2.color-variant-0 circle
    [selector] .node.layer-2.color-variant-1 circle
    [selector] .node.layer-2.color-variant-2 circle
    [selector] .node.layer-2.color-variant-3 circle
    [selector] .node.layer-2.color-variant-4 circle
    [section] /* Layer 3 (Impact Green) */
    [selector] .node.layer-3.color-variant-0 circle
    [selector] .node.layer-3.color-variant-1 circle
    [selector] .node.layer-3.color-variant-2 circle
    [selector] .node.layer-3.color-variant-3 circle
    [selector] .node.layer-3.color-variant-4 circle
    [section] /* Layer 4 (Outcome Purple) */
    [selector] .node.layer-4.color-variant-0 circle
    [selector] .node.layer-4.color-variant-1 circle
    [selector] .node.layer-4.color-variant-2 circle
    [selector] .node.layer-4.color-variant-3 circle
    [selector] .node.layer-4.color-variant-4 circle
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

structure from public/graph-display/css/components/_header.css:
    [file-summary] HEADER & PROFILE BUTTON
    [section] /* HEADER & PROFILE BUTTON */
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
    [file-summary] MENU PANEL & SEARCH
    [section] /* MENU PANEL & SEARCH */
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
    [file-summary] Toggle button (floats bottom-left when modules are available)
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
    [file-summary] POPUPS & MODALS
    [section] /* POPUPS & MODALS */
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
    [selector] #popup .content .task-node-btn.task-node-nav-btn.task-node-btn-active
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
    [file-summary] RESPONSIVE & MOBILE OPTIMIZATIONS
    [section] /* RESPONSIVE & MOBILE OPTIMIZATIONS */
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
    [section] /* TOOLTIP */
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
    [file-summary] CSS VARIABLES & THEME CONFIGURATION
    [section] /* CSS VARIABLES & THEME CONFIGURATION */
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
    [section] /* WALKTHROUGH OVERLAY */
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
    function findChildNodes(parentNodeId, relationshipType, allLinks, nodeMap)  «docstring: none»
    function sortNodes(nodesToSort, method, details)  «docstring: none»
    function generateGenericSectionItems(sectionConfig, allLinks, nodeMap, details)  «Generates HTML list items for a generic section. Applies CSS classes for styling based on node properties.»
    function generateSkillsSectionInternal(sectionConfig, allLinks, nodeMap, details)  «Generates HTML for the skills section. Applies CSS classes for styling based on node properties.»
    function generateClassicCV(nodes, links, details, userConfig)  «Main function to generate and display the Classic CV in the popup. Relies on nodes having layer, colorVariantIndex, and »

structure from public/graph-display/js/d3.v7.min.js:
    [file-summary] No top-level file docstring detected
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
    [file-summary] No top-level file docstring detected
    const TEMPLATE_REGISTRY  «docstring: none»
    const INLINE_TASK_ID_PREFIX  «docstring: none»
    const GRAPH_NODES  «docstring: none»
    const GRAPH_LINKS  «docstring: none»
    const GRAPH_DETAILS  «docstring: none»
    function convertCypherToGraph(cypherData)  «Converts raw Cypher-like export data into D3 compatible nodes and links.»
    function normalizePriority(priority)  «docstring: none»
    function getTaskPredecessorIds(task, validTaskIds)  «docstring: none»
    function getDependencyLinkType(dep)  «docstring: none»
    function buildDependencyLayering(tasks)  «docstring: none»
    function scaleHoursToRadius(hours, minHours, maxHours, minRadius, maxRadius)  «docstring: none»
    function validateAgainstSchema(obj, schema)  «docstring: none»
    function resolveProjectIdFromTasksPath(path)  «docstring: none»
    function resolveProjectScopedBase(path)  «Return the scoped base path segment for a TaskDB URL. Examples: '/tasksDB/external/first-graph/tasks.json' → 'external/f»
    function normalizeTaskDbWalkthroughPath(pathValue, scopedBase)  «docstring: none»
    function buildEmbeddedTaskDbTemplate(entry, data, scopedBase, embeddedGraphName)  «docstring: none»
    function normalizeProjectRelativeModulePath(modulePath, entryPath)  «docstring: none»
    function normalizeNavigationModules(modules, entryPath)  «docstring: none»
    function buildInlineTaskIdPath(taskId)  «docstring: none»
    function parseInlineTaskPath(path)  «docstring: none»
    function hasOwnInlineSubtasks(task)  «docstring: none»
    function buildChildrenByParentTaskId(tasks)  «docstring: none»
    function collectDescendantTasks(childrenByParentId, parentTaskId, visited = new Set())  «docstring: none»
    function toFiniteNumber(...values)  «docstring: none»
    function normalizeInlineAssignedWorkers(subtask)  «docstring: none»
    function escapeHtml(value)  «docstring: none»
    function normalizeStringList(value, fallback = [])  «docstring: none»
    function normalizeAssignedWorkersList(task, fallbackTask = {})  «docstring: none»
    function buildPopupListDropdown(title, items, renderItem)  «docstring: none»
    function formatWorkerLabel(worker)  «docstring: none»
    function buildTaskSupplementalDetailItems(task)  «docstring: none»
    function normalizeInlineSubtaskTask(subtask, index, parentTask = {})  «docstring: none»
    function buildInlineSubgraphData(sourceData, task)  «docstring: none»
    function buildInlineSubtaskTargets(task, childrenByParentId)  «docstring: none»
    function normalizeExplicitSubtaskTargets(task)  «docstring: none»
    function resolveTaskSubtaskTargets(task, childrenByParentId)  «docstring: none»
    function getTaskNarrativeText(task)  «docstring: none»
    function resolveProjectEndConfig(project)  «docstring: none»
    function resolveProjectEndMode(project, terminalTasks)  «docstring: none»
    function buildProjectEndDetails(project, terminalTasks, totalProjectHours = 0)  «docstring: none»
    function buildProjectTaskTemplate(entry, data, options = {})  «docstring: none»
    function buildTaskManagementTemplate(entry, data, options = {})  «docstring: none»
    function isDevMode()  «docstring: none»
    function ensureDynamicTaskTemplate(requestedTemplateId, options = {})  «docstring: none»
    function initTemplates()  «docstring: none»
    function getAvailableTemplates()  «docstring: none»
    function loadTemplate(templateId)  «docstring: none»
    function getDefaultTemplateId()  «docstring: none»
    function buildProjectTaskTemplatePublic(entry, data, options)  «docstring: none»
    function buildInlineTaskSubgraphTemplatePublic(entry, data, inlinePath, options)  «docstring: none»

structure from public/graph-display/js/main-graph.js:
    [file-summary] Main script for initializing and managing the Curriculum Graph. Imports data, CV generator, walkthrough, utilities. Uses CSS classes for color and manages accessibility. UPDATED: Touch interaction mir
    const TEMPLATE_STORAGE_KEY  «docstring: none»
    class CurriculumGraph  «docstring: none»:
        constructor(elId, graphData, detailsData, cfg, templateContext = {})  «docstring: none»
        deepMerge(target, source)  «docstring: none»
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
        clearSelectedNodeState()  «docstring: none»
        hideNodeDetails({ clearSelection = false } = {})  «Hide node details popup. Selection persists unless clearSelection is explicitly requested.»
        setupZoom()  «Setup zoom behavior»
        setupControlButtons(panelEl)  «Setup control button actions in the menu panel»
        resetViewAndSearch()  «Reset graph view, zoom, clear search, and close popups»
        toggleGraphGuide()  «Toggle the graph types guide panel»
        populateGuidePanel()  «Populate the guide panel with graph structure information»
        focusOnNode(nodeId)  «Zoom and pan the graph to focus on a specific node»
        _openNodeDetails(d)  «Apply persistent node-selected state (same logic as handleShowDetails) without a triggering DOM event. Used by dep-link »
        openNodeModal(nodeId, { animate = true } = {})  «Pan & zoom to a node by ID, then open its detail modal and keep it selected with a permanent blink. Used by dep-link but»
        ticked()  «Simulation tick function: Update node and link positions»
        dragHandler()  «Drag handler definition for nodes»
        bindGlobalEvents()  «Bind global event listeners (resize, escape key)»
        handleResize()  «Handle window resize event»
        createFeedbackElement(inputContainerElement)  «Create search feedback element if it doesn't exist»
        setupSearch(inputId)  «Setup search input functionality»

    function isEmbeddedMode()  «docstring: none»
    function getInitialTemplateId()  «docstring: none»
    function setSelectedTemplateId(templateId)  «docstring: none»

structure from public/graph-display/js/template-loader.js:
    [file-summary] No top-level file docstring detected
    const CAREER_TEMPLATE_ID  «docstring: none»
    const TASK_MGMT_TEMPLATE_ID  «docstring: none»
    function tryRequireLocalTemplate(path)  «docstring: none»
    function buildCareerTemplateFromData(id, name, data, convertFn)  «docstring: none»
    function buildTaskMgmtFromData(id, name, data, helpers)  «docstring: none»
    function syncBuiltInTemplates(registry, convertFn, helpers = {})  «docstring: none»

structure from public/graph-display/js/utils.js:
    [file-summary] Utility functions for color manipulation, contrast checking, and debouncing.
    function debounce(func, wait)  «Debounce function delays execution until after wait milliseconds have elapsed since the last time the debounced function»
    function getLuminance(hexColor)  «Calculates the relative luminance of a color.»
    function getContrast(hexColor1, hexColor2)  «Calculates the contrast ratio between two colors.»
    function getContrastingTextColorClass(backgroundHex, lightTextHex = '#f0f0f0', darkTextHex = '#333333')  «Determines whether light or dark text provides better contrast against a background color. Targets WCAG AA (4.5:1) for n»
    function generateColorTones(baseHex, count, step = 0.7, direction = 'brighter', fallbackHex = '#aabbc8')  «Generates an array of color tones (hex strings) starting from a base color. Uses d3.color for manipulation. Ensures vali»

structure from public/graph-display/js/walkthrough.js:
    [file-summary] Manages the interactive walkthrough/tour of the graph interface. Relies on CurriculumGraph instance for interactions.
    class Walkthrough  «docstring: none»:
        constructor()  «docstring: none»
        setSteps(steps)  «Replace current walkthrough steps. Steps should be an array of step objects. Example step: { title, content, nodeId, tar»
        init()  «docstring: none»
        setGraph(graphInstance)  «docstring: none»
        bindEvents()  «docstring: none»
        handleNext()  «docstring: none»
        start()  «docstring: none»
        startTour()  «docstring: none»
        nextStep()  «docstring: none»
        executeStepActions()  «docstring: none»
        updateTooltipContent()  «docstring: none»
        positionTooltip()  «docstring: none»
        simulateNodeHover(nodeElement)  «docstring: none»
        _createCursor(targetElement)  «docstring: none»
        _removeCursor()  «docstring: none»
        simulateNodeClick(nodeElement)  «docstring: none»
        simulateSearch(searchTerm)  «docstring: none»
        ensureNodeTextVisibility(nodeElement)  «docstring: none»
        end()  «docstring: none»

    function debounce(func, wait)  «docstring: none»

structure from public/graph-display/js/shared/link-types.js:
    [file-summary] Shared link-type definitions and helpers.
    const COMMON_LINK_TYPES  «Shared link-type definitions and helpers.»
    const TASK_LINK_TYPES  «docstring: none»
    const TEMPLATE_LINK_TYPES  «Useful for UIs (legend/debug): shared + template-specific types.»
    function isDependsLinkType(type)  «docstring: none»
    function isSubcategoryLinkType(type)  «docstring: none»
    function isStrongCohesionLinkType(type)  «docstring: none»
    function isLayerSpacingLinkType(type)  «docstring: none»
    function getForceLinkDistance(linkType, forcesCfg)  «Returns the link distance to use for a link type. Mirrors existing behavior in main-graph.js, but centralized.»
    function getForceLinkStrength(linkType)  «Returns the link force strength to use for a link type. Mirrors existing behavior in main-graph.js, but centralized.»

structure from public/graph-display/js/shared/tours.js:
    [file-summary] Generates/returns walkthrough steps for different templates. - If a template provides `meta.walkthroughSteps` (array), use that. - Otherwise generate sensible steps from nodes/details for known templa
    function getStepsForTemplate(templateId, nodes = [], details = {}, meta = {})  «Generates/returns walkthrough steps for different templates. - If a template provides `meta.walkthroughSteps` (array), u»
    function resolveTourUrl(path, basePath)  «docstring: none»
    function resolveStepsForTemplate(templateId, nodes = [], details = {}, meta = {}, basePath = './')  «Resolve steps for a template. Priority: 1) meta.walkthroughSteps (inline) 2) meta.walkthroughStepsPath (JSON file) 3) Ge»

structure from public/graph-display/templates/registry.json:
    [json-array] [5 items]

structure from public/scripts/folder-project-service.js:  (no extractable definitions)

structure from public/scripts/folder-project-ui.js:  (no extractable definitions)

structure from public/scripts/task-database.js:
    [file-summary] No top-level file docstring detected
    class TaskDatabase  «docstring: none»:
        constructor(githubApi, validator = new TemplateValidator(), automation = new TemplateAutomation())  «docstring: none»
        resetLoadedMetadata()  «docstring: none»
        applyLoadedPayload(data)  «docstring: none»
        cloneTasksSnapshot(tasks)  «docstring: none»
        getHistoryTaskKey(task)  «docstring: none»
        summarizeHistoryChanges(changes)  «docstring: none»
        diffTasksForHistory(beforeTasks, afterTasks)  «docstring: none»
        async appendHistoryNdjsonViaWorkerFallback({ projectId, workerUrl, accessPassword, tasksFile, message, actor, commitSha, beforeTasks, afterTasks })  «docstring: none»
        resolveActor()  «docstring: none»
        isLocalDevHost()  «docstring: none»
        buildFullData(tasks = this.tasks)  «docstring: none»
        generateStateFiles(tasks = this.tasks)  «docstring: none»
        async saveTasksLocalDisk(message = 'Update tasks')  «docstring: none»
        async initialize()  «docstring: none»
        async loadTasks()  «docstring: none»
        getDuplicateTaskIds(tasks = this.tasks)  «docstring: none»
        escapeCsvValue(value)  «docstring: none»
        generatePersistedCSV(tasks = this.tasks)  «docstring: none»
        saveTasksLocal(message = 'Update tasks')  «docstring: none»
        async saveTasks(message = 'Update tasks')  «docstring: none»
        async saveTasksViaWorker(message, workerUrl)  «docstring: none»
        getSessionAccessPassword()  «docstring: none»
        async saveTasksDirectGitHub(message)  «docstring: none»
        async loadTemplates()  «docstring: none»
        async importFromTemplate(template, options = {})  «docstring: none»
        exportToCSV(tasks = null)  «docstring: none»
        importFromCSV(csvContent, options = {})  «docstring: none»
        parseCSVLine(line)  «docstring: none»
        createTask(taskData, creatorId = null)  «docstring: none»
        updateTask(taskId, updates)  «docstring: none»
        deleteTask(taskId)  «docstring: none»
        getTask(taskId)  «docstring: none»
        getTasks(filters = {})  «docstring: none»
        getStatistics()  «docstring: none»

    function inferProjectIdFromTasksFile(tasksFile)  «docstring: none»
    function resolveTemplateConfig()  «docstring: none»
    function hasValidGitHubToken()  «docstring: none»
    function resolveActiveProjectId()  «docstring: none»
    function getProjectScopedStorageKey()  «docstring: none»

structure from public/scripts/task-manager-app.js:
    [file-summary] No top-level file docstring detected
    class TaskManagerApp  «docstring: none»:
        constructor()  «docstring: none»
        getGraphTemplateIdForActiveProject()  «docstring: none»
        getStoredFolderProjects()  «docstring: none»
        registerFolderProjectOption(projectRecord)  «docstring: none»
        initializeFolderProjectPicker()  «docstring: none»
        buildGraphIframeSrc()  «docstring: none»
        async ensureGraphIframeLoaded()  «docstring: none»
        async initialize()  «docstring: none»
        loadConfig()  «docstring: none»
        setupProjectSelector()  «docstring: none»
        async setActiveProject(projectId)  «docstring: none»
        normalizeModulePath(value)  «docstring: none»
        normalizeModuleEntry(moduleEntry)  «docstring: none»
        getTaskKey(task)  «docstring: none»
        getTaskCode(task)  «docstring: none»
        getTaskPredecessorKeys(task)  «docstring: none»
        buildTaskFlowSummary(tasks = [])  «docstring: none»
        applyProjectTheme()  «docstring: none»
        updateTaskAuthoringAvailability()  «docstring: none»
        syncProjectContextFromDatabase()  «docstring: none»
        getModuleByPath(modulePath)  «docstring: none»
        getModuleByName(moduleName)  «docstring: none»
        getContextBaseTasks()  «docstring: none»
        filterTaskCollection(tasks, { status = null, priority = null } = {})  «docstring: none»
        resolveTaskModulePath(task)  «docstring: none»
        supportsTaskEditing(task)  «docstring: none»
        formatDisplayDate(value)  «docstring: none»
        encodeModulePath(modulePath)  «docstring: none»
        getModuleFetchCandidates(projectId, modulePath)  «docstring: none»
        async fetchModuleData(modulePath)  «docstring: none»
        buildModuleContextTasks(moduleEntry, moduleData, modulePath = '')  «docstring: none»
        getActiveModuleLabel()  «docstring: none»
        syncGraphModuleState()  «docstring: none»
        async setActiveModule(modulePath, options = {})  «docstring: none»
        async restoreCurrentContext(options = {})  «docstring: none»
        openModuleView(encodedModulePath)  «docstring: none»
        openModuleRelation(encodedModuleName)  «docstring: none»
        clearModuleView()  «docstring: none»
        toggleProjectNavigationPanel()  «docstring: none»
        renderProjectNavigation()  «docstring: none»
        getAvailableCategoryNames()  «docstring: none»
        refreshCategoryOptions({ preserveValue = true } = {})  «docstring: none»
        getProjectAuthKey(projectId)  «docstring: none»
        getProjectPasswordKey(projectId)  «docstring: none»
        loadUserName()  «docstring: none»
        saveUserName(name)  «docstring: none»
        getAccessConfig()  «docstring: none»
        isGitHubPagesHost()  «docstring: none»
        getQueryParam(name)  «docstring: none»
        isLocalHost()  «docstring: none»
        isPasswordProtectionEnabled()  «docstring: none»
        isPasswordProtected()  «docstring: none»
        checkAuth()  «docstring: none»
        requireAuth(action, ...args)  «docstring: none»
        showPasswordModal()  «docstring: none»
        closePasswordModal()  «docstring: none»
        async verifyPassword(event)  «docstring: none»
        logout()  «docstring: none»
        getGitHubOAuthToken()  «docstring: none»
        setGitHubOAuthToken(token, user = '')  «docstring: none»
        clearGitHubOAuthToken()  «docstring: none»
        isGitHubConnected()  «docstring: none»
        showGitHubLoginModal()  «docstring: none»
        closeGitHubLoginModal()  «docstring: none»
        async startGitHubDeviceFlow()  «docstring: none»
        showManualOAuthInstructions()  «docstring: none»
        showGitHubLoginError(message)  «docstring: none»
        copyDeviceCode()  «docstring: none»
        updateAccessIndicator()  «docstring: none»
        toggleAuthIndicator()  «docstring: none»
        isConfigured()  «docstring: none»
        showConfigError()  «docstring: none»
        async showTaskManager()  «docstring: none»
        async loadTasks()  «docstring: none»
        async saveTasks()  «docstring: none»
        openHistoryModal()  «docstring: none»
        closeHistoryModal()  «docstring: none»
        setHistoryStatus(message, type = 'info')  «docstring: none»
        getWorkerUrl()  «docstring: none»
        getRawHistoryUrl(projectId)  «docstring: none»
        applyHistoryFilter()  «docstring: none»
        async refreshHistory()  «docstring: none»
        async loadHistoryItems({ projectId, taskId = '', limit = 200 })  «docstring: none»
        renderHistory(items)  «docstring: none»
        renderTasks()  «docstring: none»
        setViewMode(mode)  «docstring: none»
        updateViewToggle()  «docstring: none»
        setTimelineScale(scale)  «docstring: none»
        parseDate(dateStr)  «docstring: none»
        daysBetween(a, b)  «docstring: none»
        formatShortDate(d)  «docstring: none»
        renderTimeline()  «docstring: none»
        openIssuesSyncModal()  «docstring: none»
        _openIssuesSyncModal()  «docstring: none»
        closeIssuesSyncModal()  «docstring: none»
        setIssuesSyncStatus(message, type = 'info')  «docstring: none»
        async loadIssuesForSync()  «docstring: none»
        renderIssuesList()  «docstring: none»
        isIssueAlreadyImported(issueNumber)  «docstring: none»
        async importSelectedIssues()  «docstring: none»
        _importSelectedIssues()  «docstring: none»
        async _importSelectedIssuesAsync()  «docstring: none»
        getLinkedIssue(task)  «docstring: none»
        createIssueForTask(taskId)  «docstring: none»
        async _createIssueForTask(taskId)  «docstring: none»
        updateStats(taskSource = null)  «docstring: none»
        setActiveStatCard(statusValue)  «docstring: none»
        setupStatCardFilters()  «docstring: none»
        filterTasks()  «docstring: none»
        showAddTaskModal()  «docstring: none»
        _showAddTaskModal()  «docstring: none»
        editTask(taskId)  «docstring: none»
        openTaskDetail(taskIndex)  «Open task detail by filteredTasks index (works for all task types, numeric and string IDs).»
        _openReadOnlyTask(task)  «docstring: none»
        _injectReadOnlyDepLinks(task)  «In read-only task detail: hide the deps textarea and show clickable dep-link buttons. Each button navigates to the prede»
        navigateToDependency(predecessorId)  «Close the current modal and open the task detail for the specified predecessor task ID. Works across root tasks and the »
        _editTask(taskId)  «docstring: none»
        setTaskModalReadOnly(readOnly = false)  «docstring: none»
        populateFormWithDefaults()  «docstring: none»
        populateFormWithTask(task)  «docstring: none»
        closeModal()  «docstring: none»
        async saveTask(event)  «docstring: none»
        getFormData()  «docstring: none»
        parseAssignedWorkers(input)  «docstring: none»
        parseDependencies(input)  «docstring: none»
        parseParentTaskId(value)  «docstring: none»
        async deleteTask(taskId)  «docstring: none»
        async _deleteTask(taskId)  «docstring: none»
        updateTemplateUI()  «docstring: none»
        async importTemplate(templateType)  «docstring: none»
        exportToCSV()  «docstring: none»
        showValidationMessages(errors, warnings)  «docstring: none»
        clearValidationMessages()  «docstring: none»
        escapeHtml(text)  «docstring: none»
        showLoading()  «docstring: none»
        hideLoading()  «docstring: none»
        showToast(message, type = 'success')  «docstring: none»
        setupEventListeners()  «docstring: none»

    class GitHubAPI  «docstring: none»:
        constructor(config)  «docstring: none»
        async request(endpoint, method = 'GET', body = null)  «docstring: none»
        async getFileContent(path)  «docstring: none»
        async updateFile(path, content, message, sha = null)  «docstring: none»
        async listIssues(state = 'open')  «docstring: none»
        async createIssue(title, body, labels = [])  «docstring: none»

    function showAddTaskModal()  «docstring: none»
    function closeModal()  «docstring: none»
    function exportToCSV()  «docstring: none»
    function loadTasks()  «docstring: none»
    function closePasswordModal()  «docstring: none»
    function verifyPassword(event)  «docstring: none»

structure from public/scripts/template-automation.js:
    [file-summary] No top-level file docstring detected
    class TemplateAutomation  «docstring: none»:
        constructor(config = TEMPLATE_CONFIG, validator = new TemplateValidator())  «docstring: none»
        generateTaskId(existingTasks = [])  «docstring: none»
        autoPopulateTask(task, template = null, creatorId = null)  «docstring: none»
        autoPopulateProject(project)  «docstring: none»
        createTaskFromTemplate(templateTask, template, customizations = {})  «docstring: none»
        autoGenerateDependencies(tasks)  «docstring: none»
        suggestAssignments(task, workers)  «docstring: none»
        calculateSkillMatch(taskTags, workerSkills)  «docstring: none»
        autoCategorize(task, categories)  «docstring: none»
        validateAndFix(task, template = null)  «docstring: none»
        generateProjectSummary(template)  «docstring: none»


structure from public/scripts/template-validator.js:
    [file-summary] No top-level file docstring detected
    class TemplateValidator  «docstring: none»:
        constructor(config = TEMPLATE_CONFIG)  «docstring: none»
        validate(data, type = 'task')  «docstring: none»
        validateTemplate(template)  «docstring: none»
        validateProject(project)  «docstring: none»
        validateTask(task, template = null)  «docstring: none»
        validateCategories(categories)  «docstring: none»
        validateWorkers(workers)  «docstring: none»
        validateDependencies(tasks)  «docstring: none»
        isValidDate(dateString)  «docstring: none»
        isValidEmail(email)  «docstring: none»
        normalizeStatus(status)  «docstring: none»


structure from public/styles/task-manager.css:
    [file-summary] GitHub Task Manager - Responsive & Touch-Optimized CSS
    [section] /* GitHub Task Manager - Responsive & Touch-Optimized CSS */
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
    [json-array] [6 items]

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

structure from public/tasksDB/external/ai-career-roadmap/tasks.json:
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

structure from public/tasksDB/external/ai-career-roadmap/history/.gitkeep:  (no extractable definitions)

structure from public/tasksDB/external/ai-career-roadmap/history/changes.ndjson:  (no extractable definitions)

structure from public/tasksDB/external/ai-career-roadmap/tour/graph-tour.json:
    [json-array] [9 items]

structure from public/tasksDB/external/extract-project-spec/structure.json:
    [json-key] rawNodes: [22 items]
    [json-key] rawRelationships: [21 items]
    [json-key] details: {root, file:README.md, file:parsers/css_parser.py, file:parsers/csv_parser.py, file:parsers/html_parser.py, +14 more}
    [json-key] meta: {walkthroughEnabled}
    [json-key] configOverrides: {}

structure from public/tasksDB/external/extract-project-spec/tasks.json:
    [json-key] project: {name, description, start_date, end_date, status, +2 more}
    [json-key] categories: [8 items]
    [json-key] workers: [1 items]
    [json-key] tasks: [23 items]
    [json-key] meta: {legendMode, walkthroughEnabled}
    [json-key] configOverrides: {colorMode, sizeMode, taskSizing}

structure from public/tasksDB/external/first-graph/tasks.json:
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
    [heading-3] ### tasks.json
    [heading-3] ### tasks.csv
    [heading-3] ### history/
    [heading-2] ## Data Synchronization
    [heading-2] ## Adding Tasks Through UI
    [heading-2] ## Manual Updates
    [heading-3] ### JSON
    [heading-3] ### CSV
    [heading-2] ## Schema Validation
    [heading-2] ## Backup & Recovery
    [heading-2] ## Integration Points
    [heading-2] ## Best Practices
    [heading-2] ## Future Enhancements

structure from public/tasksDB/external/github-task-manager/tasks.json:
    [json-key] project: {name, description, start_date, end_date, status, +2 more}
    [json-key] categories: [19 items]
    [json-key] workers: [3 items]
    [json-key] tasks: [31 items]

structure from public/tasksDB/external/github-task-manager/history/changes.ndjson:  (no extractable definitions)

structure from public/tasksDB/external/github-task-manager/history/tasks-root-legacy-20251211-200742.csv:
    [csv-column] [col 1] task_id
    [csv-column] [col 2] task_name
    [csv-column] [col 3] description
    [csv-column] [col 4] start_date
    [csv-column] [col 5] end_date
    [csv-column] [col 6] priority
    [csv-column] [col 7] status
    [csv-column] [col 8] progress_percentage
    [csv-column] [col 9] estimated_hours
    [csv-column] [col 10] actual_hours
    [csv-column] [col 11] is_critical_path
    [csv-column] [col 12] category_name
    [csv-column] [col 13] parent_task_id
    [csv-column] [col 14] creator_id
    [csv-column] [col 15] created_date
    [csv-column] [col 16] completed_date

structure from public/tasksDB/external/github-task-manager/history/tasks-root-legacy-20251211-200742.json:
    [json-key] project: {name, description, start_date, end_date, status, +1 more}
    [json-key] categories: [7 items]
    [json-key] workers: [3 items]
    [json-key] tasks: [63 items]

structure from public/tasksDB/external/github-task-manager/tour/graph-tour.json:
    [json-array] [8 items]

structure from tests/playwright.config.js:  (no extractable definitions)

structure from tests/run-tests.js:
    [file-summary] Test Runner for GitHub Task Manager Runs all component tests and reports results
    function main()  «docstring: none»

structure from tests/e2e/crud-operations.spec.js:
    [file-summary] No top-level file docstring detected
    const BASE_URL  «docstring: none»
    const TIMEOUT  «docstring: none»
    function waitForAppReady(page)  «docstring: none»
    [describe] GitHub Task Manager - Create Task  «docstring: none»
    [describe] GitHub Task Manager - Edit Task  «docstring: none»
    [describe] GitHub Task Manager - Delete Task  «docstring: none»
    [describe] GitHub Task Manager - Filter & Search  «docstring: none»
    [describe] GitHub Task Manager - Refresh & Persistence  «docstring: none»
    [describe] GitHub Task Manager - CSV Export  «docstring: none»
    [describe] GitHub Task Manager - Statistics  «docstring: none»
    [describe] GitHub Task Manager - UI/UX  «docstring: none»

structure from tests/e2e/graph-fullscreen.spec.js:
    [file-summary] No top-level file docstring detected
    const BASE_URL  «docstring: none»
    const TIMEOUT  «docstring: none»
    function waitForAppReady(page)  «docstring: none»
    [describe] Graph Fullscreen  «docstring: none»

structure from tests/e2e/live-multi-project-saves.spec.js:
    [file-summary] No top-level file docstring detected
    const LIVE_URL  «Live Site Multi-Project Save Tests Tests that saves persist to the correct GitHub repo when switching projects on the de»
    const TIMEOUT  «docstring: none»
    const LIVE_PASSWORD_GITHUB_TASK_MANAGER  «docstring: none»
    const LIVE_PASSWORD_AI_CAREER_ROADMAP  «docstring: none»
    const RUN_LIVE  «docstring: none»
    function selectProjectAndWait(page, projectId, { expectTaskText, minTotalTasks, maxTotalTasks } = {})  «docstring: none»
    function waitForAppReady(page)  «docstring: none»
    function getWorkerUrl(page)  «docstring: none»
    function getTasksFile(page)  «docstring: none»
    function getRepoInfo(page)  «docstring: none»
    function unlockProject(page, password)  «docstring: none»
    function createTestTask(page, taskName = 'Test Task ' + Math.random().toString(36).slice(2,8))  «docstring: none»
    function editFirstTask(page, newName = 'Edited Task ' + Math.random().toString(36).slice(2,8))  «docstring: none»
    function waitForSaveToast(page, expectedText, timeout = 10000)  «docstring: none»
    [describe] @live Live Site - Multi-Project GitHub Saves  «docstring: none»

structure from tests/e2e/module-navigation.spec.js:
    [file-summary] No top-level file docstring detected
    const TIMEOUT  «docstring: none»
    function waitForAppReady(page)  «docstring: none»
    [describe] module navigation sync  «docstring: none»

structure from tests/e2e/password-timeline-issues.spec.js:
    [file-summary] No top-level file docstring detected
    const BASE_URL  «docstring: none»
    const LIVE_URL  «docstring: none»
    const TIMEOUT  «docstring: none»
    const LIVE_PASSWORD  «docstring: none»
    const LIVE_PASSWORD_AI_CAREER_ROADMAP  «docstring: none»
    const RUN_LIVE  «docstring: none»
    function waitForAppReady(page)  «docstring: none»
    [describe] New Features - Password / Timeline / Issues  «docstring: none»
    [describe] Live Site - Password Protection & New Features  «docstring: none»

structure from tests/e2e/smoke.spec.js:
    [file-summary] Smoke tests: app boot and basic create task flow.
    const TIMEOUT  «docstring: none»
    function waitForAppReady(page)  «docstring: none»
    function unlockIfNeeded(page)  «docstring: none»
    [describe] @smoke app boot + create task  «docstring: none»

structure from tests/e2e/update-task-via-ui.spec.js:
    [file-summary] No top-level file docstring detected
    const BASE_URL  «docstring: none»
    const TIMEOUT  «docstring: none»
    function waitForAppReady(page)  «Wait for the app to be ready and all tasks loaded»
    function updateTaskViaUI(page, taskId, taskData)  «Update a task by task ID through the UI»
    function createTaskViaUI(page, taskData)  «Create a new task with specified data»
    [describe] Update Tasks Via UI Automation  «docstring: none»

structure from tests/e2e/verify-commit-structure.spec.js:
    [file-summary] No top-level file docstring detected
    const LIVE_URL  «docstring: none»
    const TIMEOUT  «docstring: none»
    const RUN_LIVE  «docstring: none»
    const LIVE_PASSWORD_AI_CAREER_ROADMAP  «docstring: none»
    function waitForSaveToast(page, expectedText, timeout = 15000)  «docstring: none»
    function pollForCommitWithMessageContaining(page, repoOwner, repoName, needle, timeout = TIMEOUT)  «docstring: none»
    function extractTaskDbCommitPayload(message)  «docstring: none»
    [describe] @live Verify commit subject + payload structure  «docstring: none»

structure from tests/e2e/visual-states.spec.js:
    [file-summary] No top-level file docstring detected
    [describe] Task Visual States  «docstring: none»

structure from tests/graph-display/graph-display.spec.js:
    [file-summary] No top-level file docstring detected
    function parseTranslate(transform)  «docstring: none»
    [describe] graph-display task-management template  «docstring: none»

structure from tests/graph-display/inline-subtask-navigation.spec.js:
    [file-summary] No top-level file docstring detected
    function waitForNodeCount(page, minimum)  «docstring: none»
    [describe] inline subtask navigation  «docstring: none»

structure from tests/graph-display/playwright.config.js:  (no extractable definitions)

structure from tests/graph-display/server.js:
    [file-summary] No top-level file docstring detected
    function contentTypeFor(filePath)  «docstring: none»
    function safeJoin(root, requestPath)  «docstring: none»

structure from tests/graph-display/web-e2e-bussines-navigation.spec.js:
    [file-summary] No top-level file docstring detected
    function waitForNodeCount(page, minimum)  «docstring: none»
    [describe] web-e2e-bussines graph navigation  «docstring: none»

structure from tests/unit/folder-project-service.test.js:
    [file-summary] No top-level file docstring detected
    function loadFolderProjectService(initialStorage = {})  «docstring: none»
    [describe] Folder Project Service  «docstring: none»

structure from tests/unit/graph-data.test.js:
    [file-summary] No top-level file docstring detected
    function loadGraphDataModule(windowMock = { location: { pathname: '/public/graph-display/index.html', hostname: '127.0.0.1', search: '' } }, fetchMock = async () => ({ ok: false, status: 404, json: async () => ({}) })  «docstring: none»
    [describe] Graph Data Module  «docstring: none»

structure from tests/unit/projects-config.test.js:
    [file-summary] Projects Config Tests Verify that a centralized PROJECTS_CONFIG is loaded and applied to TEMPLATE_CONFIG
    const TEMPLATE_CONFIG  «docstring: none»
    [describe] PROJECTS_CONFIG override  «docstring: none»

structure from tests/unit/server-api.test.js:
    [file-summary] Server API Tests Validates local disk persistence API and derived state files generation.
    function httpRequest({ port, method, path: reqPath, body, headers = {} })  «docstring: none»
    [describe] Server API - /api/tasks  «docstring: none»

structure from tests/unit/task-database.test.js:
    [file-summary] Task Database Tests Tests for task storage and operations
    const TEMPLATE_CONFIG  «docstring: none»
    const TemplateValidator  «docstring: none»
    const TemplateAutomation  «docstring: none»
    class MockGitHubAPI  «docstring: none»:
        constructor()  «docstring: none»
        async getFileContent(path)  «docstring: none»
        async updateFile(path, content, message, sha)  «docstring: none»

    [describe] TaskDatabase Initialization  «docstring: none»
    [describe] Task CRUD Operations  «docstring: none»
    [describe] Task Filtering  «docstring: none»
    [describe] Statistics Generation  «docstring: none»
    [describe] TaskDatabase Persistence  «docstring: none»

structure from tests/unit/tasks-json-format.test.js:
    [file-summary] tasks.json format validation tests.
    const TASKS_DB_ROOT  «docstring: none»
    const VALID_PROJECT_STATUS  «docstring: none»
    const VALID_TASK_STATUS  «docstring: none»
    const VALID_PRIORITY  «docstring: none»
    const VALID_DEP_TYPES  «docstring: none»
    const DATE_RE  «docstring: none»
    function findTasksJsonFiles(dir, results = [])  «docstring: none»
    function validateTasksJson(filePath)  «docstring: none»
    [describe] tasks.json format validation  «docstring: none»

structure from tests/unit/template-automation.test.js:
    [file-summary] Template Automation Tests Tests for automated field population
    const TEMPLATE_CONFIG  «docstring: none»
    const TemplateValidator  «docstring: none»
    const TemplateAutomation  «docstring: none»
    [describe] TemplateAutomation Initialization  «docstring: none»
    [describe] Task ID Generation  «docstring: none»
    [describe] Auto-populate Task  «docstring: none»
    [describe] Auto-populate Project  «docstring: none»
    [describe] Skill Match Calculation  «docstring: none»
    [describe] v3 Agentic Field Auto-Population  «docstring: none»
    [describe] v3 Project Auto-Population  «docstring: none»
    [describe] validateAndFix v3 Support  «docstring: none»

structure from tests/unit/tasks-template-config.test.js:
    [file-summary] Template Config Tests Tests for TEMPLATE_CONFIG structure and values
    const TEMPLATE_CONFIG  «docstring: none»
    [describe] TEMPLATE_CONFIG Structure  «docstring: none»
    [describe] FIELD_CATEGORIES  «docstring: none»
    [describe] ENUMS Validation  «docstring: none»
    [describe] v3 Defaults  «docstring: none»
    [describe] v3 Optional Fields  «docstring: none»
    [describe] STATUS_NORMALIZATION v3  «docstring: none»
    [describe] GITHUB Configuration  «docstring: none»
    [describe] CATEGORIES List  «docstring: none»

structure from tests/unit/template-validator.test.js:
    [file-summary] Template Validator Tests Tests for validation logic
    const TEMPLATE_CONFIG  «docstring: none»
    const TemplateValidator  «docstring: none»
    [describe] TemplateValidator Initialization  «docstring: none»
    [describe] Date Validation  «docstring: none»
    [describe] Email Validation  «docstring: none»
    [describe] Status Normalization  «docstring: none»
    [describe] Task Validation  «docstring: none»
    [describe] Project Validation  «docstring: none»
    [describe] v3 Task Field Validation  «docstring: none»

structure from tests/unit/validate-schema.js:
    [file-summary] Schema Validation Script Validates tasks.json against the template schema
    const PROJECT_STATUS  «docstring: none»
    const TASK_STATUS  «docstring: none»
    const TASK_PRIORITY  «docstring: none»
    const DEPENDENCY_TYPES  «docstring: none»
    function validateRequired(obj, fields, prefix = '')  «docstring: none»
    function validateEnum(value, validValues, fieldName)  «docstring: none»
    function validateDateFormat(dateStr, fieldName)  «docstring: none»

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
    [file-summary] No top-level file docstring detected
    function getEnvVar(keys)  «docstring: none»
    function checkRepoToken({ owner, repo, branch, path }, token)  «docstring: none»

structure from tools/cloudflare-worker/worker.js:
    [file-summary] No top-level file docstring detected
    const ALLOWED_ORIGINS  «docstring: none»
    const ALLOWED_PATHS  «docstring: none»
    function getTokenForProject(projectId, env)  «docstring: none»
    function safeProjectId(value)  «docstring: none»
    function normalizeScope(value)  «docstring: none»
    function getProjectBasePath(cfg)  «docstring: none»
    function getProjectConfig(projectId, env)  «docstring: none»
    function getFileContentAndShaForRepo({ owner, repo, branch }, filePath, token)  «docstring: none»
    function safeJsonParse(text, fallback = null)  «docstring: none»
    function getTaskKey(task)  «docstring: none»
    function summarizeChanges(changes)  «docstring: none»
    function diffTasks(oldTasks, newTasks)  «docstring: none»
    function appendNdjsonEvents(projectId, token, events, env)  «docstring: none»
    function handleGetTaskHistory(request, env, origin)  «docstring: none»
    function handleTasksUpdate(request, env, origin)  «docstring: none»
    function handleCORS(request)  «docstring: none»
    function jsonResponse(data, origin, status = 200)  «docstring: none»

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
    [file-summary] No top-level file docstring detected
    function pad2(n)  «docstring: none»
    function timestamp()  «docstring: none»
    function escapeCsvValue(value)  «docstring: none»
    function generatePersistedCSV(tasks = [])  «docstring: none»
    function main()  «docstring: none»

structure from tools/scripts/enrich-tasks-workers.js:
    [file-summary] enrich-tasks-workers.js ---------------------- Adds/normalizes tasks/workers expectation fields on a TaskDB JSON file.
    function isNonEmptyString(v)  «docstring: none»
    function uniq(arr)  «docstring: none»
    function loadJson(filePath)  «docstring: none»
    function saveJson(filePath, obj)  «docstring: none»
    function buildTasksById(tasks)  «docstring: none»
    function taskRefToRequisiteString(ref, tasksById)  «docstring: none»
    function normalizeRequisites(task, tasksById)  «docstring: none»
    function roleToSkills(role)  «docstring: none»
    function categoryToRequisites(categoryName)  «docstring: none»
    function tagsToRequisites(tags)  «docstring: none»
    function inferReviewerRole(task)  «docstring: none»
    function main(argv = process.argv)  «docstring: none»

structure from tools/scripts/generate-state-files.js:
    [file-summary] generate-state-files.js ----------------------- Generates derived state JSON files from public/tasksDB/<scope>/<project>/tasks.json Output: public/tasksDB/<scope>/<project>/state/*.json Usage: node to
    function ensureDir(dirPath)  «docstring: none»
    function writeJson(filePath, data)  «docstring: none»
    function generateStateData(tasks)  «docstring: none»
    function main()  «docstring: none»

structure from tools/scripts/prepare-public-graph.js:
    [file-summary] No top-level file docstring detected
    function copyGraphDisplayIntoPublic()  «docstring: none»

structure from tools/scripts/regenerate-tasks-csv.js:
    [file-summary] regenerate-tasks-csv.js ------------------------ Generates a flattened CSV export from public/tasksDB/<scope>/<project>/tasks.json Output: public/tasksDB/<scope>/<project>/tasks.csv Usage: node tools/
    function escapeCsvValue(value)  «docstring: none»
    function main()  «docstring: none»

structure from tools/scripts/setup.bat:  (no extractable definitions)

structure from tools/scripts/setup.js:
    [file-summary] No top-level file docstring detected
    const GH_TOKEN  «docstring: none»
    function question(prompt)  «docstring: none»
    function exec(cmd, options = {})  «docstring: none»
    function main()  «docstring: none»

structure from tools/scripts/validate-commit-format.js:
    [file-summary] TaskDB Commit Format Validator
    function parseArgs(argv)  «docstring: none»
    function git(cmd)  «docstring: none»
    function extractTaskDbPayload(commitBody)  «docstring: none»
    function validateSubject(subject)  «docstring: none»
    function determineRange(args)  «docstring: none»
    function listCommits(range, max)  «docstring: none»
    function main()  «docstring: none»

structure from tools/scripts/validate-tasks-schema.js:
    [file-summary] TaskDB Task Schema Validator
    function parseArgs(argv)  «docstring: none»
    function sanitizeProjectId(s)  «docstring: none»
    function loadTasksJson(projectId)  «docstring: none»
    function isValidDateYYYYMMDD(dateStr)  «docstring: none»
    function hasTimestampPollution(taskName)  «docstring: none»
    function validateProjectFile(projectId, tasksJson)  «docstring: none»
    function main()  «docstring: none»

structure from tools/scripts/validate-tasks-workers.js:
    [file-summary] validate-tasks-workers.js ------------------------ Validates tasks/workers expectation fields on TaskDB projects.
    function parseArgs(argv)  «docstring: none»
    function sanitizeProjectId(s)  «docstring: none»
    function loadProjectTasks(projectId)  «docstring: none»
    function isNonEmptyString(v)  «docstring: none»
    function isNonEmptyStringArray(v)  «docstring: none»
    function isNonEmptyArray(v)  «docstring: none»
    function validate(projectId, tasksJson, { strict })  «docstring: none»
    function main(argv = process.argv)  «docstring: none»

---

## Relations structure

relations from server.js:
    [require] http
    [require] fs
    [require] path
    [require] url

relations from public/index.html:
    [asset] styles/task-manager.css
    [asset] config/access-secret.local.js
    [asset] config/access-secret.js
    [asset] config/github-token.local.js
    [asset] config/github-token.js
    [asset] config/github-oauth.js
    [asset] config/worker-url.local.js
    [asset] config/worker-url.js
    [asset] config/projects-config.js
    [asset] config/tasks-template-config.js
    [asset] scripts/template-validator.js
    [asset] scripts/template-automation.js
    [asset] scripts/folder-project-service.js
    [asset] scripts/folder-project-ui.js
    [asset] scripts/task-database.js
    [asset] scripts/task-manager-app.js

relations from public/graph-display/index.html:
    [asset] images/favicon.svg
    [asset] images/favicon.png
    [asset] manifest.json
    [asset] css/styles-new.css
    [asset] js/d3.v7.min.js
    [asset] ../scripts/folder-project-service.js
    [asset] ../scripts/folder-project-ui.js
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

relations from tests/unit/folder-project-service.test.js:
    [require] fs
    [require] path

relations from tests/unit/graph-data.test.js:
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

relations from tests/unit/task-database.test.js:
    [require] fs
    [require] path

relations from tests/unit/tasks-json-format.test.js:
    [require] fs
    [require] path

relations from tests/unit/template-automation.test.js:
    [require] fs
    [require] path

relations from tests/unit/tasks-template-config.test.js:
    [require] fs
    [require] path

relations from tests/unit/template-validator.test.js:
    [require] fs
    [require] path

relations from tests/unit/validate-schema.js:
    [require] fs
    [require] path

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
    input -> state -> output
    [input] _openNodeDetails, openNodeModal
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

flow from public/scripts/task-database.js:
    input -> transform -> state -> output
    [input] resetLoadedMetadata, applyLoadedPayload, loadTasks, loadTemplates
    [transform] inferProjectIdFromTasksFile, resolveTemplateConfig, resolveActiveProjectId, summarizeHistoryChanges
    [state] resetLoadedMetadata, saveTasksLocalDisk, generatePersistedCSV, saveTasksLocal
    [output] exportToCSV

flow from public/scripts/task-manager-app.js:
    input -> transform -> state -> output
    [input] ensureGraphIframeLoaded, loadConfig, getModuleFetchCandidates, fetchModuleData
    [transform] buildGraphIframeSrc, normalizeModulePath, normalizeModuleEntry, buildTaskFlowSummary
    [state] getStoredFolderProjects, setupProjectSelector, setActiveProject, updateTaskAuthoringAvailability
    [output] formatDisplayDate, renderProjectNavigation, renderHistory, renderTasks

flow from public/scripts/template-automation.js:
    transform
    [transform] generateTaskId, autoGenerateDependencies, validateAndFix, generateProjectSummary

flow from public/scripts/template-validator.js:
    transform
    [transform] validate, validateTemplate, validateProject, validateTask

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

flow from tests/unit/folder-project-service.test.js:
    input
    [input] loadFolderProjectService

flow from tests/unit/graph-data.test.js:
    input
    [input] loadGraphDataModule

flow from tests/unit/task-database.test.js:
    state
    [state] updateFile

flow from tests/unit/tasks-json-format.test.js:
    transform
    [transform] validateTasksJson

flow from tests/unit/validate-schema.js:
    transform
    [transform] validateRequired, validateEnum, validateDateFormat

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
    [cli] tools/scripts/enrich-tasks-workers.js — process.argv CLI
    [cli] tools/scripts/generate-state-files.js — process.argv CLI
    [cli] tools/scripts/regenerate-tasks-csv.js — process.argv CLI
    [cli] tools/scripts/validate-commit-format.js — process.argv CLI
    [cli] tools/scripts/validate-tasks-schema.js — process.argv CLI
    [cli] tools/scripts/validate-tasks-workers.js — process.argv CLI

core surface candidates for API/MCP exposure:
    [candidate] public/scripts/task-database.js: inferProjectIdFromTasksFile, resolveTemplateConfig, hasValidGitHubToken, resolveActiveProjectId, getProjectScopedStorageKey (+3 more)
    [candidate] public/scripts/task-manager-app.js: TaskManagerApp, constructor, getGraphTemplateIdForActiveProject, getStoredFolderProjects, registerFolderProjectOption (+3 more)
    [candidate] public/graph-display/js/main-graph.js: isEmbeddedMode, getInitialTemplateId, setSelectedTemplateId, CurriculumGraph, constructor (+3 more)
    [candidate] tools/scripts/enrich-tasks-workers.js: isNonEmptyString, uniq, loadJson, saveJson, buildTasksById (+3 more)
    [candidate] public/graph-display/js/graph-data.js: convertCypherToGraph, normalizePriority, getTaskPredecessorIds, getDependencyLinkType, buildDependencyLayering (+3 more)
    [candidate] public/graph-display/js/walkthrough.js: debounce, Walkthrough, constructor, setSteps, init (+3 more)

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

## Feature exposure

data formats (web-github-task-manager):
    [format-produce] csv: server.js (+4 more)
    [format-produce] json: server.js (+27 more)
    [format-produce] ndjson: server.js (+5 more)
    [format-consume] csv: server.js (+2 more)
    [format-consume] json: server.js (+11 more)

schemas and templates:
    [data-template] public/graph-display/templates/registry.json
    [schema] public/tasksDB/_schema/graph-template.schema.json
    [data-template] public/tasksDB/_templates/starter_project_template.csv
    [data-template] public/tasksDB/_templates/starter_project_template.json
    [data-template] public/tasksDB/_templates/starter_project_template_v2.json

connectors and mappings:
    [mapping] public/graph-display/js/graph-data.js: convertCypherToGraph

http endpoints:
    [route] GET /api/health (server.js)
    [route] GET /api/projects (server.js)
    [route] GET /api/module (server.js)
    [route] GET /api/scan-path (server.js)
    [route] GET /api/tasks (server.js)
    [route] PUT /api/tasks (server.js)
    [route] GET /health (tools/cloudflare-worker/worker.js)
    [route] GET /api/task-history (tools/cloudflare-worker/worker.js)
    [route] PUT /api/tasks (tools/cloudflare-worker/worker.js)

---

## Bridge analysis: web-github-task-manager ↔ web-appoinment

compatible format bridges:
    [bridge-ready] csv: web-github-task-manager ↔ web-appoinment via csv
    [bridge-ready] json: web-github-task-manager ↔ web-appoinment via json

format gaps:
    [bridge-missing] ics: web-appoinment produces; web-appoinment consumes
    [bridge-missing] ndjson: web-github-task-manager produces

existing mapping functions:
    [mapping-exists] public/graph-display/js/graph-data.js: convertCypherToGraph
    [mapping-exists] src/connectors/githubTaskManagerConnector.js: mapAppointmentToTask
    [mapping-exists] src/modules/calculator/calculatorTemplates.js: mapTemplateToRuntime
    [mapping-exists] src/modules/sync/calendarSyncFormats.js: parseStateFromJson
    [mapping-exists] src/modules/sync/calendarSyncFormats.js: parseStateFromICS
    [mapping-exists] src/modules/sync/calendarSyncFormats.js: parseStateFromCSV

needed mappings:
    [mapping-needed] web-github-task-manager → web-appoinment: web-github-task-manager has no connector targeting web-appoinment

---
*136 files indexed · generated by extract_project_spec.py*