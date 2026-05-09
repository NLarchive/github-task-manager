# Project Specification: web-github-task-manager
Generated: 2026-05-07 11:43
<!-- To update this file, run: python D:\tool\extract_project_spec\app.py --root D:\web\web-github-task-manager -->

## Folder structure

.github
.github\workflows
api
cli
public
public\agentic-ide
public\agentic-ide\chat
public\agentic-ide\chat\css
public\agentic-ide\chat\js
public\agentic-ide\chat\tests
public\agentic-ide\components
public\agentic-ide\components\agents
public\agentic-ide\components\agents\chat-quality-inspector
public\agentic-ide\components\agents\data_processor_v1
public\agentic-ide\components\agents\data_processor_v1\tests
public\agentic-ide\components\agents\search_agent_v1
public\agentic-ide\components\agents\search_agent_v1\tests
public\agentic-ide\components\inference
public\agentic-ide\components\inference\engines
public\agentic-ide\components\inference\engines\duck4i-llama
public\agentic-ide\components\inference\engines\hyllama
public\agentic-ide\components\inference\engines\llama-server-openai
public\agentic-ide\components\inference\engines\llama3pure
public\agentic-ide\components\inference\engines\llmjs
public\agentic-ide\components\inference\engines\node-llama-cpp
public\agentic-ide\components\inference\engines\webllm
public\agentic-ide\components\inference\tests
public\agentic-ide\components\inference\tests\coding
public\agentic-ide\components\inference\tests\text
public\agentic-ide\components\runtime
public\agentic-ide\components\subgraphs
public\agentic-ide\components\subgraphs\format_info_v1
public\agentic-ide\components\subgraphs\format_info_v1\tests
public\agentic-ide\components\tools
public\agentic-ide\components\tools\benchmark_result_writer_v1
public\agentic-ide\components\tools\benchmark_result_writer_v1\tests
public\agentic-ide\components\tools\folder-graph-scanner
public\agentic-ide\components\tools\folder-graph-scanner\ui
public\agentic-ide\components\tools\html_parser_v1
public\agentic-ide\components\tools\html_parser_v1\tests
public\agentic-ide\components\tools\research_benchmark_runner_v1
public\agentic-ide\components\tools\result_ranker_v1
public\agentic-ide\components\tools\result_ranker_v1\tests
public\agentic-ide\components\tools\ui_renderer_v1
public\agentic-ide\components\tools\ui_renderer_v1\tests
public\agentic-ide\components\tools\web_search_v1
public\agentic-ide\components\tools\web_search_v1\tests
public\agentic-ide\js
public\agentic-ide\schema
public\agentic-ide\tests
public\agentic-ide\ui
public\agentic-ide\workflows
public\agentic-ide\workflows\benchmarks
public\agentic-ide\workflows\benchmarks\research_benchmark_v1
public\agentic-ide\workflows\benchmarks\research_benchmark_v1\tests
public\agentic-ide\workflows\research_workflow_v1
public\agentic-ide\workflows\research_workflow_v1\tests
public\api
public\calendar
public\calendar\js
public\calendar\snippets
public\config
public\graph-composer
public\graph-composer\css
public\graph-composer\js
public\graph-display
public\graph-display\css
public\graph-display\css\components
public\graph-display\images
public\graph-display\images\team
public\graph-display\js
public\graph-display\js\shared
public\graph-display\schema
public\health
public\health\css
public\health\js
public\list-display
public\list-display\css
public\list-display\js
public\local-folder
public\local-folder\js
public\local-folder\task-bridge-modules
public\local-folder\task-bridge-modules\taskbridge
public\local-folder\task-bridge-modules\taskbridge\public
public\local-folder\task-bridge-modules\taskbridge\public\task-engine
public\local-folder\task-bridge-modules\taskbridge\public\task-engine\js
public\local-folder\task-bridge-modules\taskbridge\server
public\task-engine
public\task-engine\file-editing
public\task-engine\file-editing\edit-cloud
public\task-engine\file-editing\edit-local
public\task-engine\js
public\task-engine\js\bridge
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
tools\task-bridge
tools\task-bridge\server
.github\workflows\deploy.yml
.github\workflows\validate-taskdb.yml
.gitignore
AGENTS.md
api\README.md
cli\README.md
CONTRIBUTING.md
exposure-bridge.json
LICENSE
package.json
public\agentic-ide\.gitignore
public\agentic-ide\chat\chat-screen.schema.json
public\agentic-ide\chat\css\chat-lab.css
public\agentic-ide\chat\index.html
public\agentic-ide\chat\js\chat-api.js
public\agentic-ide\chat\js\chat-app.js
public\agentic-ide\chat\js\chat-catalog.json
public\agentic-ide\chat\js\chat-render.js
public\agentic-ide\chat\js\chat-response-validator.js
public\agentic-ide\chat\js\chat-state.js
public\agentic-ide\chat\js\chat-telemetry.js
public\agentic-ide\chat\js\chat-tests.js
public\agentic-ide\chat\node.tasks.json
public\agentic-ide\chat\playwright.config.js
public\agentic-ide\chat\schema.json
public\agentic-ide\chat\tests\chat-lab.spec.js
public\agentic-ide\chat\tests\chat-lab.test.js
public\agentic-ide\chat\tests\chat-surface.test-plan.json
public\agentic-ide\chat\tests\inference-chat-hello-world.spec.js
public\agentic-ide\chat\tests\inference-ui-series.spec.js
public\agentic-ide\code.graph.json
public\agentic-ide\components\agents\chat-quality-inspector\main.js
public\agentic-ide\components\agents\chat-quality-inspector\schema.json
public\agentic-ide\components\agents\chat-quality-inspector\test.js
public\agentic-ide\components\agents\data_processor_v1\prompt.md
public\agentic-ide\components\agents\data_processor_v1\schema.json
public\agentic-ide\components\agents\data_processor_v1\tests\behavior.json
public\agentic-ide\components\agents\search_agent_v1\prompt.md
public\agentic-ide\components\agents\search_agent_v1\schema.json
public\agentic-ide\components\agents\search_agent_v1\tests\behavior.json
public\agentic-ide\components\inference\engines\duck4i-llama\adapter.js
public\agentic-ide\components\inference\engines\hyllama\adapter.js
public\agentic-ide\components\inference\engines\llama-server-openai\adapter.js
public\agentic-ide\components\inference\engines\llama3pure\adapter.js
public\agentic-ide\components\inference\engines\llmjs\adapter.js
public\agentic-ide\components\inference\engines\node-llama-cpp\adapter.js
public\agentic-ide\components\inference\engines\webllm\adapter.js
public\agentic-ide\components\inference\main.js
public\agentic-ide\components\inference\README.md
public\agentic-ide\components\inference\request-schema.js
public\agentic-ide\components\inference\schema.json
public\agentic-ide\components\inference\tests\benchmark.js
public\agentic-ide\components\inference\tests\coding\coding_cases.json
public\agentic-ide\components\inference\tests\coding\run-coding-suite.js
public\agentic-ide\components\inference\tests\index.html
public\agentic-ide\components\inference\tests\select-best.js
public\agentic-ide\components\inference\tests\text\hello-world-conformance.js
public\agentic-ide\components\inference\tests\text\run-validation-suite.js
public\agentic-ide\components\inference\tests\text\validation_cases.json
public\agentic-ide\components\runtime\schema.json
public\agentic-ide\components\subgraphs\format_info_v1\graph.json
public\agentic-ide\components\subgraphs\format_info_v1\schema.json
public\agentic-ide\components\subgraphs\format_info_v1\state.js
public\agentic-ide\components\subgraphs\format_info_v1\tests\snapshot.json
public\agentic-ide\components\tools\benchmark_result_writer_v1\main.js
public\agentic-ide\components\tools\benchmark_result_writer_v1\schema.json
public\agentic-ide\components\tools\benchmark_result_writer_v1\tests\unit.json
public\agentic-ide\components\tools\folder-graph-scanner\main.js
public\agentic-ide\components\tools\folder-graph-scanner\schema.json
public\agentic-ide\components\tools\folder-graph-scanner\ui\main.js
public\agentic-ide\components\tools\html_parser_v1\main.js
public\agentic-ide\components\tools\html_parser_v1\schema.json
public\agentic-ide\components\tools\html_parser_v1\tests\unit.json
public\agentic-ide\components\tools\README.md
public\agentic-ide\components\tools\research_benchmark_runner_v1\main.js
public\agentic-ide\components\tools\research_benchmark_runner_v1\schema.json
public\agentic-ide\components\tools\result_ranker_v1\main.js
public\agentic-ide\components\tools\result_ranker_v1\schema.json
public\agentic-ide\components\tools\result_ranker_v1\tests\unit.json
public\agentic-ide\components\tools\schema.json
public\agentic-ide\components\tools\ui_renderer_v1\main.js
public\agentic-ide\components\tools\ui_renderer_v1\schema.json
public\agentic-ide\components\tools\ui_renderer_v1\template.html
public\agentic-ide\components\tools\ui_renderer_v1\tests\snapshot.json
public\agentic-ide\components\tools\web_search_v1\main.js
public\agentic-ide\components\tools\web_search_v1\schema.json
public\agentic-ide\components\tools\web_search_v1\tests\unit.json
public\agentic-ide\index.html
public\agentic-ide\js\bridge-server.js
public\agentic-ide\js\bridge-workspace.js
public\agentic-ide\js\bridge.js
public\agentic-ide\js\export.js
public\agentic-ide\js\main.js
public\agentic-ide\js\modals.js
public\agentic-ide\js\README.md
public\agentic-ide\js\render.js
public\agentic-ide\js\schema-preview.js
public\agentic-ide\js\state.js
public\agentic-ide\js\types.js
public\agentic-ide\js\utils.js
public\agentic-ide\node.tasks.json
public\agentic-ide\PROJECT_SPEC.md
public\agentic-ide\README.md
public\agentic-ide\registry.json
public\agentic-ide\schema\component.schema.json
public\agentic-ide\schema\unit-case.schema.json
public\agentic-ide\tests\inference-debug.js
public\agentic-ide\tests\inference-quality-test.js
public\agentic-ide\tests\test-inference.ps1
public\agentic-ide\ui\README.md
public\agentic-ide\ui\style.css
public\agentic-ide\workflows\benchmarks\README.md
public\agentic-ide\workflows\benchmarks\research_benchmark.json
public\agentic-ide\workflows\benchmarks\research_benchmark_v1\schema.json
public\agentic-ide\workflows\benchmarks\research_benchmark_v1\state.js
public\agentic-ide\workflows\benchmarks\research_benchmark_v1\tests\live.json
public\agentic-ide\workflows\benchmarks\research_benchmark_v1\workflow.json
public\agentic-ide\workflows\research_workflow_v1\schema.json
public\agentic-ide\workflows\research_workflow_v1\state.js
public\agentic-ide\workflows\research_workflow_v1\state.py
public\agentic-ide\workflows\research_workflow_v1\tests\e2e.json
public\agentic-ide\workflows\research_workflow_v1\workflow.json
public\api\README.md
public\calendar\js\task-ics-export.js
public\calendar\README.md
public\calendar\snippets\calendar-dropdown-snippets.html
public\config\projects-config.js
public\config\tasks-template-config.js
public\config\worker-url.js
public\graph-composer\css\graph-composer.css
public\graph-composer\css\guide-index.css
public\graph-composer\css\project-index.css
public\graph-composer\guide-index.html
public\graph-composer\index.html
public\graph-composer\js\composer-app.js
public\graph-composer\js\composer-defaults.js
public\graph-composer\js\composer-render.js
public\graph-composer\js\composer-state.js
public\graph-composer\project-index.html
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
public\graph-display\js\guide-index.js
public\graph-display\js\main-graph.js
public\graph-display\js\project-index.js
public\graph-display\js\README.md
public\graph-display\js\shared\graph-design-contract.js
public\graph-display\js\shared\graph-metric-utils.js
public\graph-display\js\shared\graph-template-storage.js
public\graph-display\js\shared\link-types.js
public\graph-display\js\shared\project-graph-utils.js
public\graph-display\js\shared\tours.js
public\graph-display\js\template-loader.js
public\graph-display\js\utils.js
public\graph-display\js\walkthrough.js
public\graph-display\manifest.json
public\graph-display\README.md
public\graph-display\schema\graph-template.schema.json
public\graph-display\schema\graph-ui-config.schema.json
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
public\local-folder\js\folder-cache.js
public\local-folder\js\folder-picker-trigger.js
public\local-folder\js\local-folder-scanner.js
public\local-folder\README.md
public\local-folder\task-bridge-modules\taskbridge\package.json
public\local-folder\task-bridge-modules\taskbridge\public\task-engine\js\app-integration-example.js
public\local-folder\task-bridge-modules\taskbridge\public\task-engine\js\cache-watchdog.js
public\local-folder\task-bridge-modules\taskbridge\public\task-engine\js\task-storage-sync.js
public\local-folder\task-bridge-modules\taskbridge\server.js
public\local-folder\task-bridge-modules\taskbridge\server\bridge-router.js
public\local-folder\task-bridge-modules\taskbridge\server\file-editor.js
public\README.md
public\styles.css
public\task-engine\file-editing\edit-cloud\github-worker.strategy.json
public\task-engine\file-editing\edit-local\local-filesystem.strategy.json
public\task-engine\js\bridge\cache-watchdog.js
public\task-engine\js\bridge\task-storage-sync.js
public\task-engine\js\bridge\taskdb-bridge-integration.js
public\task-engine\js\task-field-automation.js
public\task-engine\js\task-schema-clipboard.js
public\task-engine\js\task-schema-validator.js
public\task-engine\js\task-storage-sync.js
public\tasksDB\_examples\career\data.json
public\tasksDB\_examples\career\tour.json
public\tasksDB\_examples\task-management\data.json
public\tasksDB\_examples\task-management\tour.json
public\tasksDB\_schema\graph-template.schema.json
public\tasksDB\_templates\starter_project_template.csv
public\tasksDB\_templates\starter_project_template.json
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
tests\e2e\local-project-editing.spec.js
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
tests\unit\bridge-workspace.test.js
tests\unit\folder-cache.test.js
tests\unit\generate-project-calendars.test.js
tests\unit\graph-data.test.js
tests\unit\graph-design-contract.test.js
tests\unit\graph-schemas.test.js
tests\unit\graph-template-storage.test.js
tests\unit\inference-engines.test.js
tests\unit\inference-request-schema.test.js
tests\unit\local-folder-scanner.test.js
tests\unit\projects-config.test.js
tests\unit\server-api.test.js
tests\unit\task-field-automation.test.js
tests\unit\task-schema-clipboard.test.js
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
tools\scripts\start-agentic-ide-stack.ps1
tools\scripts\validate-agentic-cells.js
tools\scripts\validate-commit-format.js
tools\scripts\validate-tasks-schema.js
tools\scripts\validate-tasks-workers.js
tools\task-bridge\package.json
tools\task-bridge\README.md
tools\task-bridge\server.js
tools\task-bridge\server\bridge-router.js
tools\task-bridge\server\file-editor.js

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
    [heading-1] # From the repository root
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
    [json-key] schemas: [4 items]
    [json-key] connectors: [1 items]
    [json-key] http_apis: [9 items]
    [json-key] bridge: {projects, shared_formats, bridge_ready, bridge_missing, existing_mappings, +1 more}

structure from package.json:
    [file-summary] github-task-manager — Collaborative task management system integrated with GitHub for public collaboration
    [json-key] name: "github-task-manager"
    [json-key] version: "1.0.0"
    [json-key] description: "Collaborative task management system integrated with GitHub ..."
    [json-key] main: "public/list-display/js/list-display-controller.js"
    [json-key] scripts: {start, start:static, test, test:validate, validate:tasks, +33 more}
    [json-key] repository: {type, url}
    [json-key] keywords: [4 items]
    [json-key] author: "nlarchive"
    [json-key] license: "MIT"
    [json-key] bugs: {url}
    [json-key] homepage: "https://nlarchive.github.io/github-task-manager"
    [json-key] devDependencies: {@playwright/test, cross-env, eslint, gh-pages, prettier, +1 more}
    [json-key] dependencies: {@duck4i/llama, github-task-manager}

structure from server.js:
    [file-summary] Local development server and runtime API bridge for the public TaskDB apps.
    const ALLOWED_API_ORIGINS  «docstring: none»
    const TASK_FILE_CANDIDATES  «Preferred task filenames searched within a TaskDB project tree.»
    const DISCOVERY_IGNORED_DIRS  «Directories skipped while scanning project modules and derived artifacts.»
    const PROJECT_TREE_IGNORED_DIRS  «Directories skipped while scanning the broader repository tree for project-index.html.»
    const TEXT_PREVIEW_MAX_BYTES  «Text preview cap for file-content responses.»
    const TEXT_PREVIEW_EXTENSIONS  «Extensions that are safe to preview as text without further inspection.»
    function escapeCsvValue(value)  «Escape a scalar value for inclusion in the persisted CSV export.»
    function generatePersistedCSV(tasks = [])  «Build the repo-side flattened CSV companion for a TaskDB task list.»
    function getDuplicateTaskIds(tasks = [])  «Collect duplicate numeric task identifiers before persisting project data.»
    function safeJoin(root, requestPath)  «Resolve a request-relative path within a trusted root, rejecting traversal.»
    function scanFolderToGraph(folderPath, maxDepth = 5)  «Scan a folder structure and extract relations to build code.graph.json»
    function contentTypeFor(filePath)  «Map a file path extension to the HTTP content type used by static serving.»
    function sendJson(res, status, payload)  «Send a JSON response with no-store caching for API endpoints.»
    function applyApiCors(req, res)  «Apply CORS headers for API endpoints using a strict allowlist. Requests without Origin (same-origin or CLI) are allowed.»
    function getProjectETag(projectDir)  «Return ETag for a project's canonical node.tasks.json file.»
    function readBody(req)  «Read the full request body into memory with a conservative size guard.»
    function readJsonFile(filePath)  «Read and parse a JSON file, returning null when it does not exist or fails.»
    function normalizeRelativePath(value)  «Normalize a project-relative path to forward slashes without leading markers.»
    function inferModuleDepartment(relativePath)  «Infer the department/group label for a discovered module path.»
    function inferModuleType(relativePath, moduleData)  «Infer a coarse module type when the module file does not declare one.»
    function isTaskFileCandidate(fileName)  «Determine whether a filename is a supported TaskDB source file.»
    function readDirectoryEntries(dirPath)  «Read directory entries safely, returning an empty list on filesystem errors.»
    function pickPreferredTaskFileName(entries)  «Pick the preferred task source file from a directory listing.»
    function discoverProjectTaskFiles(projectDir)  «Recursively discover TaskDB task files under a project directory.»
    function getProjectFileExtension(fileName)  «Get a lowercase file extension for project tree summaries.»
    function shouldSkipProjectTreeEntry(entry)  «Determine whether a repository directory should be skipped from project tree scans.»
    function countProjectTreeStats(dirPath)  «Recursively count descendant files/directories for a repository folder snapshot.»
    function buildProjectFileSummary(rootDir, filePath)  «Build a file node summary for the project explorer.»
    function buildProjectDirectorySummary(rootDir, dirPath)  «Build a folder node summary for the project explorer.»
    function buildProjectTreeSnapshot(rootDir, relativePath = '')  «Build a one-level directory snapshot with child metadata and descendant counts.»
    function isTextPreviewFile(filePath, buffer)  «Determine whether a file buffer should be treated as text for preview.»
    function buildProjectFilePreview(rootDir, relativePath)  «Read a safe text preview payload for a repository file.»
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
    function createServer({ publicDir, tasksDbDir, graphDir, repoRoot })  «Create the local HTTP server used by development, tests, and file-backed saves.»

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

structure from api/README.md:
    [file-summary] API Reference
    [heading-1] # API Reference
    [heading-2] ## Local API Server
    [heading-3] ### Key endpoints
    [heading-3] ### Notes
    [heading-2] ## CLI Support

structure from cli/README.md:
    [file-summary] CLI Support
    [heading-1] # CLI Support
    [heading-2] ## Recommended commands
    [heading-2] ## Existing CLI/tooling locations
    [heading-2] ## Local development CLI flow
    [heading-2] ## Adding a new CLI entrypoint

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

structure from public/agentic-ide/.gitignore:  (no extractable definitions)

structure from public/agentic-ide/PROJECT_SPEC.md:
    [file-summary] Project Specification: agentic-ide
    [heading-1] # Project Specification: agentic-ide
    [heading-2] ## Folder structure
    [heading-2] ## File Structures
    [heading-2] ## Relations structure
    [heading-2] ## Flow structure
    [heading-2] ## API endpoints

structure from public/agentic-ide/README.md:
    [file-summary] Agentic IDE
    [heading-1] # Agentic IDE
    [heading-2] ## Start
    [heading-2] ## Runtime Requirements
    [heading-2] ## Cell Contract System
    [heading-2] ## Page Layout
    [heading-2] ## Trees
    [heading-3] ### Library
    [heading-3] ### Graph
    [heading-2] ## Mobile Behavior
    [heading-2] ## Header Controls
    [heading-3] ### Model selector
    [heading-3] ### Chat
    [heading-2] ## Bottom Panel Tabs
    [heading-3] ### JSON
    [heading-3] ### Code
    [heading-3] ### Edge
    [heading-3] ### Meta
    [heading-3] ### Tasks
    [heading-3] ### Tests
    [heading-3] ### Issues
    [heading-2] ## Inspector
    [heading-2] ## How To Work With Components
    [heading-2] ## Benchmark Workflow
    [heading-2] ## Running The Benchmark
    [heading-2] ## Project Structure Semantics
    [heading-2] ## Validation Strategy
    [heading-2] ## Notes

structure from public/agentic-ide/code.graph.json:  (no extractable definitions)

structure from public/agentic-ide/index.html:
    [file-summary] Visual IDE for designing agentic workflow graphs — compose typed component nodes, wire data-flow edges, and export to graph-display templates.
    [title] <title>Agentic Graph Designer</title>
    [meta] meta[description]  «Visual IDE for designing agentic workflow graphs — compose typed component nodes, wire data-flow edges, and export to gr»
    [section] <header id="page-header">
    [heading-1] <h1>Graph Designer</h1>
    [section] <aside id="sidebar">
    [section] <aside id="right-panel">
    [heading-3] <h3>Add Component</h3>
    [heading-3] <h3>Add Edge</h3>
    [heading-3] <h3>Import JSON</h3>
    [heading-3] <h3>Chat with Local LLM</h3>
    [heading-2] <h2>Agentic workflow IDE with graph canvas, file tree, code viewer, and node inspector</h2>

structure from public/agentic-ide/node.tasks.json:
    [json-key] project: {name, description, start_date, end_date, status, +2 more}
    [json-key] categories: [6 items]
    [json-key] workers: [2 items]
    [json-key] tasks: [38 items]

structure from public/agentic-ide/registry.json:
    [json-key] version: 1
    [json-key] generated_at: "2026-04-28T21:46:46.408Z"
    [json-key] component_schema: "schema/component.schema.json"
    [json-key] unit_case_schema: "schema/unit-case.schema.json"
    [json-key] components: {tools, agents, models, subgraphs, workflows}
    [json-key] edges: [5 items]

structure from public/agentic-ide/chat/chat-screen.schema.json:
    [file-summary] Agentic IDE Chat Screen State
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "https://local.agentic-ide/chat-screen.schema.json"
    [json-key] title: "Agentic IDE Chat Screen State"
    [json-key] type: "object"
    [json-key] required: [5 items]
    [json-key] properties: {generatedAt, modelId, historyCount, config, logs, +1 more}
    [json-key] additionalProperties: false

structure from public/agentic-ide/chat/index.html:
    [file-summary] Standalone chat lab with configurable prompts, agents, tools, tests, memory evaluation, and structured telemetry outputs.
    [title] <title>Agentic IDE Chat Lab</title>
    [meta] meta[description]  «Standalone chat lab with configurable prompts, agents, tools, tests, memory evaluation, and structured telemetry outputs»
    [section] <header id="topbar">
    [heading-1] <h1>Chat Lab</h1>
    [section] <aside id="config-panel">
    [section] <section id="cfg-section">
    [heading-2] <h2>1. Model and Backend</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>2. Generation and Sampling</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>3. Prompt and Behavior</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>4. Memory and History</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>5. Files and RAG</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>6. Tools and Workflows</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>7. Notebook Logic and Editing</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>8. Memory Evaluation</h2>
    [section] <main id="chat-main">

structure from public/agentic-ide/chat/node.tasks.json:
    [json-key] project: {name, description, start_date, end_date, status, +1 more}
    [json-key] categories: [4 items]
    [json-key] workers: [1 items]
    [json-key] tasks: [9 items]

structure from public/agentic-ide/chat/playwright.config.js:
    [file-summary] tests/agentic-ide/playwright.config.js
    const PORT  «docstring: none»

structure from public/agentic-ide/chat/schema.json:
    [file-summary] Standalone Chat Lab with 8-section config panel, notebook-style editing, bridge LLM API integration, and quality validation.
    [json-key] id: "chat-lab"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "Chat Lab"
    [json-key] path: "chat"
    [json-key] description: "Standalone Chat Lab with 8-section config panel, notebook-st..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "index.html"
    [json-key] inputs: [0 items]
    [json-key] outputs: [3 items]
    [json-key] errors: [0 items]
    [json-key] features: [6 items]
    [json-key] dependencies: {tools, apis}
    [json-key] files: [4 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/chat/css/chat-lab.css:
    [css-variable] --bg
    [css-variable] --panel
    [css-variable] --panel-2
    [css-variable] --line
    [css-variable] --text
    [css-variable] --sub
    [css-variable] --accent
    [css-variable] --ok
    [css-variable] --bad
    [selector] #app
    [selector] .topbar
    [selector] .topbar h1
    [selector] .topbar select, .topbar button
    [selector] .topbar button
    [selector] .topbar-status
    [selector] .dot
    [selector] .dot.ok
    [selector] .dot.bad
    [selector] .body
    [selector] .config-panel
    [selector] .config-panel.hidden
    [selector] .cfg-section
    [selector] .cfg-section h2
    [selector] .cfg-section label
    [selector] .cfg-section input[type='file']
    [selector] .cfg-section textarea
    [selector] .cfg-section input[type='checkbox']
    [selector] .help
    [selector] .chat-main
    [selector] .thread
    [selector] .msg
    [selector] .msg.user
    [selector] .msg.assistant
    [selector] .msg-meta
    [selector] .msg-body
    [selector] .msg.user .msg-body
    [selector] .msg-actions
    [selector] .msg-actions button
    [selector] .msg-edit
    [selector] .msg-edit.open
    [selector] .msg-edit textarea
    [selector] .composer
    [selector] .composer textarea
    [selector] .action-row
    [selector] .action-row button
    [selector] .toast
    [selector] .toast.show

structure from public/agentic-ide/chat/js/chat-api.js:
    [file-summary] No top-level file docstring detected
    function fetchCatalog()  «docstring: none»
    function fetchRegistry(endpointBase)  «docstring: none»
    function fetchModelInfo(endpointBase)  «docstring: none»
    function llmComplete(endpointBase, payload)  «docstring: none»
    function saveArtifact(endpointBase, path, filename, content)  «docstring: none»

structure from public/agentic-ide/chat/js/chat-app.js:
    [file-summary] No top-level file docstring detected
    const DEFAULT_ENGINE_OPTIONS  «docstring: none»
    function sanitizeBackend(backend)  «docstring: none»
    function renderEngineOptions()  «docstring: none»
    function toast(message)  «docstring: none»
    function readConfigFromUi()  «docstring: none»
    function writeConfigToUi()  «docstring: none»
    function syncSliderLabels()  «docstring: none»
    function selectedProfile(group, id, fallback = {})  «docstring: none»
    function buildContextBlock()  «docstring: none»
    function buildMessages(userPrompt)  «docstring: none»
    function toNormalizedTokens(value)  «docstring: none»
    function extractResponseContent(response)  «docstring: none»
    function analyzeResponseQuality(prompt, content)  «docstring: none»
    function render()  «docstring: none»
    function refreshBridgeStatus()  «docstring: none»
    function sendMessage()  «docstring: none»
    function exportJson(filename, value)  «docstring: none»
    function loadFiles(fileList)  «docstring: none»
    function applyParameterProfile(profileId)  «docstring: none»
    function wireEvents()  «docstring: none»
    function initCatalog()  «docstring: none»
    function main()  «docstring: none»

structure from public/agentic-ide/chat/js/chat-catalog.json:
    [json-key] prompts: [3 items]
    [json-key] agents: [3 items]
    [json-key] tools: [4 items]
    [json-key] tests: [4 items]
    [json-key] parameterProfiles: [3 items]

structure from public/agentic-ide/chat/js/chat-render.js:
    [file-summary] No top-level file docstring detected
    function esc(value)  «docstring: none»
    function renderThread(state, root, handlers)  «docstring: none»
    function fillSelect(select, items, labelField = 'name')  «docstring: none»

structure from public/agentic-ide/chat/js/chat-response-validator.js:
    [file-summary] Chat Quality Validator Integration
    export class ChatResponseValidator  «docstring: none»:
        constructor(options = {})  «docstring: none»
        validateResponse(llmResponse)  «Validate incoming LLM response Returns validation result and optionally flags/blocks poor responses»
        extractValidatedContent(llmResponse)  «Extract content with validation metadata»
        getValidationLog(count = 10)  «Get validation history»
        clearLog()  «Clear validation log»

    function initializeValidator(options = {})  «docstring: none»
    function getValidator()  «docstring: none»

structure from public/agentic-ide/chat/js/chat-state.js:
    [file-summary] No top-level file docstring detected
    const STORE_KEY  «docstring: none»
    function createDefaultState()  «docstring: none»
    function loadState()  «docstring: none»
    function saveState(state)  «docstring: none»

structure from public/agentic-ide/chat/js/chat-telemetry.js:
    [file-summary] No top-level file docstring detected
    function uid(prefix)  «docstring: none»
    function logEvent(state, event, details = {}, level = 'info')  «docstring: none»
    function addTestResult(state, name, passed, details = {})  «docstring: none»
    function buildArtifactBundle(state)  «docstring: none»

structure from public/agentic-ide/chat/js/chat-tests.js:
    [file-summary] No top-level file docstring detected
    function analyzeAssistantTextQuality(text)  «docstring: none»
    function runChatSurfaceChecks(ui, state)  «docstring: none»

structure from public/agentic-ide/chat/tests/chat-lab.spec.js:
    [file-summary] No top-level file docstring detected
    [describe] agentic-ide chat lab  «docstring: none»

structure from public/agentic-ide/chat/tests/chat-lab.test.js:
    [file-summary] Chat Lab Unit Tests
    function runChatLabTests()  «Chat Lab Unit Tests»

structure from public/agentic-ide/chat/tests/chat-surface.test-plan.json:
    [file-summary] chat-surface-test-plan
    [json-key] name: "chat-surface-test-plan"
    [json-key] version: 1
    [json-key] scope: "public/agentic-ide/chat"
    [json-key] checks: [7 items]
    [json-key] artifactTargets: {browserExport, bridgeArtifactPath}

structure from public/agentic-ide/chat/tests/inference-chat-hello-world.spec.js:
    [file-summary] inference-chat-hello-world.spec.js
    const AGENTIC_IDE_PATH  «docstring: none»
    const TEST_PROMPT  «docstring: none»
    const REPLY_TIMEOUT  «docstring: none»
    function waitForPageReady(page)  «Wait for the page JS to settle (bridge status + model select populated).»
    function openChat(page)  «Open the Chat modal by clicking the btn-chat button.»
    function readChatMessages(page)  «Read all messages currently in the chat thread. Returns an array of { role, text } objects.»
    function waitForAssistantReply(page, prevCount)  «Wait until at least one new assistant message appears in the chat thread after sending (polls until count increases or t»
    [describe] @live inference chat — hello world conformance  «docstring: none»

structure from public/agentic-ide/chat/tests/inference-ui-series.spec.js:
    [file-summary] No top-level file docstring detected
    const CHAT_PATH  «docstring: none»
    const INFERENCE_DASHBOARD_PATH  «docstring: none»
    const TEXT_CASES_PATH  «docstring: none»
    const CODING_CASES_PATH  «docstring: none»
    const TEXT_CASE_LIMIT  «docstring: none»
    const CODING_CASE_LIMIT  «docstring: none»
    const ENGINE_LIMIT  «docstring: none»
    const MIN_TEXT_ACCURACY  «docstring: none»
    const MIN_CODING_CODELIKE  «docstring: none»
    const MIN_LIVE_ENGINES  «docstring: none»
    function loadCases(filePath, key)  «docstring: none»
    function canonicalize(value)  «docstring: none»
    function waitForBridgeStatus(page)  «docstring: none»
    function getAssistantCount(page)  «docstring: none»
    function getLatestAssistantMessage(page)  «docstring: none»
    function sendPrompt(page, prompt)  «docstring: none»
    [describe] @live inference ui series  «docstring: none»

structure from public/agentic-ide/components/agents/chat-quality-inspector/main.js:
    [file-summary] Chat Quality Inspector Tool
    export class ChatQualityInspector  «Chat Quality Inspector Tool»:
        constructor(options = {})  «docstring: none»
        inspect(llmResponse)  «Main inspection entry point»
        _extractContent(response)  «docstring: none»
        _checkCorruption(content)  «docstring: none»
        _checkRepetition(content)  «docstring: none»
        _checkMeaningfulness(content)  «docstring: none»
        _checkEncoding(content)  «docstring: none»

    function createInspector(options)  «docstring: none»
    function runInspection(llmResponse, options)  «docstring: none»

structure from public/agentic-ide/components/agents/chat-quality-inspector/schema.json:
    [file-summary] Validates LLM responses for quality issues: garbled text, character corruption, repetition patterns, non-UTF8 handling
    [json-key] id: "chat-quality-inspector"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "Chat Quality Inspector"
    [json-key] path: "components/tools/chat-quality-inspector"
    [json-key] description: "Validates LLM responses for quality issues: garbled text, ch..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] inputs: [2 items]
    [json-key] outputs: [2 items]
    [json-key] errors: [1 items]
    [json-key] dependencies: {tools, apis}
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/components/agents/chat-quality-inspector/test.js:
    [file-summary] Unit tests for Chat Quality Inspector
    function runTests()  «docstring: none»

structure from public/agentic-ide/components/agents/data_processor_v1/prompt.md:
    [file-summary] Input
    [heading-2] ## Input
    [heading-2] ## Instructions
    [heading-2] ## Output Format

structure from public/agentic-ide/components/agents/data_processor_v1/schema.json:
    [file-summary] Turns upstream research notes into concise HTML blocks that downstream tools can validate and render
    [json-key] id: "data_processor"
    [json-key] type: "agent"
    [json-key] version: 1
    [json-key] label: "data_processor"
    [json-key] path: "components/agents/data_processor_v1"
    [json-key] description: "Turns upstream research notes into concise HTML blocks that ..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] model_ref: "gemma_model"
    [json-key] memory_type: "none"
    [json-key] planning: "none"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/components/agents/data_processor_v1/tests/behavior.json:
    [file-summary] data_processor behavior tests
    [json-key] name: "data_processor behavior tests"
    [json-key] type: "behavior"
    [json-key] target: "data_processor"
    [json-key] cases: [1 items]

structure from public/agentic-ide/components/agents/search_agent_v1/prompt.md:
    [file-summary] Context
    [heading-2] ## Context
    [heading-2] ## Available Tools
    [heading-2] ## Instructions
    [heading-2] ## Output Format

structure from public/agentic-ide/components/agents/search_agent_v1/schema.json:
    [file-summary] LLM agent that plans and executes web searches using ReAct strategy
    [json-key] id: "search_agent"
    [json-key] type: "agent"
    [json-key] version: 1
    [json-key] label: "search_agent"
    [json-key] path: "components/agents/search_agent_v1"
    [json-key] description: "LLM agent that plans and executes web searches using ReAct s..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] model_ref: "gemma_model"
    [json-key] memory_type: "buffer"
    [json-key] planning: "react"
    [json-key] tool_refs: [2 items]
    [json-key] inputs: [1 items]
    [json-key] outputs: [2 items]
    [json-key] errors: [2 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/components/agents/search_agent_v1/tests/behavior.json:
    [file-summary] search_agent behavior tests
    [json-key] name: "search_agent behavior tests"
    [json-key] type: "behavior"
    [json-key] target: "search_agent"
    [json-key] cases: [1 items]

structure from public/agentic-ide/components/inference/README.md:
    [file-summary] AI Inference Isolation Layer
    [heading-1] # AI Inference Isolation Layer
    [heading-2] ## Engines
    [heading-2] ## Why this exists
    [heading-2] ## Current recommendation for the bundled Gemma model
    [heading-2] ## Programmatic usage
    [heading-2] ## Live text and coding validation
    [heading-2] ## Compare multiple inference components

structure from public/agentic-ide/components/inference/main.js:
    [file-summary] No top-level file docstring detected
    const DEFAULT_MODEL_PATH  «docstring: none»
    const DEFAULT_TEST_RESULTS_DIR  «docstring: none»
    function readJsonIfExists(filePath)  «docstring: none»
    function getPassingEngineSet(report)  «docstring: none»
    function resolvePrunedEngineIds()  «docstring: none»
    function normalizeContext(context = {})  «docstring: none»
    function buildStaticCompatibilityScore(engineId, context)  «docstring: none»
    function createInferenceManager()  «docstring: none»

structure from public/agentic-ide/components/inference/request-schema.js:
    [file-summary] No top-level file docstring detected
    const DEFAULTS  «docstring: none»
    function toFiniteNumber(value, fallback)  «docstring: none»
    function toInteger(value, fallback)  «docstring: none»
    function clamp(value, min, max)  «docstring: none»
    function extractTextFromMessageContent(content)  «docstring: none»
    function normalizeRole(role)  «docstring: none»
    function normalizeMessages(messages)  «docstring: none»
    function buildPromptFromMessages(messages)  «docstring: none»
    function normalizeStop(stop)  «docstring: none»
    function normalizeInferenceRequest(payload = {})  «docstring: none»

structure from public/agentic-ide/components/inference/schema.json:
    [file-summary] Agentic IDE Inference Contract
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "https://github-task-manager.local/agentic-ide/inference/sche..."
    [json-key] title: "Agentic IDE Inference Contract"
    [json-key] type: "object"
    [json-key] required: [2 items]
    [json-key] additionalProperties: false
    [json-key] properties: {request, response}

structure from public/agentic-ide/components/inference/engines/duck4i-llama/adapter.js:
    [file-summary] No top-level file docstring detected
    function resolvePrompt(payload)  «docstring: none»
    function createDuck4iLlamaEngine()  «docstring: none»

structure from public/agentic-ide/components/inference/engines/hyllama/adapter.js:
    [file-summary] No top-level file docstring detected
    function readGgufHeader(modelPath)  «docstring: none»
    function createHyllamaEngine()  «docstring: none»

structure from public/agentic-ide/components/inference/engines/llama-server-openai/adapter.js:
    [file-summary] No top-level file docstring detected
    function normalizeBaseUrl(input)  «docstring: none»
    function toMessages(payload)  «docstring: none»
    function ensureSystemMessage(messages, systemPrompt)  «docstring: none»
    function resolveSlotId(context)  «docstring: none»
    function buildChatPayload(payload, context, maxTokensFallback = 1024)  «docstring: none»
    function sanitizeText(text)  «docstring: none»
    function postJson(url, payload, timeoutMs = 20000)  «docstring: none»
    function eraseSlot(endpoint, slotId)  «docstring: none»
    function createLlamaServerOpenAiEngine()  «docstring: none»

structure from public/agentic-ide/components/inference/engines/llama3pure/adapter.js:
    [file-summary] No top-level file docstring detected
    function createLlama3PureEngine()  «docstring: none»

structure from public/agentic-ide/components/inference/engines/llmjs/adapter.js:
    [file-summary] No top-level file docstring detected
    function createLlmJsEngine()  «docstring: none»

structure from public/agentic-ide/components/inference/engines/node-llama-cpp/adapter.js:
    [file-summary] No top-level file docstring detected
    function normalizeBaseUrl(input)  «docstring: none»
    function sanitizeLlmText(text)  «docstring: none»
    function sanitizeCompletionPayload(payload)  «docstring: none»
    function sanitizeText(text)  «docstring: none»
    function extractMessageText(content)  «docstring: none»
    function toMessages(payload)  «docstring: none»
    function ensureSystemMessage(messages, systemPrompt)  «docstring: none»
    function resolveSlotId(context)  «docstring: none»
    function toPrompt(messages, context)  «docstring: none»
    function buildChatPayload(payload, context, maxTokensFallback = 256)  «docstring: none»
    function postJson(url, payload, timeoutMs = 20000)  «docstring: none»
    function eraseSlot(endpoint, slotId)  «docstring: none»
    function createNodeLlamaCppEngine()  «docstring: none»

structure from public/agentic-ide/components/inference/engines/webllm/adapter.js:
    [file-summary] No top-level file docstring detected
    function createWebLlmEngine()  «docstring: none»

structure from public/agentic-ide/components/inference/tests/benchmark.js:
    [file-summary] No top-level file docstring detected
    function runInferenceBenchmark(options = {})  «docstring: none»
    function writeBenchmarkReport(report, outPath)  «docstring: none»

structure from public/agentic-ide/components/inference/tests/index.html:
    [file-summary] Inference Test Dashboard
    [title] <title>Inference Test Dashboard</title>
    [section] <main id="wrap">
    [section] <section id="hero">
    [heading-1] <h1>Inference Text + Coding Benchmark Dashboard</h1>
    [section] <section id="summaryCards">
    [section] <section id="card">
    [heading-2] <h2>Active vs Removed Engines</h2>
    [section] <section id="card">
    [heading-2] <h2>Per-Case Leaderboard (Combined CSV)</h2>
    [section] <section id="grid">
    [section] <article id="card">
    [heading-2] <h2>Text Suite Summary</h2>
    [section] <article id="card">
    [heading-2] <h2>Coding Suite Summary</h2>

structure from public/agentic-ide/components/inference/tests/select-best.js:
    [file-summary] No top-level file docstring detected
    const RESULTS_DIR  «docstring: none»
    const KNOWN_ENGINE_IDS  «docstring: none»
    function pickBestReportPath(resultsDir, suitePrefix)  «docstring: none»
    function readJson(filePath)  «docstring: none»
    function csvEscape(value)  «docstring: none»
    function toCsv(rows, headers)  «docstring: none»
    function getEngineStatsMap(report)  «docstring: none»
    function buildCombinedCaseLeaderboard(textReport, codingReport)  «docstring: none»
    function selectEngines(textReport, codingReport)  «docstring: none»
    function runSelection()  «docstring: none»

structure from public/agentic-ide/components/inference/tests/coding/coding_cases.json:
    [file-summary] Sequential JavaScript code-generation benchmark using deterministic execution-based checks inspired by Agentic IDE tool components.
    [json-key] suite_id: "llm_js_coding_execution_v1"
    [json-key] description: "Sequential JavaScript code-generation benchmark using determ..."
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] input_schema: {system_prompt, max_tokens, temperature}
    [json-key] cases: [10 items]

structure from public/agentic-ide/components/inference/tests/coding/run-coding-suite.js:
    [file-summary] No top-level file docstring detected
    const DEFAULT_SUITE_PATH  «docstring: none»
    const DEFAULT_RESULTS_DIR  «docstring: none»
    const DEFAULT_ENDPOINT  «docstring: none»
    const REQUIRE_LIVE_INFERENCE  «docstring: none»
    function readJson(filePath)  «docstring: none»
    function sanitizeText(value)  «docstring: none»
    function trimToExecutablePrefix(candidate)  «docstring: none»
    function extractCode(text, functionName)  «docstring: none»
    function csvEscape(value)  «docstring: none»
    function toCsv(rows, headers)  «docstring: none»
    function buildPrompt(caseEntry, suite)  «docstring: none»
    function deepClone(value)  «docstring: none»
    function createExecutionContext()  «docstring: none»
    function loadCandidateFunction(code, functionName)  «docstring: none»
    function executeTest(context, test)  «docstring: none»
    function compareResult(actual, expect)  «docstring: none»
    function summarizeEngine(run)  «docstring: none»
    function buildTimestamp()  «docstring: none»
    function buildCaseLeaderboardRows(detailRows)  «docstring: none»
    function runCase(manager, engineId, context, suite, caseEntry)  «docstring: none»
    function runSuite(options = {})  «docstring: none»
    function main()  «docstring: none»

structure from public/agentic-ide/components/inference/tests/text/hello-world-conformance.js:
    [file-summary] No top-level file docstring detected
    const LLAMA_ENDPOINT  «docstring: none»
    const BRIDGE_ENDPOINT  «docstring: none»
    const TIMEOUT_MS  «docstring: none»
    const TEST_PROMPT  «docstring: none»
    const MAX_TOKENS  «docstring: none»
    const ENGINES  «docstring: none»
    function sanitize(text)  «docstring: none»
    function fetchWithTimeout(url, opts)  «docstring: none»
    function postJson(url, body)  «docstring: none»
    function pass(text)  «docstring: none»
    function metrics(text)  «docstring: none»
    function runEngine(engine)  «docstring: none»
    function statusLine(result)  «docstring: none»
    function main()  «docstring: none»

structure from public/agentic-ide/components/inference/tests/text/run-validation-suite.js:
    [file-summary] No top-level file docstring detected
    const DEFAULT_SUITE_PATH  «docstring: none»
    const DEFAULT_RESULTS_DIR  «docstring: none»
    const DEFAULT_ENDPOINT  «docstring: none»
    const REQUIRE_LIVE_INFERENCE  «docstring: none»
    function readJson(filePath)  «docstring: none»
    function sanitizeText(value)  «docstring: none»
    function canonicalize(value)  «docstring: none»
    function csvEscape(value)  «docstring: none»
    function toCsv(rows, headers)  «docstring: none»
    function buildPrompt(caseEntry, suite)  «docstring: none»
    function countWords(text)  «docstring: none»
    function computePromptTokenOverlap(prompt, answer)  «docstring: none»
    function runCase(manager, engineId, context, suite, caseEntry)  «docstring: none»
    function summarizeEngine(run)  «docstring: none»
    function buildTimestamp()  «docstring: none»
    function buildCaseLeaderboardRows(detailRows)  «docstring: none»
    function runSuite(options = {})  «docstring: none»
    function main()  «docstring: none»

structure from public/agentic-ide/components/inference/tests/text/validation_cases.json:
    [json-key] suite_id: "llm_unit_parseable_validation_v1"
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] input_schema: {message, system_prompt, history, max_tokens}
    [json-key] output_schema: {text, elapsed_s, output_characters, raw}
    [json-key] cases: [12 items]

structure from public/agentic-ide/components/runtime/schema.json:  (no extractable definitions)

structure from public/agentic-ide/components/subgraphs/format_info_v1/graph.json:
    [file-summary] Parse and re-render HTML so downstream reports are structured and inspectable
    [json-key] id: "format_tool"
    [json-key] type: "subgraph"
    [json-key] version: 1
    [json-key] label: "format_info"
    [json-key] path: "components/subgraphs/format_info_v1"
    [json-key] description: "Parse and re-render HTML so downstream reports are structure..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] entry: "html_parser"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] nodes: [2 items]
    [json-key] edges: [1 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/components/subgraphs/format_info_v1/schema.json:
    [file-summary] Subgraph-level contract for formatting pipeline.
    [json-key] id: "format_tool"
    [json-key] version: 1
    [json-key] description: "Subgraph-level contract for formatting pipeline."
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]

structure from public/agentic-ide/components/subgraphs/format_info_v1/state.js:
    [file-summary] state.js — State schema for the format_info subgraph.
    function createState(initial = {})  «docstring: none»

structure from public/agentic-ide/components/subgraphs/format_info_v1/tests/snapshot.json:
    [file-summary] format_tool snapshot tests
    [json-key] name: "format_tool snapshot tests"
    [json-key] type: "snapshot"
    [json-key] target: "format_tool"
    [json-key] cases: [1 items]

structure from public/agentic-ide/components/tools/README.md:  (no extractable definitions)

structure from public/agentic-ide/components/tools/schema.json:  (no extractable definitions)

structure from public/agentic-ide/components/tools/benchmark_result_writer_v1/main.js:
    [file-summary] No top-level file docstring detected
    function bridgeBase()  «docstring: none»
    function slugify(value)  «docstring: none»
    function toDurationMs(startedAt, fallback)  «docstring: none»
    function round(value, digits = 2)  «docstring: none»
    function clamp(value, min = 0, max = 100)  «docstring: none»
    function safeJsonParse(text, fallback = null)  «docstring: none»
    function countMatches(text, regex)  «docstring: none»
    function normalizeTopicTerms(topic)  «docstring: none»
    function delta(currentValue, previousValue)  «docstring: none»
    function pctDelta(currentValue, previousValue)  «docstring: none»
    function shouldSkipHistoryReads()  «docstring: none»
    function fetchJson(relativePath)  «docstring: none»
    function persistRecord(relativePath, record)  «docstring: none»
    function computeComponentScore(component, totalDurationMs)  «docstring: none»
    function summarizeComponents(steps, executedNodes)  «docstring: none»
    function computeQualitySignals(htmlReport, topic, runtimeOutput)  «docstring: none»
    function computeMetrics(meta, htmlReport, steps, components, qualitySignals)  «docstring: none»
    function computeFeedback(qualitySignals, metrics, htmlReport)  «docstring: none»
    function computeScorecard(metrics, qualitySignals, feedback)  «docstring: none»
    function loadPreviousRecord(currentRecord)  «docstring: none»
    function compareComponents(currentComponents, previousComponents)  «docstring: none»
    function buildComparison(currentRecord, previousEntry)  «docstring: none»
    function buildImprovementCandidates(record)  «docstring: none»
    function run(topic, report, benchmarkName, runLabel, startedAt, benchmarkMeta)  «docstring: none»

structure from public/agentic-ide/components/tools/benchmark_result_writer_v1/schema.json:
    [file-summary] Persists benchmark outputs and feedback for live local-model workflow runs.
    [json-key] id: "benchmark_result_writer"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "benchmark_result_writer"
    [json-key] path: "components/tools/benchmark_result_writer_v1"
    [json-key] description: "Persists benchmark outputs and feedback for live local-model..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 1
    [json-key] impl: "main.js"
    [json-key] inputs: [6 items]
    [json-key] outputs: [2 items]
    [json-key] errors: [1 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/components/tools/benchmark_result_writer_v1/tests/unit.json:
    [file-summary] benchmark_result_writer unit tests
    [json-key] name: "benchmark_result_writer unit tests"
    [json-key] type: "unit"
    [json-key] target: "benchmark_result_writer"
    [json-key] cases: [1 items]

structure from public/agentic-ide/components/tools/folder-graph-scanner/main.js:
    [file-summary] Folder Graph Scanner Scans a folder structure and extracts relations to build a code.graph.json
    const SCANNER_CONFIG  «Configuration for scanner behavior»
    class FolderNode  «Represents a folder layer in the graph»:
        constructor(folderPath, parentId = null)  «docstring: none»
        generateId(folderPath)  «docstring: none»

    class FileNode  «Represents a file/component node in the graph»:
        constructor(filePath, parentLayerId)  «docstring: none»
        generateId(filePath)  «docstring: none»
        detectType(filePath)  «docstring: none»

    class GraphEdge  «Represents an edge/relation between nodes»:
        constructor(sourceId, targetId, type = 'depends_on', metadata = {})  «docstring: none»

    export class FolderGraphScanner  «Main scanner class»:
        constructor(rootPath, options = {})  «docstring: none»
        async scan()  «Main scanning entry point»
        async scanFolder(folderPath, parentLayerId, currentDepth)  «Recursively scan a folder and its contents»
        async scanFile(filePath, parentLayerId)  «Process a single file»
        async processReadme(filePath, parentLayerId)  «Extract README as layer description»
        async processTasks(filePath, parentLayerId)  «Extract tasks from node.tasks.json»
        async analyzeFile(filePath, fileNodeId)  «Analyze imports and dependencies in a code file»
        inferIOPatterns(fileNode)  «Infer input/output patterns from file structure»
        async analyzeDependencies()  «Analyze dependencies between files and create edges»
        toCodeGraph()  «Export as code.graph.json format»

    function scanFolderToGraph(folderPath, options = {})  «Helper function to scan a folder and return code.graph.json»

structure from public/agentic-ide/components/tools/folder-graph-scanner/schema.json:
    [file-summary] Scans a folder structure and extracts node/edge relations to build a code.graph.json. Maps hierarchy to layer nodes, extracts task nodes from node.tasks.json, and analyzes import chains for data-flow 
    [json-key] id: "folder_graph_scanner"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "Folder Graph Scanner"
    [json-key] path: "components/tools/folder-graph-scanner"
    [json-key] description: "Scans a folder structure and extracts node/edge relations to..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] inputs: [2 items]
    [json-key] outputs: [4 items]
    [json-key] errors: [2 items]
    [json-key] files: [3 items]
    [json-key] tests: [0 items]

structure from public/agentic-ide/components/tools/folder-graph-scanner/ui/main.js:
    [file-summary] Folder Graph Scanner UI Integration Provides UI components to integrate the folder scanner into the graph designer
    function initFolderScannerUI()  «Initialize folder scanner UI»
    function wireScanner()  «Wire up scanner UI events»
    function getNodeTypeSummary(graph)  «Get summary of node types in the graph»
    function applyGraphToEditor(codeGraph)  «Apply discovered graph to the editor state»
    function showFolderScannerUI()  «Show the scanner panel»

structure from public/agentic-ide/components/tools/html_parser_v1/main.js:
    [file-summary] main.js — html_parser_v1
    const STRIP  «main.js — html_parser_v1»
    strip = (s) =>  «docstring: none»
    function run(html = '')  «docstring: none»

structure from public/agentic-ide/components/tools/html_parser_v1/schema.json:
    [file-summary] Parses HTML into a structured document object
    [json-key] id: "html_parser"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "html_parser"
    [json-key] path: "components/tools/html_parser_v1"
    [json-key] description: "Parses HTML into a structured document object"
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/components/tools/html_parser_v1/tests/unit.json:
    [file-summary] html_parser unit tests
    [json-key] name: "html_parser unit tests"
    [json-key] type: "unit"
    [json-key] target: "html_parser"
    [json-key] cases: [1 items]

structure from public/agentic-ide/components/tools/research_benchmark_runner_v1/main.js:
    [file-summary] No top-level file docstring detected
    function bridgeBase()  «docstring: none»
    function normalizeTopic(topic)  «docstring: none»
    function fetchJson(relativePath, options = {})  «docstring: none»
    function readModelStatus()  «docstring: none»
    function run(topic, benchmarkName, runLabel, startedAt)  «docstring: none»

structure from public/agentic-ide/components/tools/research_benchmark_runner_v1/schema.json:
    [file-summary] Runs the research_workflow through the live bridge to collect real inference latency and output data.
    [json-key] id: "research_benchmark_runner"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "research_benchmark_runner"
    [json-key] path: "components/tools/research_benchmark_runner_v1"
    [json-key] description: "Runs the research_workflow through the live bridge to collec..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 1
    [json-key] impl: "main.js"
    [json-key] inputs: [4 items]
    [json-key] outputs: [2 items]
    [json-key] errors: [1 items]
    [json-key] files: [2 items]
    [json-key] tests: [0 items]

structure from public/agentic-ide/components/tools/result_ranker_v1/main.js:
    [file-summary] main.js — result_ranker_v1
    function score(item)  «docstring: none»
    function run(results)  «docstring: none»

structure from public/agentic-ide/components/tools/result_ranker_v1/schema.json:
    [file-summary] Ranks and filters search results by heuristic relevance score
    [json-key] id: "result_ranker"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "result_ranker"
    [json-key] path: "components/tools/result_ranker_v1"
    [json-key] description: "Ranks and filters search results by heuristic relevance scor..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/components/tools/result_ranker_v1/tests/unit.json:
    [file-summary] result_ranker unit tests
    [json-key] name: "result_ranker unit tests"
    [json-key] type: "unit"
    [json-key] target: "result_ranker"
    [json-key] cases: [1 items]

structure from public/agentic-ide/components/tools/ui_renderer_v1/main.js:
    [file-summary] main.js — ui_renderer_v1
    esc = (s) =>  «main.js — ui_renderer_v1»
    function run(doc)  «docstring: none»

structure from public/agentic-ide/components/tools/ui_renderer_v1/schema.json:
    [file-summary] Renders a structured document object as presentable HTML
    [json-key] id: "ui_renderer"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "ui_renderer"
    [json-key] path: "components/tools/ui_renderer_v1"
    [json-key] description: "Renders a structured document object as presentable HTML"
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]
    [json-key] files: [4 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/components/tools/ui_renderer_v1/template.html:
    [file-summary] {{title}}
    [title] <title>{{title}}</title>

structure from public/agentic-ide/components/tools/ui_renderer_v1/tests/snapshot.json:
    [file-summary] ui_renderer snapshot tests
    [json-key] name: "ui_renderer snapshot tests"
    [json-key] type: "snapshot"
    [json-key] target: "ui_renderer"
    [json-key] cases: [1 items]

structure from public/agentic-ide/components/tools/web_search_v1/main.js:
    [file-summary] main.js — web_search_v1
    const API_BASE  «main.js — web_search_v1»
    const API_KEY  «docstring: none»
    function run(query, top_k = 5)  «Fetch search results for query, returning at most top_k items.»

structure from public/agentic-ide/components/tools/web_search_v1/schema.json:
    [file-summary] Calls a search API and returns result snippets
    [json-key] id: "web_search_tool"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "web_search_tool"
    [json-key] path: "components/tools/web_search_v1"
    [json-key] description: "Calls a search API and returns result snippets"
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] api_endpoint: "https://api.search.io/v1"
    [json-key] auth: "api_key"
    [json-key] inputs: [2 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [2 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/components/tools/web_search_v1/tests/unit.json:
    [file-summary] web_search_tool unit tests
    [json-key] name: "web_search_tool unit tests"
    [json-key] type: "unit"
    [json-key] target: "web_search_tool"
    [json-key] cases: [2 items]

structure from public/agentic-ide/js/README.md:  (no extractable definitions)

structure from public/agentic-ide/js/bridge-server.js:
    [file-summary] No top-level file docstring detected
    const ENGINE_ID_ALIASES  «docstring: none»
    const PORT  «HTTP port for the local Agentic IDE bridge server.»
    const ROOT  «Absolute root folder for bridge file access.»
    const INFERENCE_RESULTS_DIR  «docstring: none»
    const LLM_HOST  «Hostname for the local llama.cpp inference endpoint.»
    const LLM_PORT  «Port for the local llama.cpp inference endpoint.»
    const INFERENCE_ENGINE  «Preferred isolated inference engine id.»
    const MIME  «File extension MIME type mapping for allowed static file responses.»
    function readJsonIfExists(filePath)  «docstring: none»
    function getActiveInferenceManifest()  «docstring: none»
    function getAvailableEngineDescriptors()  «docstring: none»
    function resolveRequestedEngineId(requested, availableIds)  «docstring: none»
    function resolveInferenceEngine(payload = {}, context = {})  «docstring: none»
    function safePath(relPath)  «Resolve a relative path under ROOT and block path traversal.»
    function cors(res)  «Enable permissive CORS headers for bridge responses.»
    function json(res, code, obj)  «Send a JSON response with the given HTTP status code.»
    function readBody(req, limit = 5_000_000)  «Read the full request body as text with an optional size limit.»
    function requestLlmCompletion(payload)  «Forward a completion request to the local LLM endpoint and return parsed JSON.»
    function getWorkspaceRegistry()  «Discover the Agentic IDE workspace registry from the local root.»
    function makeEtag(body)  «Generate an ETag string for a response body.»
    function getModelAssetInfo(model)  «Return full asset path and existence info for a model definition.»
    function buildInferencePayload()  «docstring: none»
    function getRegistrySnapshot(force = false)  «Load the latest workspace registry and model status, with caching.»
    function replyCachedJson(req, res, body, etag)  «Reply with cached JSON and ETag support for HEAD / conditional requests.»

structure from public/agentic-ide/js/bridge-workspace.js:
    [file-summary] No top-level file docstring detected
    const RESERVED_NODE_KEYS  «Reserved component metadata keys excluded from extracted node meta.»
    const NODE_DIMENSIONS  «Default canvas size presets for each node kind.»
    const TEXT_FILE_DENYLIST  «Binary or non-text file extensions excluded from editor file discovery.»
    const ROOT_NODE_ID  «Identifier for the workspace root node.»
    function toPosix(value)  «Normalize a path value to POSIX separators.»
    function exists(absPath)  «Check whether the given absolute path exists on disk.»
    function readText(absPath)  «Read a UTF-8 text file from disk.»
    function sha1(value)  «Compute a SHA-1 fingerprint for a string.»
    function parseJson(absPath)  «Parse JSON from a file path, returning an empty object if missing.»
    function stringifyMeta(value)  «Convert metadata values into a normalized string form.»
    function normalizePorts(items)  «Normalize port definitions into {n,t} objects.»
    function normalizeStringList(items)  «Normalize a list of values into a cleaned string array.»
    function normalizeRefList(items)  «Normalize a list of file or component references to POSIX paths.»
    function inferType(definitionName, relDir, explicitType)  «Infer the component kind from the definition filename or folder.»
    function isEditableFile(relPath)  «Determine whether a relative file path is safe to edit and display as text.»
    function walkFiles(absDir, baseDir = absDir, acc = [])  «Recursively collect relative file paths from a directory tree.»
    function collectEditableFiles(rootDir, relDir)  «List editable files for a component or workflow folder.»
    function collectTests(doc, files)  «Merge declared and discovered test file references for a component.»
    function inferLabel(doc, fallbackId)  «Derive a human-friendly label for a node from metadata or fallback ID.»
    function getNodeSize(type)  «Return the default dimensions for a node type.»
    function extractMeta(doc, type)  «Extract non-reserved metadata from a component definition.»
    function createNode({ doc, type, relDir, files, tests })  «Build a workspace node object from a component or workflow definition.»
    function sortByTypeAndLabel(a, b)  «Sort workspace nodes by type precedence and label.»
    function walkDefinitions(rootDir)  «Discover component and workflow definition files under the workspace root.»
    function roleForFile(file)  «Determine a user-facing file role for workspace browsing and editing.»
    function inferFileType(file)  «Infer a simplified file type from a filename.»
    function slugForFile(file)  «Create a normalized slug from an arbitrary filename.»
    function pushSymbol(target, type, name)  «Register a source code symbol in a file node if not already present.»
    function extractSymbolsForFile(absPath, file)  «Extract top-level symbols from a file for quick navigation.»
    function createFileNode(rootDir, parentNode, file)  «Create a file node object for a component file inside the workspace graph.»
    function buildNodeExecutionMeta(ctx, nodeId)  «Build cached execution metadata for a component node.»
    function collectExecutedNodeMetadata(ctx, steps = [])  «Aggregate execution metadata from runtime steps into node summaries.»
    function buildRunFingerprint(executedNodes = [])  «Build a stable fingerprint for a run from executed node metadata.»
    function ensureEdgeRefs(nodes, edge)  «Ensure edge references are stored on source and destination nodes.»
    function addFileEdges(nodes, edges, parentNode, fileNodeIds, nextIndexRef)  «Create edges between file nodes and their owning component.»
    function buildWorkspace(rootDir, runtimeOptions = {})  «Build the full Agentic IDE workspace graph from filesystem definitions.»
    function assignLayout(nodes)  «Assign default canvas positions for nodes in the workspace graph.»
    function layoutChildren(nodes, parentNode, depth)  «Recursively position child nodes beneath their parent on the canvas.»
    function escapeTemplateValue(value)  «Escape a prompt variable value for safe injection into templates.»
    function renderPromptTemplate(template, variables)  «Render a prompt template by replacing {{variables}} with provided values.»
    function primaryOutputName(node)  «Return the default output port name for a node when only one output exists.»
    function normalizeExecutionOutput(node, value)  «Normalize a component return value into an output object keyed by port name.»
    function parseEdgeMapping(mapping)  «Parse simple edge mapping strings like source->target or source→target.»
    function createMockFetch(mockSpec)  «Create a mock fetch implementation for unit test runtime execution.»
    function withMockEnv(mockEnv, work)  «Temporarily set environment variables for a test execution block.»
    function loadRunFunction(absPath, runtimeOptions = {})  «Load and compile a component's main JS module for runtime execution.»
    function buildNodeInput(node, inputState)  «Build a node input object from provided values matching declared ports.»
    function extractSingleValue(obj)  «Extract a single value from a single-key object, or return the object unchanged.»
    function extractLlmText(payload)  «Extract the most likely text field from a model response payload.»
    function invokeModel(ctx, modelId, prompt, runtimeOptions, logs)  «Invoke the configured model bridge and normalize the returned text.»
    function runToolComponent(ctx, def, input, runtimeOptions, logs)  «Execute a tool component by loading its main.js entrypoint.»
    function runAgentComponent(ctx, def, input, runtimeOptions, logs, stack)  «Execute an agent component by rendering its prompt and calling the LLM.»
    function buildCompositeInput(childNode, initialInput, state, resultsByNode, incomingEdges)  «Construct child node input from upstream state and edge mappings.»
    function runCompositeComponent(ctx, def, input, runtimeOptions, logs, stack)  «Execute a composite workflow/subgraph node by running its children.»
    function executeNode(ctx, nodeId, input = {}, runtimeOptions = {}, logs = [], stack = [])  «Execute a workspace node with runtime arguments, logging, and cycle detection.»
    function assertType(actual, expectedType, label)  «Assert that a runtime value matches an expected type, throwing on mismatch.»
    function assertExpectation(actual, expected, label)  «Assert that a runtime output satisfies an expected condition or schema.»
    function createMockLlmResponder(mockSpec, sequenceSpec)  «Create a mock LLM responder for test cases with fixed or sequenced values.»
    function createRuntimeOptions(baseOptions, testCase)  «Build execution runtime options from base settings and a test case override.»
    function discoverWorkspace(rootDir)  «Discover workspace metadata and graph structure from a root directory.»
    function runComponent(rootDir, nodeId, input = {}, runtimeOptions = {})  «Run a single component node in the workspace and return runtime results.»
    function runComponentTests(rootDir, nodeId, runtimeOptions = {})  «Execute paired tests for a workspace component node and report pass/fail results.»

structure from public/agentic-ide/js/bridge.js:
    [file-summary] Base URL for the local Agentic IDE bridge API.
    const BRIDGE_BASE  «Base URL for the local Agentic IDE bridge API.»
    export class RegistryWatchdog  «Watch the bridge registry for changes and notify UI callbacks.»:
        constructor(config = {})  «docstring: none»
        async initialize()  «Initialize the watchdog and load the latest registry snapshot.»
        async forceRefresh()  «Force a registry refresh and notify listeners.»
        destroy()  «Stop watching DOM triggers and clean up listeners.»
        _registerTriggers()  «Register DOM triggers to refresh the registry when the app state changes.»
        async _check(trigger)  «Poll the bridge and reload registry data when conditions allow.»
        _setBridgeOnline(online)  «Update online/offline status and notify listeners if changed.»

    function getCacheEntry(key)  «Get the cache entry object for a named bridge resource.»
    function fetchCachedJson(key, endpoint, { force = false, ttlMs = 2000 } = {})  «Fetch JSON from the bridge with ETag caching and optional TTL overrides.»
    function getCachedEtag(key)  «Get the current cached ETag for a bridge resource key.»
    function getRegistry(options = {})  «Get the workspace registry from the bridge, with optional caching controls.»
    function getModelInfo(options = {})  «Get model asset and status information from the bridge.»
    function readFile(componentPath, filename)  «Read a component file through the bridge file API.»
    function writeFile(componentPath, filename, content)  «Write a component file to the bridge file API.»
    function listFiles(componentPath)  «List files in a component folder using the bridge API.»
    function llmComplete(prompt, options = {})  «Send a prompt to the bridge LLM completion endpoint and return text.»
    function runRuntimeNode(nodeId, input = {}, options = {})  «Run a workspace node through the bridge runtime API.»
    function runRuntimeTests(nodeId, options = {})  «Run tests for a workspace component via the bridge runtime API.»
    function checkBridge()  «Check whether the bridge and LLM endpoints are reachable.»

structure from public/agentic-ide/js/export.js:
    [file-summary] Export helper and JSON preview wiring for Agentic IDE.
    function downloadJSON(json, filename)  «Trigger a browser download for a JSON document.»
    function wireExport()  «Wire export buttons for JSON preview, Graph Display conversion, and import.»

structure from public/agentic-ide/js/main.js:
    [file-summary] No top-level file docstring detected
    const CHAT_PRESETS  «docstring: none»
    function renderGlobalControls()  «docstring: none»
    function applyLayoutStyles()  «docstring: none»
    function setupSplitter(handleId, onMove)  «docstring: none»
    function setupLayoutSplitters()  «docstring: none»
    function syncMobileScrim()  «docstring: none»
    function closeMobilePanels()  «docstring: none»
    function toggleMobilePanel(id)  «docstring: none»
    function wireMobilePanels()  «docstring: none»
    function chatPresetText(preset)  «docstring: none»
    function selectedChatOwnerNodeId()  «docstring: none»
    function chatEligibleNodes()  «docstring: none»
    function defaultChatContextIds(nodeId)  «docstring: none»
    function syncChatStateFromControls({ persist = true } = {})  «docstring: none»
    function renderChatConfigurator()  «docstring: none»
    function latestRuntimeReportFor(nodeIds)  «docstring: none»
    function summarizeNodeForChat(node)  «docstring: none»
    function summarizeRuntimeReport(report)  «docstring: none»
    function sanitizeChatFilename(value)  «docstring: none»
    function saveLatestChatReply()  «docstring: none»
    function runChatTargetTests()  «docstring: none»
    function renderChatThread()  «docstring: none»
    function openChatModal()  «docstring: none»
    function closeChatModal()  «docstring: none»
    function buildChatPrompt(nextPrompt)  «docstring: none»
    function buildConstrainedPrompt(originalPrompt, qualityIssues = [])  «docstring: none»
    function sendChatMessage()  «docstring: none»
    function wireChatModal()  «docstring: none»
    function refreshBridgeStatus()  «docstring: none»
    function applyRegistry(registry, { showToast = false, trigger = 'init' } = {})  «docstring: none»
    function initializeWorkspace()  «docstring: none»

structure from public/agentic-ide/js/modals.js:
    [file-summary] No top-level file docstring detected
    function openNodeModal(editId=null)  «docstring: none»
    function updateNodeModalExtra()  «docstring: none»
    function openEdgeModal()  «docstring: none»
    function wireModals()  «docstring: none»

structure from public/agentic-ide/js/render.js:
    [file-summary] No top-level file docstring detected
    const _drag  «docstring: none»
    const _resize  «docstring: none»
    const _sidebarTab  «docstring: none»
    const _treeOpen  «docstring: none»
    const _canvasZoom  «docstring: none»
    const _canvasRenderQueued  «docstring: none»
    const _pan  «docstring: none»
    function requestCanvasRender()  «docstring: none»
    function wireCanvasInteractions(svg)  «docstring: none»
    function getTasksIntegrationConfig()  «docstring: none»
    function resolveTasksUrl(base, relativePath)  «docstring: none»
    function setSidebarTab(tab)  «Switch sidebar view ('library' = component registry, 'graph' = graph hierarchy).»
    function svgPtInner(e)  «docstring: none»
    function setupDragEvents(saveStateFn)  «Wire document-level drag events. Call once from main.js.»
    function typeRank(type)  «docstring: none»
    function childNodesOfId(nodeId)  «docstring: none»
    function buildScopeCrumbs(scopeId)  «docstring: none»
    function setScope(scopeId)  «docstring: none»
    function getFileNode(nodeId, file)  «docstring: none»
    function hasVisibleFiles(node)  «docstring: none»
    function hasVisibleChildren(node)  «docstring: none»
    function isTreeOpen(nodeId)  «docstring: none»
    function ensureTreePathVisible(nodeId)  «docstring: none»
    function toggleTreeNode(nodeId)  «docstring: none»
    function libraryEntryRank(kind)  «docstring: none»
    function createLibraryEntry(id, kind, label, extra = {})  «docstring: none»
    function ensureLibraryFolder(parent, segment, fullPath)  «docstring: none»
    function buildFileSymbolEntries(nodeId, file)  «docstring: none»
    function buildComponentFileTree(node)  «docstring: none»
    function buildLibraryTree()  «docstring: none»
    function renderLibraryEntry(entry, depth = 0)  «docstring: none»
    function renderSidebarNode(node, depth, { showTypeLabel = false, includeChildren = false } = {})  «docstring: none»
    function renderLibrarySidebar()  «docstring: none»
    function renderGraphSidebar()  «docstring: none»
    function editorLanguage(file)  «docstring: none»
    function highlightEditorLine(line, lang)  «docstring: none»
    function renderEditorHighlight(text, file)  «docstring: none»
    function syncEditorHighlight(textarea, highlight, file)  «docstring: none»
    function renderSidebar()  «docstring: none»
    function zoomCanvas(factor, cx, cy)  «Zoom the canvas by `factor` around viewport point (cx, cy). When cx/cy are omitted the viewport centre is used.»
    function centerCanvas()  «docstring: none»
    function renderCanvas()  «docstring: none»
    function renderCrumbs()  «docstring: none»
    function renderInspector()  «docstring: none»
    function renderNodeInspector(n)  «docstring: none»
    function renderEdgeInspector(e)  «docstring: none»
    function renderFileInspector(nodeId, file)  «docstring: none»
    function saveInspector(nodeId)  «docstring: none»
    function renderBottom()  «docstring: none»
    function renderJson(n, metaOnly = false)  «docstring: none»
    function renderCode(n, file)  «docstring: none»
    function renderEdgeJson(e)  «docstring: none»
    function showText(text, lang='json')  «docstring: none»
    function showLines(lines, lang)  «docstring: none»
    function selectedRuntimeNode()  «docstring: none»
    function buildDefaultRuntimeInput(node)  «docstring: none»
    function reportSummary(report)  «docstring: none»
    function handleRuntimeRun(nodeId)  «docstring: none»
    function handleRuntimeTests(nodeId)  «docstring: none»
    function renderStepsTable(steps)  «docstring: none»
    function renderCaseRow(tc)  «docstring: none»
    function renderTestsPanel()  «docstring: none»
    function collectIssues()  «docstring: none»
    function renderIssuesPanel()  «docstring: none»
    function renderFileEditor(nodeId, file)  «Show file content as an editable textarea in the bottom panel.»
    function renderTasksPanel()  «Render the Tasks integration panel in the bottom panel.»
    function loadTasksForPanel(entries, projectId, config = {})  «docstring: none»
    function addTaskNode(td)  «docstring: none»
    function selectNode(id)  «docstring: none»
    function selectEdge(id)  «docstring: none»
    function navigateToNode(id, options = {})  «docstring: none»
    function openFile(nodeId, file)  «docstring: none»
    function drillIn(id)  «docstring: none»
    function renderAll()  «docstring: none»
    function deleteNode(id)  «docstring: none»
    function deleteEdge(id)  «docstring: none»

structure from public/agentic-ide/js/schema-preview.js:
    [file-summary] schema-preview.js — JSON schema preview modal.
    const _previewFilename  «docstring: none»
    function openSchemaPreview(title, jsonStr)  «docstring: none»
    function wireSchemaPreview()  «docstring: none»
    function _downloadText(text, filename)  «docstring: none»
    function _toast(msg)  «docstring: none»

structure from public/agentic-ide/js/state.js:
    [file-summary] No top-level file docstring detected
    const STORE_KEY  «docstring: none»
    const S  «docstring: none»
    function createRootNode()  «docstring: none»
    function createEmptyGraph()  «docstring: none»
    function createDefaultChatState()  «docstring: none»
    function cloneGraph(graph)  «docstring: none»
    function readPersistedState()  «docstring: none»
    function buildCrumbs(scopeId, nodes)  «docstring: none»
    function loadState()  «docstring: none»
    function saveState()  «docstring: none»
    function applyRegistryGraph(graph)  «docstring: none»
    function setBridgeStatus(status)  «docstring: none»
    function addRuntimeReport(report)  «docstring: none»
    function clearRuntimeReports()  «docstring: none»
    function addChatMessage(message)  «docstring: none»
    function clearChatHistory()  «docstring: none»
    function clearState(renderAll, forceBlank = false)  «docstring: none»

structure from public/agentic-ide/js/types.js:
    [file-summary] No top-level file docstring detected
    const CT  «docstring: none»
    const TYPE_META  «docstring: none»
    const DEF_FILES  «docstring: none»
    const CODE_TPL  «docstring: none»

structure from public/agentic-ide/js/utils.js:
    [file-summary] No top-level file docstring detected
    const BRIDGE_BASE  «docstring: none»
    esc = (s) =>  «docstring: none»
    ct = (t) =>  «docstring: none»
    uid = (p) =>  «docstring: none»
    childrenOf = (scope) =>  «docstring: none»
    structuredCloneSafe = (value) =>  «docstring: none»
    edgesInScope = (scope) =>  «docstring: none»
    function parsePorts(str)  «docstring: none»
    function toast(msg, dur=2200)  «docstring: none»
    function mkSvg(tag)  «docstring: none»
    function svgTxt(p,text,x,y,sz,fill,w,anchor)  «docstring: none»
    function svgPt(e)  «docstring: none»
    function loadFileContent(nodePath, filename)  «Fetch file content — tries bridge first (supports write-back), falls back to main dev server static serving. Returns the»

structure from public/agentic-ide/schema/component.schema.json:
    [file-summary] Agentic IDE Component Contract
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "agentic-ide/component.schema.json"
    [json-key] title: "Agentic IDE Component Contract"
    [json-key] type: "object"
    [json-key] required: [9 items]
    [json-key] properties: {id, type, version, label, path, +7 more}
    [json-key] additionalProperties: true

structure from public/agentic-ide/schema/unit-case.schema.json:
    [file-summary] Agentic IDE Test Case Contract
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "agentic-ide/unit-case.schema.json"
    [json-key] title: "Agentic IDE Test Case Contract"
    [json-key] type: "object"
    [json-key] required: [4 items]
    [json-key] properties: {name, type, target, cases}
    [json-key] additionalProperties: true

structure from public/agentic-ide/tests/inference-debug.js:
    [file-summary] No top-level file docstring detected
    const LLM_HOST  «docstring: none»
    const LLM_PORT  «docstring: none»
    const BRIDGE_HOST  «docstring: none»
    const BRIDGE_PORT  «docstring: none»
    function testLlamaConnection()  «Step 1: Test direct connection to llama.cpp»
    function testLlamaCompletion(prompt)  «Step 2: Send simple completion request to llama.cpp»
    function testBridgeCompletion(prompt)  «Step 3: Test bridge server completion endpoint»
    function analyzeCompletion(text)  «Analyze completion for quality issues»
    function compareResponses(llamaResult, bridgeResult)  «Compare responses from both endpoints»
    function runDebugger()  «Main debug flow»

structure from public/agentic-ide/tests/inference-quality-test.js:
    [file-summary] No top-level file docstring detected
    const BRIDGE_BASE  «docstring: none»
    const LLM_TIMEOUT  «docstring: none»
    function extractMathAnswer(response)  «Simple math answer extractor Tries to find numerical answer in the response»
    function analyzeResponseQuality(response, options = {})  «Analyze response for quality issues (corruption, encoding, etc.)»
    function runInferenceTest(testName, prompt, expectedAnswer, options = {})  «Run a single inference test with detailed logging»
    function runAllTests()  «Run full test suite»

structure from public/agentic-ide/tests/test-inference.ps1:  (no extractable definitions)

structure from public/agentic-ide/ui/README.md:  (no extractable definitions)

structure from public/agentic-ide/ui/style.css:
    [file-summary] Design tokens (warm palette, composer inspired)
    [section] /* === Design tokens (warm palette, composer-inspired) === */
    [css-variable] --bg-page
    [css-variable] --bg-panel
    [css-variable] --bg-canvas
    [css-variable] --border
    [css-variable] --text
    [css-variable] --muted
    [css-variable] --sub
    [css-variable] --accent
    [css-variable] --accent-hi
    [css-variable] --danger
    [css-variable] --shadow
    [css-variable] --r
    [css-variable] --r-sm
    [css-variable] --mono
    [css-variable] --sans
    [css-variable] --sidebar-w
    [css-variable] --inspector-w
    [css-variable] --bottom-h
    [section] /* === Header === */
    [selector] .page-header
    [selector] .hdr-brand
    [selector] .eyebrow
    [selector] .page-header h1
    [selector] .hdr-actions
    [selector] .mobile-only
    [section] /* === Buttons === */
    [selector] .btn
    [selector] .btn:hover
    [selector] .btn-accent
    [selector] .btn-accent:hover
    [selector] .btn-danger
    [selector] .btn-danger:hover
    [selector] .btn-sm
    [selector] .btn-icon
    [selector] .ide-shell
    [section] /* === Sidebar === */
    [selector] #sidebar
    [selector] .panel-hdr
    [selector] .panel-hdr-actions
    [selector] #tree
    [selector] .ti
    [selector] .ti:hover
    [selector] .ti.is-sel
    [selector] .ti-grp
    [selector] .ti-grp:hover
    [selector] .ti-node,.ti-file
    [selector] .ti-folder,.ti-symbol
    [selector] .ti-label
    [selector] .ti-toggle
    [selector] .ti-toggle.is-empty
    [selector] .ti-file
    [selector] .dot
    [selector] .dot-file
    [selector] .dot-symbol
    [selector] .splitter
    [selector] .splitter::before
    [selector] .splitter.is-active::before
    [selector] .splitter-v
    [selector] .splitter-v::before
    [selector] .splitter-h
    [selector] .splitter-h::before
    [section] /* === Center column === */
    [selector] .center-col
    [selector] #canvas-toolbar
    [selector] #crumbs
    [selector] .runtime-controls
    [selector] .runtime-label
    [selector] #global-model-select
    [selector] .status-badge
    [selector] .status-badge.is-online
    [selector] .status-badge.is-offline
    [selector] .status-badge.is-pending
    [selector] .crumb
    [selector] .crumb:hover
    [selector] .crumb-sep
    [selector] .crumb-cur
    [selector] .canvas-actions
    [selector] #canvas-area
    [selector] #g
    [section] /* === Bottom panel === */
    [selector] #bottom-panel
    [selector] #bottom-tabs
    [selector] .btab
    [selector] .btab.active
    [selector] #bottom-content
    [selector] .code-line
    [selector] .ln
    [selector] .kw
    [section] /* === File editor (in bottom panel) === */
    [selector] .file-editor-wrap
    [selector] .file-editor-hdr
    [selector] .file-editor-path
    [selector] .file-editor-body
    [selector] .file-editor-ta
    [selector] .file-editor-hl
    [selector] .file-editor-ta::placeholder
    [selector] .file-editor-ta:focus
    [selector] .file-editor-ta::selection
    [section] /* === Right panel === */
    [selector] #right-panel
    [selector] #inspector
    [selector] .ifield
    [selector] .ilabel
    [selector] .ivalue-mono
    [selector] .io-edit-row
    [selector] .flink
    [selector] .flink:hover
    [selector] .edge-pill
    [selector] .iactions
    [selector] .insp-section
    [selector] .placeholder
    [selector] .insp-input
    [selector] .insp-input:focus
    [selector] .insp-ta
    [selector] .badge
    [selector] .b-workflow
    [selector] .b-tool
    [selector] .b-file
    [selector] .b-prompt
    [selector] .b-sub
    [selector] .b-test
    [section] /* === Modals === */
    [selector] .modal-back
    [selector] .modal-back[hidden]
    [selector] .modal-card
    [selector] .modal-card h3
    [selector] .fgrid
    [selector] .fgrid .full
    [selector] .fl
    [selector] .fl label
    [selector] .fl input,.fl select,.fl textarea
    [selector] .fl input:focus,.fl select:focus,.fl textarea:focus
    [selector] .fl textarea
    [selector] .mfooter
    [selector] .type-meta-section
    [selector] .type-meta-section h4
    [section] /* === Tasks panel (bottom tab) === */
    [selector] .tasks-panel
    [selector] .tasks-panel-hdr
    [selector] .tasks-panel-hdr select
    [selector] .tasks-list
    [selector] .task-pill
    [selector] .task-pill:hover
    [selector] .task-pill-name
    [selector] .task-pill-status
    [selector] .task-pill-add
    [section] /* === Runtime reports / issues === */
    [selector] .issues-panel
    [selector] .report-toolbar
    [selector] .report-title
    [selector] .report-sub
    [selector] .report-actions
    [selector] .report-meta-row
    [selector] .report-list
    [selector] .report-list.compact
    [selector] .issue-card
    [selector] .report-card.is-pass
    [selector] .report-card.is-fail
    [selector] .report-card-hdr
    [selector] .report-card-sub
    [selector] .report-snippet
    [selector] .report-error
    [selector] .report-empty
    [section] /* === Steps / bottleneck table === */
    [selector] .steps-detail
    [selector] .steps-detail summary
    [selector] .steps-table
    [selector] .steps-table th
    [selector] .steps-table td
    [selector] .step-row.is-pass td:first-child
    [selector] .step-row.is-fail td
    [selector] .step-ms
    [selector] .step-bar
    [selector] .step-err
    [selector] .issue-list
    [selector] .issue-card.is-error
    [selector] .issue-card.is-warn
    [selector] .issue-title
    [selector] .issue-detail
    [section] /* === Toast === */
    [selector] #toast
    [selector] #toast.show
    [section] /* === Sidebar tabs (Library / Graph) === */
    [selector] #sidebar-tabs
    [selector] .stab
    [selector] .stab:hover
    [selector] .stab.active
    [section] /* Graph tree type label */
    [selector] .ti-type-lbl
    [section] /* === Schema preview modal === */
    [selector] .sp-card
    [selector] .sp-hdr
    [selector] .sp-hdr strong
    [selector] .sp-pre
    [selector] .sp-card .mfooter
    [section] /* === Chat modal === */
    [selector] .chat-card
    [selector] .chat-hdr
    [selector] .chat-model
    [selector] .chat-config
    [selector] .chat-config-grid
    [selector] .chat-config-grid .full
    [selector] .chat-config select[multiple]
    [selector] .chat-checks
    [selector] .chat-checks input
    [selector] .chat-actions-inline
    [selector] .chat-inline-buttons
    [selector] .chat-thread
    [selector] .chat-msg
    [selector] .chat-msg.is-user
    [selector] .chat-msg.is-assistant
    [selector] .chat-msg-meta
    [selector] .chat-msg-body
    [selector] .chat-empty
    [selector] #chat-input
    [selector] #chat-system-prompt
    [section] /* === Mobile panels === */
    [selector] #mobile-scrim
    [selector] #mobile-scrim[hidden]

structure from public/agentic-ide/workflows/benchmarks/README.md:  (no extractable definitions)

structure from public/agentic-ide/workflows/benchmarks/research_benchmark.json:
    [file-summary] Manifest for the live research benchmark workflow and its persisted outputs.
    [json-key] id: "research_benchmark_manifest"
    [json-key] type: "benchmark"
    [json-key] label: "research_benchmark_manifest"
    [json-key] workflow_ref: "workflows/benchmarks/research_benchmark_v1"
    [json-key] outputs_path: "workflows/benchmarks/outputs"
    [json-key] description: "Manifest for the live research benchmark workflow and its pe..."

structure from public/agentic-ide/workflows/benchmarks/research_benchmark_v1/schema.json:
    [file-summary] Port contract for benchmark workflow cell.
    [json-key] id: "research_benchmark"
    [json-key] version: 1
    [json-key] description: "Port contract for benchmark workflow cell."
    [json-key] inputs: [4 items]
    [json-key] outputs: [2 items]
    [json-key] errors: [1 items]

structure from public/agentic-ide/workflows/benchmarks/research_benchmark_v1/state.js:  (no extractable definitions)

structure from public/agentic-ide/workflows/benchmarks/research_benchmark_v1/workflow.json:
    [file-summary] Runs research_workflow with live local inference and persists benchmark outputs for later review.
    [json-key] id: "research_benchmark"
    [json-key] type: "benchmark"
    [json-key] version: 1
    [json-key] label: "research_benchmark"
    [json-key] path: "workflows/benchmarks/research_benchmark_v1"
    [json-key] description: "Runs research_workflow with live local inference and persist..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 1
    [json-key] entry: "research_benchmark_runner"
    [json-key] state_schema: "state.js"
    [json-key] inputs: [4 items]
    [json-key] outputs: [2 items]
    [json-key] nodes: [2 items]
    [json-key] edges: [2 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/workflows/benchmarks/research_benchmark_v1/tests/live.json:
    [file-summary] research_benchmark live benchmark tests
    [json-key] name: "research_benchmark live benchmark tests"
    [json-key] type: "benchmark"
    [json-key] target: "research_benchmark"
    [json-key] cases: [1 items]

structure from public/agentic-ide/workflows/research_workflow_v1/schema.json:
    [file-summary] Port contract for top-level research workflow cell.
    [json-key] id: "research_workflow"
    [json-key] version: 1
    [json-key] description: "Port contract for top-level research workflow cell."
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]

structure from public/agentic-ide/workflows/research_workflow_v1/state.js:
    [file-summary] state.js — State schema for research_workflow_v1.
    const STEP_ORDER  «docstring: none»
    function createState(initial = {})  «docstring: none»

structure from public/agentic-ide/workflows/research_workflow_v1/state.py:
    [file-summary] Python placeholder for workflow state parity. The JS runtime uses state.js. This file exists to keep the workflow's declared file list consistent and support optional Python-side tooling.
    STATE_SCHEMA = ...  «docstring: none»

structure from public/agentic-ide/workflows/research_workflow_v1/workflow.json:
    [file-summary] Top-level research pipeline: search, synthesize, validate, and render a report
    [json-key] id: "research_workflow"
    [json-key] type: "workflow"
    [json-key] version: 1
    [json-key] label: "research_workflow"
    [json-key] path: "workflows/research_workflow_v1"
    [json-key] description: "Top-level research pipeline: search, synthesize, validate, a..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] entry: "search_agent"
    [json-key] state_schema: "state.js"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] nodes: [3 items]
    [json-key] edges: [2 items]
    [json-key] files: [4 items]
    [json-key] tests: [1 items]

structure from public/agentic-ide/workflows/research_workflow_v1/tests/e2e.json:
    [file-summary] research_workflow e2e tests
    [json-key] name: "research_workflow e2e tests"
    [json-key] type: "e2e"
    [json-key] target: "research_workflow"
    [json-key] cases: [1 items]

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

structure from public/graph-composer/guide-index.html:
    [file-summary] Interactive guide for the graph-display contract, including nodes, sizes, colors, relations, subgraphs, and critical-path metadata.
    [title] <title>Graph Display Guide</title>
    [meta] meta[description]  «Interactive guide for the graph-display contract, including nodes, sizes, colors, relations, subgraphs, and critical-pat»
    [section] <header id="page-header">
    [heading-1] <h1>Graph Guide Page</h1>
    [section] <nav id="header-actions">
    [section] <main id="page-shell">
    [section] <section id="hero-panel">
    [section] <section id="guide-grid">
    [section] <aside id="panel">
    [heading-2] <h2>Features</h2>
    [section] <section id="panel">
    [heading-2] <h2>Nodes</h2>
    [section] <aside id="panel">
    [heading-2] <h2>Contract Snapshot</h2>

structure from public/graph-composer/index.html:
    [file-summary] Compose, save, and preview metric-driven graph templates for graph-display.
    [title] <title>Graph Composer</title>
    [meta] meta[description]  «Compose, save, and preview metric-driven graph templates for graph-display.»
    [section] <header id="hero">
    [heading-1] <h1>Compose metric-driven graph templates</h1>
    [section] <aside id="sidebar">
    [heading-2] <h2>Template Library</h2>
    [heading-3] <h3>Measurement Presets</h3>
    [section] <main id="workspace">
    [section] <section id="card">
    [heading-2] <h2>Template Identity</h2>
    [section] <section id="card">
    [heading-2] <h2>Visual Variables</h2>
    [section] <section id="section-grid">
    [section] <section id="card">
    [heading-2] <h2>Nodes</h2>
    [section] <section id="card">
    [heading-2] <h2>Node Editor</h2>
    [section] <section id="dual-grid">
    [section] <section id="card">
    [heading-2] <h2>Details</h2>
    [section] <section id="card">
    [heading-2] <h2>Links</h2>
    [section] <section id="panel-grid">
    [section] <section id="card">
    [heading-2] <h2>Validation</h2>
    [section] <section id="card">
    [heading-2] <h2>JSON Snapshot</h2>

structure from public/graph-composer/project-index.html:
    [file-summary] Browse a repository or chosen folder as a force graph of directories and files, with text previews for clicked files.
    [title] <title>Project Explorer Graph</title>
    [meta] meta[description]  «Browse a repository or chosen folder as a force graph of directories and files, with text previews for clicked files.»
    [section] <header id="page-header">
    [heading-1] <h1>Project Explorer Graph</h1>
    [section] <nav id="header-actions">
    [section] <section id="toolbar">
    [section] <main id="page-content">
    [section] <section id="graph-stage">
    [section] <aside id="inspector-column">
    [section] <section id="inspector-panel">
    [heading-2] <h2>Selected Item</h2>
    [section] <section id="inspector-panel">
    [heading-2] <h2>Directory Contents</h2>
    [section] <section id="inspector-panel">
    [heading-2] <h2>File Preview</h2>

structure from public/graph-composer/css/graph-composer.css:
    [css-variable] --bg
    [css-variable] --bg-panel
    [css-variable] --bg-accent
    [css-variable] --surface-border
    [css-variable] --text
    [css-variable] --muted
    [css-variable] --accent
    [css-variable] --accent-strong
    [css-variable] --accent-warm
    [css-variable] --danger
    [css-variable] --shadow
    [css-variable] --radius
    [css-variable] --radius-small
    [css-variable] --mono
    [css-variable] --sans
    [selector] .page-shell
    [selector] .hero
    [selector] .hero-copy
    [selector] .eyebrow
    [selector] .hero h1
    [selector] .hero p
    [selector] .hero-links
    [selector] .preset-chip
    [selector] .action-button
    [selector] .preset-chip:hover
    [selector] .action-button.is-accent
    [selector] .action-button.is-danger
    [selector] .layout
    [selector] .card
    [selector] .workspace > section
    [selector] .card h3
    [selector] .section-note
    [selector] .stack
    [selector] .entity-list
    [selector] .list-row
    [selector] .list-row strong
    [selector] .preset-chip span
    [selector] .list-row.is-active
    [selector] .preset-grid
    [selector] .workspace
    [selector] .form-grid
    [selector] .section-grid
    [selector] .dual-grid
    [selector] .panel-grid
    [selector] .config-grid
    [selector] .config-grid.nested-grid
    [selector] .field-toggle
    [selector] .form-label
    [selector] .field-wide
    [selector] textarea
    [selector] textarea:focus
    [selector] .field-help
    [selector] .field-toggle input
    [selector] .color-input-row
    [selector] .color-input-row input[type="color"]
    [selector] .config-group
    [selector] .config-group-header h4
    [selector] .config-group-header p
    [selector] .top-actions
    [selector] .status-bar
    [selector] #status-message[data-tone="success"]
    [selector] #status-message[data-tone="warning"]
    [selector] #status-message[data-tone="error"]
    [selector] .validation-block
    [selector] .validation-block.has-errors
    [selector] .validation-block ul
    [selector] .warning-list
    [selector] .code-panel
    [selector] .empty-state

structure from public/graph-composer/css/guide-index.css:
    [css-variable] --guide-ink
    [css-variable] --guide-muted
    [css-variable] --guide-line
    [css-variable] --guide-panel
    [css-variable] --guide-background
    [css-variable] --guide-shadow
    [selector] button
    [selector] .page-header
    [selector] .eyebrow
    [selector] .page-header h1
    [selector] .page-header p
    [selector] .header-actions
    [selector] .schema-links a
    [selector] .feature-button.active
    [selector] .page-shell
    [selector] .guide-grid > .panel
    [selector] .hero-panel
    [selector] .hero-panel p
    [selector] .guide-grid
    [selector] .panel
    [selector] .panel h2
    [selector] .feature-selector
    [selector] .feature-copy
    [selector] .feature-card
    [selector] .feature-card strong
    [selector] .schema-links
    [selector] .demo-panel p
    [selector] .guide-graph
    [selector] .guide-graph svg
    [selector] .guide-graph text
    [selector] .guide-link
    [selector] .guide-link-label
    [selector] .guide-node-label
    [selector] .guide-node-meta
    [selector] .guide-legend
    [selector] .guide-legend-chip
    [selector] .guide-legend-swatch
    [selector] .contract-summary
    [selector] .summary-card
    [selector] .summary-card strong
    [selector] .summary-card span
    [selector] .json-preview

structure from public/graph-composer/css/project-index.css:
    [css-variable] --page-ink
    [css-variable] --page-muted
    [css-variable] --page-line
    [css-variable] --page-panel
    [css-variable] --page-panel-strong
    [css-variable] --page-background
    [css-variable] --page-shadow
    [selector] input
    [selector] .page-header
    [selector] .eyebrow
    [selector] .page-header h1
    [selector] .page-header p
    [selector] .header-actions
    [selector] .directory-list button
    [selector] .breadcrumbs button
    [selector] .breadcrumbs button:hover
    [selector] .toolbar
    [selector] .panel
    [selector] .toolbar-row
    [selector] .toolbar-row + .toolbar-row
    [selector] .toolbar label
    [selector] .toolbar input
    [selector] .status-line
    [selector] .status-line[data-tone="error"]
    [selector] .status-line[data-tone="success"]
    [selector] .page-content
    [selector] .graph-stage
    [selector] .breadcrumbs
    [selector] .breadcrumbs button.active
    [selector] .graph-canvas
    [selector] .graph-canvas svg
    [selector] .graph-link
    [selector] .graph-node
    [selector] .graph-node text
    [selector] .graph-node .node-name
    [selector] .graph-node .node-meta
    [selector] .graph-node circle
    [selector] .graph-node.selected circle
    [selector] .graph-node.root circle
    [selector] .graph-node:hover circle
    [selector] .legend
    [selector] .legend-chip
    [selector] .legend-swatch
    [selector] .inspector-column
    [selector] .inspector-panel
    [selector] .inspector-panel h2
    [selector] .selection-card h3
    [selector] .selection-kind
    [selector] .selection-path
    [selector] .stat-grid
    [selector] .stat-card
    [selector] .stat-card strong
    [selector] .stat-card span
    [selector] .directory-list
    [selector] .directory-list button.active
    [selector] .entry-copy
    [selector] .entry-name
    [selector] .entry-meta
    [selector] .directory-list button.active .entry-meta
    [selector] .file-preview
    [selector] .file-preview[data-empty="true"]

structure from public/graph-composer/js/composer-app.js:
    [file-summary] No top-level file docstring detected
    const KNOWN_META_KEYS  «docstring: none»
    const KNOWN_NODE_KEYS  «docstring: none»
    const KNOWN_LINK_KEYS  «docstring: none»
    function setStatus(message, tone = 'info')  «docstring: none»
    function refreshStoredTemplates()  «docstring: none»
    function ensureSelections()  «docstring: none»
    function loadTemplate(template, activeStorageTemplateId = null)  «docstring: none»
    function getSelectedNode()  «docstring: none»
    function getSelectedLink()  «docstring: none»
    function populateTemplateForm()  «docstring: none»
    function populateNodeEditor()  «docstring: none»
    function populateDetailEditor()  «docstring: none»
    function populateLinkEditor()  «docstring: none»
    function renderPanels()  «docstring: none»
    function renderAll()  «docstring: none»
    function applyMetaExtras(rawJson)  «docstring: none»
    function readNodeDraft()  «docstring: none»
    function readLinkDraft()  «docstring: none»
    function persistCurrentTemplate(openPreview = false)  «docstring: none»
    function exportCurrentTemplate()  «docstring: none»
    function bindEvents()  «docstring: none»
    function cacheDom()  «docstring: none»
    function init()  «docstring: none»

structure from public/graph-composer/js/composer-defaults.js:
    [file-summary] No top-level file docstring detected
    const GRAPH_LINK_TYPE_OPTIONS  «docstring: none»
    const GRAPH_MEASUREMENT_PRESETS  «docstring: none»
    function deepClone(value)  «docstring: none»
    function getMeasurementPresetById(presetId)  «docstring: none»
    function createBlankNode(index = 1)  «docstring: none»
    function createBlankNodeDetails(label = 'Node')  «docstring: none»
    function createBlankLink(nodes = [])  «docstring: none»
    function createBlankTemplate()  «docstring: none»
    function createTemplateFromExample()  «docstring: none»

structure from public/graph-composer/js/composer-render.js:
    [file-summary] No top-level file docstring detected
    function escapeHtml(value)  «docstring: none»
    function humanizeKey(key)  «docstring: none»
    function renderSchemaField(fieldKey, definition, value, path)  «docstring: none»
    function renderConfigEditor(schema, values)  «docstring: none»
    function renderSavedTemplateList(templates, activeTemplateId)  «docstring: none»
    function renderMeasurementPresets(presets)  «docstring: none»
    function renderNodeList(nodes, selectedNodeId)  «docstring: none»
    function renderLinkList(links, selectedLinkIndex)  «docstring: none»
    function renderSelectOptions(options, selectedValue, includeBlank = false)  «docstring: none»
    function renderValidationSummary(validation)  «docstring: none»
    function renderJsonPreview(jsonText)  «docstring: none»

structure from public/graph-composer/js/composer-state.js:
    [file-summary] No top-level file docstring detected
    function isPlainObject(value)  «docstring: none»
    function setValueAtPath(target, path, value)  «docstring: none»
    function normalizeNode(node, index = 0)  «docstring: none»
    function normalizeLink(link, index = 0)  «docstring: none»
    function normalizeDetails(template)  «docstring: none»
    function getAdditionalFields(source, knownKeys)  «docstring: none»
    function parseJsonText(text, fallback = {})  «docstring: none»
    function suggestUniqueNodeId(template, baseId = 'node')  «docstring: none»
    function normalizeTemplate(template)  «docstring: none»
    function updateTemplateField(template, path, value)  «docstring: none»
    function applyMeasurementPreset(template, presetId)  «docstring: none»
    function upsertNode(template, nodeDraft, previousId = null)  «docstring: none»
    function duplicateNode(template, nodeId)  «docstring: none»
    function removeNode(template, nodeId)  «docstring: none»
    function upsertLink(template, linkDraft, linkIndex = -1)  «docstring: none»
    function removeLink(template, linkIndex)  «docstring: none»
    function updateNodeDetails(template, nodeId, detailDraft)  «docstring: none»
    function createNewNodeTemplate(template)  «docstring: none»
    function createNewLinkTemplate(template)  «docstring: none»
    function validateTemplate(template)  «docstring: none»
    function buildExportJson(template)  «docstring: none»

structure from public/graph-display/.gitignore:  (no extractable definitions)

structure from public/graph-display/README.md:
    [file-summary] Graph Display
    [heading-1] # Graph Display
    [heading-2] ## Single Contract
    [heading-2] ## Core vs Optional
    [heading-2] ## Quick Start
    [heading-3] ### Option A: static server
    [heading-3] ### Option B: local dev server
    [heading-2] ## Plug Into Another Project
    [heading-2] ## What To Author
    [heading-3] ### Nodes
    [heading-3] ### Node Sizes
    [heading-3] ### Node Colors
    [heading-3] ### Edges / Relations
    [heading-3] ### Subgraphs and Subcomponents
    [heading-3] ### Critical Path
    [heading-2] ## Example Direct Template
    [heading-2] ## TaskDB Authoring Rules
    [heading-2] ## Files Worth Editing
    [heading-2] ## PWA / Offline Caching
    [heading-2] ## Troubleshooting

structure from public/graph-display/index.html:
    [file-summary] Template: interactive graph-based CV/portfolio. Replace the sample graph data with your own career, skills, and outcomes.
    [title] <title>Interactive Career Graph – Template</title>
    [meta] meta[description]  «Template: interactive graph-based CV/portfolio. Replace the sample graph data with your own career, skills, and outcomes»
    [section] <main id="main-content">
    [section] <article id="graph-section">
    [heading-1] <h1>Interactive Career Graph (Template)</h1>
    [section] <aside id="menu-aside">
    [section] <nav id="menu-panel">
    [section] <section id="taskNodeModal">
    [heading-2] <h2>✏️ Edit Task</h2>
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
    [heading-3] <h3>Edit Task</h3>

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
    [selector] .popup-action-row
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
    [heading-2] ## Portable Contract

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
    const CONTEXT_RELATION_GUIDE  «docstring: none»
    const GRAPH_NODES  «Backwards-compatible node export for consumers expecting the Career template payload.»
    const GRAPH_LINKS  «Backwards-compatible link export for consumers expecting the Career template payload.»
    const GRAPH_DETAILS  «Backwards-compatible detail export for consumers expecting the Career template payload.»
    function convertCypherToGraph(cypherData)  «Converts raw Cypher-like export data into D3 compatible nodes and links.»
    function normalizePriority(priority)  «Normalize a priority string to the canonical task-management priority enum.»
    function getTaskPredecessorIds(task, validTaskIds)  «Extract valid predecessor task ids from a task's requisites and dependencies.»
    function getDependencyLinkType(dep)  «Resolve the graph link type string for a structured task dependency.»
    function buildDependencyLayering(tasks)  «Compute dependency layers for tasks and flag nodes that participate in cycles.»
    function scaleHoursToRadius(hours, minHours, maxHours, minRadius, maxRadius)  «Scale estimated hours into a rendered node radius using eased clamping.»
    function registerStoredComposerTemplates()  «docstring: none»
    function validateAgainstSchema(obj, schema)  «Perform lightweight shape validation for supported graph template payloads.»
    function resolveProjectIdFromTasksPath(path)  «Extract a project id from a TaskDB node.tasks.json path.»
    function resolveProjectScopedBase(path)  «Return the scoped base path segment for a TaskDB URL. Examples: '/tasksDB/external/first-graph/node.tasks.json' → 'exter»
    function normalizeTaskDbWalkthroughPath(pathValue, scopedBase)  «Normalize a walkthrough asset path for a scoped TaskDB project base.»
    function buildEmbeddedTaskDbTemplate(entry, data, scopedBase, embeddedGraphName)  «Build a graph template from an embedded TaskDB graphTemplate payload.»
    function normalizeTaskDbFilePath(pathValue)  «Normalize a TaskDB file reference so runtime navigation always targets the canonical node.tasks.json filename.»
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
    function normalizeProgressRatio(value)  «docstring: none»
    function isDoneLikeStatus(status)  «docstring: none»
    function estimateCompletedHours(task)  «docstring: none»
    function sumInlineSubtaskHours(subtasks, parentTask, selector)  «docstring: none»
    function buildProjectHoursSummary(tasks = [])  «docstring: none»
    function formatHoursValue(value)  «docstring: none»
    function buildInlineSubgraphData(sourceData, task)  «Build a task-management payload for a task's inline or child-task subgraph.»
    function buildInlineSubtaskTargets(task, childrenByParentId)  «Build synthetic subtask navigation targets when a task has inline descendants.»
    function normalizeExplicitSubtaskTargets(task)  «Normalize explicit subtask navigation targets declared on a task record.»
    function resolveTaskSubtaskTargets(task, childrenByParentId)  «Resolve the preferred subtask navigation targets for a task.»
    function getTaskNarrativeText(task)  «Build a lowercase narrative string used to classify a task's end-state semantics.»
    function resolveProjectEndConfig(project)  «Resolve the configured graph-end metadata from a project payload.»
    function resolveProjectEndMode(project, terminalTasks)  «Infer the semantic end-node mode for a project graph from config and task narratives.»
    function buildProjectEndDetails(project, terminalTasks, projectHours = {})  «Build the end-node popup details for a project graph.»
    function buildProjectTaskTemplate(entry, data, options = {})  «Convert a string-id project_task_template payload into the numeric task template shape.»
    function buildTaskManagementTemplate(entry, data, options = {})  «Build a task-management graph template from TaskDB project data.»
    function isDevMode()  «Detect whether the graph app is running on a local development host.»
    function ensureDynamicTaskTemplate(requestedTemplateId, options = {})  «Fetch and register a dynamic TaskDB template when the requested id is not preloaded.»
    function initTemplates()  «Load all registered graph templates into the runtime registry.»
    function getAvailableTemplates()  «Return lightweight metadata for every registered graph template.»
    function loadTemplate(templateId)  «Load a registered template with safe fallbacks for empty runtime state.»
    function getDefaultTemplateId()  «Return the default template id used when the caller does not specify one.»
    function clearTemplateCache(templateId)  «Remove a specific template (or all templates) from the in-memory cache so the next render fetches fresh data from the se»
    function buildTaskContextIndexes(tasks)  «docstring: none»
    function summarizeContextTask(task, layerById = new Map())  «docstring: none»
    function collectInlineContextSubtasks(subtasks, parentTask, records, ancestry = [])  «docstring: none»
    function collectInlineContextRecords(tasks)  «docstring: none»
    function buildContextTaskPayload(task, indexes)  «docstring: none»
    function extractNodeContext(templateId, nodeId, depth = 1)  «Extract a slice of the project's task data centred on a specific graph node. Returns the focal task, its immediate prede»
    function buildCleanGraphPayload(sourceData, nodeId, depth = 1)  «Build a clean, sorted node.tasks.json payload scoped to a graph node or the full graph. The output is a valid node.tasks»
    function buildProjectTaskTemplatePublic(entry, data, options)  «Public wrapper around project task template construction.»
    function buildInlineTaskSubgraphTemplatePublic(entry, data, inlinePath, options)  «Build a graph template for an inline subtask subgraph selected by synthetic path.»

structure from public/graph-display/js/guide-index.js:
    [file-summary] No top-level file docstring detected
    const LAYER_COLORS  «docstring: none»
    const PRIORITY_COLORS  «docstring: none»
    const RELATION_COLORS  «docstring: none»
    const GUIDE_NODES  «docstring: none»
    const GUIDE_LINKS  «docstring: none»
    const GUIDE_POSITIONS  «docstring: none»
    const FEATURE_DEFINITIONS  «docstring: none»
    function cacheDom()  «docstring: none»
    function activateFeature(featureId)  «docstring: none»
    function renderFeatureButtons()  «docstring: none»
    function renderFeatureCopy()  «docstring: none»
    function renderContractSummary()  «docstring: none»
    function renderPreview()  «docstring: none»
    function getFeatureNodeRadius(node)  «docstring: none»
    function getFeatureNodeFill(node)  «docstring: none»
    function getFeatureLinkStroke(link)  «docstring: none»
    function renderGuideLegend()  «docstring: none»
    function renderGuideGraph()  «docstring: none»

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
        openGraphTaskEditModal(taskId, projectId)  «Open the task edit modal and populate it with the data for the given task.»
        setupGraphTaskModal()  «Wire up the graph task edit modal (called once after the DOM is ready).»
        copyNodeContext(d, details, node, triggerBtn)  «Copy a structured JSON task-subgraph schema to the clipboard. - Root node: full task data including all subtasks (deep c»
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
    function hasHostParentWindow()  «docstring: none»
    function postMessageToHost(type, payload = {})  «docstring: none»
    function clickHostButton(buttonId)  «docstring: none»
    function getActiveProjectIdFromTemplate(template = window.graphInstance?.template || null)  «docstring: none»
    function buildListDisplayUrl(projectId, extraParams = {})  «docstring: none»
    function getTaskNodeModalElement()  «docstring: none»
    function getTaskNodeModalContentElement()  «docstring: none»
    function getInitialTemplateId()  «Resolve the initial template id from the URL, storage, or default registry entry.»
    function setSelectedTemplateId(templateId)  «Persist the currently selected template id for future visits.»

structure from public/graph-display/js/project-index.js:
    [file-summary] No top-level file docstring detected
    const BROWSER_IGNORED_DIRS  «docstring: none»
    const PREVIEW_MAX_CHARS  «docstring: none»
    const ROOT_LABELS  «docstring: none»
    function cacheDom()  «docstring: none»
    function bindEvents()  «docstring: none»
    function normalizePath(value)  «docstring: none»
    function setStatus(message, tone = 'info')  «docstring: none»
    function describeDirectory(entry)  «docstring: none»
    function describeFile(entry)  «docstring: none»
    function openTypedPath()  «docstring: none»
    function loadServerDirectory(rootKey, relativePath = '')  «docstring: none»
    function buildBrowserBreadcrumbs(relativePath)  «docstring: none»
    function pickBrowserFolder()  «docstring: none»
    function getBrowserDirectoryStats(directoryHandle, relativePath)  «docstring: none»
    function buildBrowserFileSummary(fileHandle, relativePath)  «docstring: none»
    function buildBrowserDirectorySnapshot(directoryHandle, relativePath = '')  «docstring: none»
    function loadBrowserDirectory(directoryHandle, relativePath = '')  «docstring: none»
    function renderAll()  «docstring: none»
    function renderBreadcrumbs()  «docstring: none»
    function renderLegend()  «docstring: none»
    function renderSelection()  «docstring: none»
    function clearPreview()  «docstring: none»
    function renderDirectoryList()  «docstring: none»
    function handleEntryAction(entry)  «docstring: none»
    function readBrowserFilePreview(relativePath)  «docstring: none»
    function loadFilePreview(entry)  «docstring: none»
    function renderGraph()  «docstring: none»

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


structure from public/graph-display/js/shared/graph-design-contract.js:
    [file-summary] Reusable design contract for the graph-display component.
    const ALLOWED_COLOR_MODES  «docstring: none»
    const ALLOWED_SIZE_MODES  «docstring: none»
    const ALLOWED_METRIC_SCALES  «docstring: none»
    const ALLOWED_TONE_DIRECTIONS  «docstring: none»
    const PRIORITY_LEVELS  «docstring: none»
    const DEPENDENCY_RELATION_TYPES  «docstring: none»
    const GRAPH_UI_DEFAULTS  «docstring: none»
    const GRAPH_UI_CONFIG_SCHEMA  «docstring: none»
    const GRAPH_RELATION_GUIDE  «docstring: none»
    const GRAPH_SEMANTICS_GUIDE  «docstring: none»
    const GRAPH_HOST_FEATURES  «docstring: none»
    const GRAPH_COMPONENT_INPUT_SCHEMA  «docstring: none»
    const GRAPH_COMPONENT_EXAMPLES  «docstring: none»
    const GRAPH_COMPONENT_CONTRACT  «docstring: none»
    function isPlainObject(value)  «Reusable design contract for the graph-display component.»
    function cloneValue(value)  «docstring: none»
    function mergeWithDefaults(defaults, overrides)  «docstring: none»
    function deepFreeze(value)  «docstring: none»
    function isFiniteNumber(value)  «docstring: none»
    function isHexColor(value)  «docstring: none»
    function collectUnknownKeys(defaults, overrides, path, warnings)  «docstring: none»
    function validateNumber(value, path, errors, options = {})  «docstring: none»
    function createGraphUiConfig(overrides = {})  «Create a runtime config object from the documented defaults plus overrides. Invalid types on known keys are ignored so t»
    function validateGraphUiConfig(overrides = {})  «Validate graph UI overrides before passing them to the renderer.»
    function validateGraphComponentInputs(payload = {})  «Validate the top-level inputs that another host project passes into the graph UI.»
    function getGraphComponentContract()  «docstring: none»

structure from public/graph-display/js/shared/graph-metric-utils.js:
    [file-summary] Shared helpers for resolving custom metric-based node sizing and coloring.
    function isPlainObject(value)  «Shared helpers for resolving custom metric-based node sizing and coloring.»
    function toPathSegments(path)  «docstring: none»
    function getValueAtPath(source, path)  «docstring: none»
    function resolveMetricRadius(node, metricSizing = {})  «docstring: none»
    function resolveMetricColor(node, metricColoring = {}, fallbackHex = '#aabbc8')  «docstring: none»
    function getMetricLegendItems(metricColoring = {}, fallbackHex = '#aabbc8')  «docstring: none»

structure from public/graph-display/js/shared/graph-template-storage.js:
    [file-summary] Browser-local storage for Graph Composer templates.
    const STORED_GRAPH_TEMPLATES_KEY  «Browser-local storage for Graph Composer templates.»
    function isPlainObject(value)  «docstring: none»
    function cloneValue(value)  «docstring: none»
    function getStorage(storageOverride)  «docstring: none»
    function normalizeTemplateId(value)  «docstring: none»
    function normalizeStoredTemplate(template, index = 0)  «docstring: none»
    function readStoredTemplates(storageOverride)  «docstring: none»
    function writeStoredTemplates(templates, storageOverride)  «docstring: none»
    function buildStoredGraphTemplateId(name, existingIds = [])  «docstring: none»
    function listStoredGraphTemplates(storageOverride)  «docstring: none»
    function getStoredGraphTemplate(templateId, storageOverride)  «docstring: none»
    function saveStoredGraphTemplate(template, storageOverride)  «docstring: none»
    function deleteStoredGraphTemplate(templateId, storageOverride)  «docstring: none»

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

structure from public/graph-display/js/shared/project-graph-utils.js:
    [file-summary] No top-level file docstring detected
    const ROOT_COLOR  «docstring: none»
    const FOLDER_COLOR  «docstring: none»
    const FILE_TYPE_COLORS  «docstring: none»
    const IMAGE_EXTENSIONS  «docstring: none»
    const TEXT_LIKE_EXTENSIONS  «docstring: none»
    function clamp(value, min, max)  «docstring: none»
    function escapeHtml(value)  «docstring: none»
    function formatBytes(bytes)  «docstring: none»
    function getFileExtension(name)  «docstring: none»
    function isTextLikeFileName(name)  «docstring: none»
    function getFileTypeKey(entryOrName)  «docstring: none»
    function getLegendLabel(typeKey)  «docstring: none»
    function getNodeColor(entry)  «docstring: none»
    function getNodeRadius(entry)  «docstring: none»
    function truncateLabel(value, maxLength = 18)  «docstring: none»
    function buildLegendEntries(entries = [])  «docstring: none»

structure from public/graph-display/js/shared/tours.js:
    [file-summary] Generates/returns walkthrough steps for different templates. - If a template provides `meta.walkthroughSteps` (array), use that. - Otherwise generate sensible steps from nodes/details for known templa
    function getStepsForTemplate(templateId, nodes = [], details = {}, meta = {})  «Generates/returns walkthrough steps for different templates. - If a template provides `meta.walkthroughSteps` (array), u»
    function resolveTourUrl(path, basePath)  «Resolve a walkthrough JSON path relative to the graph app base path.»
    function resolveStepsForTemplate(templateId, nodes = [], details = {}, meta = {}, basePath = './')  «Resolve steps for a template. Priority: 1) meta.walkthroughSteps (inline) 2) meta.walkthroughStepsPath (JSON file) 3) Ge»

structure from public/graph-display/schema/graph-template.schema.json:
    [file-summary] Graph Template — Direct template payload for the reusable graph-display runtime and Graph Composer.
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "./graph-template.schema.json"
    [json-key] title: "Graph Template"
    [json-key] description: "Direct template payload for the reusable graph-display runti..."
    [json-key] type: "object"
    [json-key] required: [5 items]
    [json-key] properties: {id, name, description, nodes, links, +5 more}
    [json-key] additionalProperties: true
    [json-key] $defs: {priorityLevel, graphNode, graphLink, nodeDetails, templateMeta}

structure from public/graph-display/schema/graph-ui-config.schema.json:
    [file-summary] Graph UI Config — Config overrides supported by the reusable graph-display runtime.
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "./graph-ui-config.schema.json"
    [json-key] title: "Graph UI Config"
    [json-key] description: "Config overrides supported by the reusable graph-display run..."
    [json-key] type: "object"
    [json-key] properties: {colorMode, sizeMode, nodeSizes, priorityColorsHex, taskSizing, +15 more}
    [json-key] additionalProperties: true
    [json-key] $defs: {hexColor}

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
    [selector] .tpp-overlay
    [selector] .tpp-content
    [selector] .tpp-overlay.tpp-visible .tpp-content
    [selector] .tpp-close
    [selector] .tpp-close:hover
    [selector] .tpp-badge-row
    [selector] .tpp-badge
    [selector] .tpp-badge.priority-low
    [selector] .tpp-badge.priority-medium
    [selector] .tpp-badge.priority-high
    [selector] .tpp-badge.priority-critical
    [selector] .tpp-badge.status-badge
    [selector] .tpp-badge.critical-path
    [selector] .tpp-title
    [selector] .tpp-meta
    [selector] .tpp-meta span
    [selector] .tpp-description
    [selector] .tpp-details
    [selector] .tpp-details ul
    [selector] .tpp-details li
    [selector] .tpp-section-title
    [selector] .tpp-tag-list
    [selector] .tpp-tag
    [selector] .tpp-dep-btn
    [selector] .tpp-dep-btn:hover
    [selector] .tpp-subtask-list
    [selector] .tpp-subtask-list li
    [selector] .tpp-subtask-status
    [selector] .tpp-actions
    [selector] .tpp-btn-edit
    [selector] .tpp-btn-edit:hover
    [selector] .tpp-btn-close
    [selector] .tpp-btn-close:hover
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
        getTaskEditModal()  «Get the task edit modal using the new descriptive id with a legacy fallback.»
        getTaskEditModalTitle()  «Get the task edit modal title using the new descriptive id with a legacy fallback.»
        getGraphTemplateIdForActiveProject()  «Get graph template id for active project.»
        getStoredFolderProjects()  «Get stored folder projects.»
        registerFolderProjectOption(projectRecord)  «Register folder project option.»
        initializeFolderProjectPicker()  «Initialize folder project picker.»
        buildGraphIframeSrc()  «Build graph iframe src.»
        async ensureGraphIframeLoaded()  «Ensure graph iframe loaded.»
        async initialize()  «Initialize initialize.»
        maybeOpenAddTaskFromQuery()  «Open the add-task modal once when requested through the URL.»
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
        async copyTaskSchema()  «Copy the reusable node.tasks.json authoring template to the clipboard.»
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
        _showTaskPreviewPopup(task)  «Show a graph-style preview popup for a task. Clicking "Edit Task" inside the popup proceeds to the taskEditModal.»
        _openReadOnlyTask(task)  «Open read only task.»
        _injectReadOnlyDepLinks(task)  «In read-only task detail: hide the deps textarea and show clickable dep-link buttons. Each button navigates to the prede»
        navigateToDependency(predecessorId)  «Close the current modal and open the task detail for the specified predecessor task ID. Works across root tasks and the »
        _editTask(taskId)  «Edit task.»
        async _applyTaskUpdateFromGraph(taskId, taskData)  «Apply a task update received via postMessage from the graph-display modal. Merges the changed fields into the in-memory »
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

structure from public/local-folder/js/folder-cache.js:
    [file-summary] FolderCache — IndexedDB-backed cache for local-folder TaskDB projects.

structure from public/local-folder/js/folder-picker-trigger.js:
    [file-summary] UI binding layer for launching the local-folder picker from browser surfaces.

structure from public/local-folder/js/local-folder-scanner.js:
    [file-summary] Browser-side local-folder scanner and TaskDB project registry.

structure from public/local-folder/task-bridge-modules/taskbridge/package.json:
    [file-summary] task-bridge — Local bridge server for task file editing via GitHub Pages UI
    [json-key] name: "task-bridge"
    [json-key] version: "1.0.0"
    [json-key] description: "Local bridge server for task file editing via GitHub Pages U..."
    [json-key] type: "module"
    [json-key] scripts: {start, dev}
    [json-key] engines: {node}

structure from public/local-folder/task-bridge-modules/taskbridge/server.js:
    [file-summary] server.js — Local bridge server ───────────────────────────────── Run once: node server.js That's it. Browser opens automatically.
    const __dirname  «docstring: none»
    const PORT  «docstring: none»
    const TASKS_FILE  «docstring: none»
    const PUBLIC_DIR  «docstring: none»
    const MIME  «docstring: none»
    function openBrowser(url)  «docstring: none»

structure from public/local-folder/task-bridge-modules/taskbridge/public/task-engine/js/app-integration-example.js:
    [file-summary] app-integration-example.js ────────────────────────── Shows exactly how to wire CacheWatchdog + TaskStorageSync into your existing TaskManagerApp / list-display-controller.js
    function initApp()  «docstring: none»
    function saveTasks()  «docstring: none»
    function editTask(id, changes)  «docstring: none»
    function deleteTask(id)  «docstring: none»

structure from public/local-folder/task-bridge-modules/taskbridge/public/task-engine/js/cache-watchdog.js:
    [file-summary] cache-watchdog.js — Client-side event-driven cache manager
    export class CacheWatchdog  «cache-watchdog.js — Client-side event-driven cache manager»:
        constructor(config = {})  «docstring: none»
        async initialize()  «Load initial data from the bridge and register all event triggers. Call this once during app startup.»
        acknowledge(etag)  «Call this immediately after your app finishes writing to the bridge. Stores the ETag from the save response so the watch»
        beginSave()  «Mark that a save operation is starting. Prevents the watchdog from triggering a reload while save is in flight.»
        endSave()  «Mark that a save operation is done (call in finally block).»
        async forceRefresh()  «Force a full reload regardless of ETag. Use for "Refresh" buttons or after coming back online.»
        destroy()  «Remove all event listeners. Call when tearing down the app.»
        _registerTriggers()  «docstring: none»
        async _check(trigger)  «docstring: none»
        async _fetchFull(trigger)  «docstring: none»
        _setBridgeOnline(online)  «docstring: none»


structure from public/local-folder/task-bridge-modules/taskbridge/public/task-engine/js/task-storage-sync.js:
    [file-summary] task-storage-sync.js — Client-side task CRUD + sync layer
    export class TaskStorageSync  «task-storage-sync.js — Client-side task CRUD + sync layer»:
        constructor(config = {})  «docstring: none»
        setWatchdog(watchdog)  «Wire in the CacheWatchdog so saves automatically call acknowledge().»
        async isOnline()  «Returns true if the bridge server is reachable. Safe to call before initialize() to show/hide the "run server.js" prompt»
        async loadAll(knownEtag = null)  «Load all tasks from the bridge. Returns { tasks, etag, fromCache } — fromCache=true means 304, data unchanged.»
        async saveAll(tasks)  «Replace the entire task list on disk. Signals the watchdog before + after so it doesn't trigger a phantom reload.»
        async updateOne(id, patch)  «Patch a single task by id. Only sends changed fields — server merges with existing record.»
        async deleteOne(id)  «Delete a single task by id.»
        _fetch(url, options = {})  «Fetch with timeout. Throws on network error or timeout.»


structure from public/local-folder/task-bridge-modules/taskbridge/server/bridge-router.js:
    [file-summary] bridge-router.js — HTTP request router for the local bridge server Drop this into your existing server.js createServer() handler.
    function createBridgeRouter(config = {})  «docstring: none»

structure from public/local-folder/task-bridge-modules/taskbridge/server/file-editor.js:
    [file-summary] file-editor.js — Server-side atomic file read/write module Zero dependencies. Uses only Node.js built-ins.
    function getETag(filePath)  «Returns a quoted ETag string based on the file's last-modified timestamp. Returns '"0"' if the file does not exist yet.»
    function etagMatches(filePath, clientEtag)  «Returns true if the ETag the client sent matches the file's current ETag. Use this to short-circuit GET and send 304 Not»
    function readJSON(filePath, fallback = null)  «Read a JSON file. Returns parsed object, or `fallback` if the file doesn't exist. Throws on malformed JSON so bugs surfa»
    function readText(filePath, fallback = '')  «Read a raw text file. Returns string, or `fallback` if not found.»
    function writeAtomic(filePath, content, options = {})  «Atomically write content to filePath.»
    function writeJSON(filePath, data, options = {})  «Atomically write a JS value as pretty-printed JSON.»
    function writeBatch(entries, options = {})  «Write multiple files in parallel, all atomically. Each entry: { path: string, content: string | object } If content is a»
    function safePath(rootDir, userPath)  «Resolve `userPath` relative to `rootDir` and verify the result stays inside `rootDir`. Returns the absolute path or thro»
    function fileExists(filePath)  «Returns true if a file exists and is readable.»
    function listFiles(dirPath)  «List all files in a directory (non-recursive, sorted). Returns [] if directory doesn't exist.»

structure from public/task-engine/file-editing/edit-cloud/github-worker.strategy.json:
    [json-key] id: "edit-cloud-github-worker"
    [json-key] scope: "cloud"
    [json-key] priority: 1
    [json-key] writeTargets: [2 items]
    [json-key] preconditions: [3 items]
    [json-key] steps: [5 items]
    [json-key] fallbacks: [1 items]
    [json-key] successSignals: [3 items]

structure from public/task-engine/file-editing/edit-local/local-filesystem.strategy.json:
    [json-key] id: "edit-local-filesystem"
    [json-key] scope: "local"
    [json-key] priority: 1
    [json-key] writeTargets: [3 items]
    [json-key] preconditions: [3 items]
    [json-key] steps: [4 items]
    [json-key] fallbacks: [2 items]
    [json-key] successSignals: [3 items]

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


structure from public/task-engine/js/task-schema-clipboard.js:  (no extractable definitions)

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
        getBridgeIntegration()  «Resolve and memoize the optional local bridge integration adapter.»
        buildFullData(tasks = this.tasks)  «Build the full persisted TaskDB payload for the current task collection.»
        generateStateFiles(tasks = this.tasks)  «Generate state summary files grouped by task status.»
        async saveTasksToLocalFolder(message = 'Update tasks')  «Write edited tasks back to the original local folder file via FolderProjectService. Uses the FS Access API writeback if »
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
    function normalizeTaskFilePath(pathValue, fallback = 'node.tasks.json')  «Normalize a TaskDB file path so authored modules always use node.tasks.json.»
    function resolveTemplateConfig()  «Resolve the shared template configuration object from browser or test globals.»
    function hasValidGitHubToken()  «Determine whether a usable GitHub token is configured for direct saves.»
    function resolveActiveProjectId()  «Resolve the active project id from config hints or the configured tasks file path.»
    function getProjectScopedStorageKey()  «Build the localStorage key scoped to the currently active project.»

structure from public/task-engine/js/bridge/cache-watchdog.js:
    [file-summary] No top-level file docstring detected
    class CacheWatchdog  «docstring: none»:
        constructor(config = {})  «docstring: none»
        setApiUrl(apiUrl)  «docstring: none»
        async initialize()  «docstring: none»
        acknowledge(etag)  «docstring: none»
        beginSave()  «docstring: none»
        endSave()  «docstring: none»
        async forceRefresh()  «docstring: none»
        destroy()  «docstring: none»
        _registerTriggers()  «docstring: none»
        async _check(trigger)  «docstring: none»
        async _fetchFull(trigger)  «docstring: none»
        _setBridgeOnline(online)  «docstring: none»


structure from public/task-engine/js/bridge/task-storage-sync.js:
    [file-summary] No top-level file docstring detected
    class TaskStorageSync  «docstring: none»:
        constructor(config = {})  «docstring: none»
        setWatchdog(watchdog)  «docstring: none»
        setProjectId(projectId)  «docstring: none»
        async isOnline()  «docstring: none»
        async loadPayload(knownEtag = null)  «docstring: none»
        async savePayload(payload)  «docstring: none»
        _rebuildUrls()  «docstring: none»
        _fetch(url, options = {})  «docstring: none»


structure from public/task-engine/js/bridge/taskdb-bridge-integration.js:  (no extractable definitions)

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
    [json-key] tasks: [36 items]

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

structure from tests/e2e/local-project-editing.spec.js:
    [file-summary] Realistic local-project regression: context rendering + local CRUD flow.
    const TIMEOUT  «docstring: none»
    function waitForAppReady(page)  «docstring: none»
    [describe] local project editing parity  «docstring: none»

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

structure from tests/unit/bridge-workspace.test.js:
    [file-summary] No top-level file docstring detected
    const ROOT  «docstring: none»
    [describe] agentic bridge workspace  «docstring: none»

structure from tests/unit/folder-cache.test.js:
    [file-summary] Unit tests for the FolderCache IndexedDB-backed cache engine.
    function loadFolderCache()  «Load folder-cache.js into a Node test harness with a stubbed IndexedDB.»
    [describe] FolderCache  «Validate FolderCache save, load, and hash-based change detection.»

structure from tests/unit/generate-project-calendars.test.js:
    [file-summary] Unit coverage for TaskDB-to-calendar generation and project descriptor discovery.
    [describe] Calendar Parser  «Validate calendar state generation and descriptor discovery from TaskDB data.»

structure from tests/unit/graph-data.test.js:
    [file-summary] Basic sanity test for `public/graph-display/js/graph-data.js` to ensure it parses without syntax errors in the Node test environment.
    function loadGraphDataModule(windowMock = { location: { pathname: '/public/graph-display/index.html', hostname: '127.0.0.1', search: '' } }, fetchMock = async () => ({ ok: false, status: 404, json: async () => ({}) })  «Load the browser graph-data module into a Node test harness with mocked globals.»
    [describe] Graph Data Module  «Validate that the graph-data module parses and builds task graph templates correctly.»

structure from tests/unit/graph-design-contract.test.js:
    [file-summary] Unit tests for the reusable graph-display contract surface.
    function loadGraphDesignContractModule()  «docstring: none»
    [describe] Graph Design Contract  «docstring: none»

structure from tests/unit/graph-schemas.test.js:
    [file-summary] Unit tests for the machine-readable graph schema snapshots.
    [describe] Graph JSON Schemas  «docstring: none»

structure from tests/unit/graph-template-storage.test.js:
    [file-summary] Unit tests for browser-local Graph Composer template storage.
    function loadGraphTemplateStorageModule()  «docstring: none»
    function createMockStorage()  «docstring: none»
    [describe] Graph Template Storage  «docstring: none»

structure from tests/unit/inference-engines.test.js:
    [file-summary] Inference Engine Isolation Tests Validates engine registration, ranking, and GGUF header parsing behavior.
    [describe] Inference Manager  «docstring: none»

structure from tests/unit/inference-request-schema.test.js:
    [file-summary] No top-level file docstring detected
    [describe] Inference Request Schema  «docstring: none»

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

structure from tests/unit/task-schema-clipboard.test.js:
    [file-summary] No top-level file docstring detected
    [describe] TaskSchemaClipboard  «docstring: none»

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
    [heading-2] ## 2026-04 Update
    [heading-3] ### Verified Improvements
    [heading-3] ### Open Risks
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

structure from tools/scripts/start-agentic-ide-stack.ps1:  (no extractable definitions)

structure from tools/scripts/validate-agentic-cells.js:
    [file-summary] No top-level file docstring detected
    const SUPPORTED_CELL_TYPES  «docstring: none»
    function toPosix(p)  «docstring: none»
    function readJson(filePath)  «docstring: none»
    function listFilesRecursive(rootDir)  «docstring: none»
    function parseArgs(argv)  «docstring: none»
    function expectedKindFromPath(relPath)  «docstring: none»
    function normalizeType(rawType, relPath, warnings, where)  «docstring: none»
    function normalizePortArray(raw, fallbackName)  «docstring: none»
    function getDocInputs(doc)  «docstring: none»
    function getDocOutputs(doc)  «docstring: none»
    function getDocFiles(doc)  «docstring: none»
    function getDocTests(doc)  «docstring: none»
    function validatePortArray(kind, ports, where, errors)  «docstring: none»
    function validateContractFile(schemaPath, strictSchemas, warnings, errors)  «docstring: none»
    function main()  «docstring: none»

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

structure from tools/task-bridge/README.md:
    [file-summary] Task Bridge Module
    [heading-1] # Task Bridge Module
    [heading-2] ## Goals
    [heading-2] ## Structure
    [heading-2] ## API
    [heading-2] ## Project Integration

structure from tools/task-bridge/package.json:
    [file-summary] task-bridge — Reusable local bridge server for multi-file TaskDB edits
    [json-key] name: "task-bridge"
    [json-key] version: "1.0.0"
    [json-key] description: "Reusable local bridge server for multi-file TaskDB edits"
    [json-key] type: "module"
    [json-key] scripts: {start, dev}
    [json-key] engines: {node}

structure from tools/task-bridge/server.js:
    [file-summary] No top-level file docstring detected
    const __dirname  «docstring: none»
    const PORT  «docstring: none»
    const TASKS_FILE  «docstring: none»
    const PUBLIC_DIR  «docstring: none»
    const MIME  «docstring: none»
    function openBrowser(url)  «docstring: none»

structure from tools/task-bridge/server/bridge-router.js:
    [file-summary] No top-level file docstring detected
    function createBridgeRouter(config = {})  «docstring: none»

structure from tools/task-bridge/server/file-editor.js:
    [file-summary] No top-level file docstring detected
    function getETag(filePath)  «docstring: none»
    function etagMatches(filePath, clientEtag)  «docstring: none»
    function readJSON(filePath, fallback = null)  «docstring: none»
    function readText(filePath, fallback = '')  «docstring: none»
    function writeAtomic(filePath, content, options = {})  «docstring: none»
    function writeJSON(filePath, data, options = {})  «docstring: none»
    function writeBatch(entries, options = {})  «docstring: none»
    function safePath(rootDir, userPath)  «docstring: none»
    function fileExists(filePath)  «docstring: none»
    function listFiles(dirPath)  «docstring: none»

---

## Relations structure

relations from server.js:
    [require] http
    [require] fs
    [require] path
    [require] url

relations from public/agentic-ide/index.html:
    [asset] ui/style.css
    [asset] js/main.js

relations from public/agentic-ide/chat/index.html:
    [asset] ./css/chat-lab.css
    [asset] ./js/chat-app.js

relations from public/agentic-ide/chat/playwright.config.js:
    [import] @playwright/test

relations from public/agentic-ide/chat/js/chat-app.js:
    [import] ./chat-state.js
    [import] ./chat-api.js
    [import] ./chat-render.js
    [import] ./chat-telemetry.js
    [import] ./chat-tests.js
    [import] ../../components/agents/chat-quality-inspector/main.js

relations from public/agentic-ide/chat/js/chat-response-validator.js:
    [import] ../components/tools/chat-quality-inspector/main.js

relations from public/agentic-ide/chat/tests/chat-lab.spec.js:
    [import] @playwright/test

relations from public/agentic-ide/chat/tests/inference-chat-hello-world.spec.js:
    [import] @playwright/test

relations from public/agentic-ide/chat/tests/inference-ui-series.spec.js:
    [import] @playwright/test
    [import] fs
    [import] path

relations from public/agentic-ide/components/agents/chat-quality-inspector/test.js:
    [import] ./main.js

relations from public/agentic-ide/components/inference/main.js:
    [require] fs
    [require] path
    [require] ./engines/node-llama-cpp/adapter
    [require] ./engines/llama-server-openai/adapter
    [require] ./engines/duck4i-llama/adapter
    [require] ./engines/llmjs/adapter
    [require] ./engines/webllm/adapter
    [require] ./engines/llama3pure/adapter
    [require] ./engines/hyllama/adapter

relations from public/agentic-ide/components/inference/engines/duck4i-llama/adapter.js:
    [require] fs

relations from public/agentic-ide/components/inference/engines/hyllama/adapter.js:
    [require] fs

relations from public/agentic-ide/components/inference/tests/benchmark.js:
    [require] fs
    [require] path
    [require] ./text/run-validation-suite
    [require] ./coding/run-coding-suite
    [require] ./select-best

relations from public/agentic-ide/components/inference/tests/select-best.js:
    [require] fs
    [require] path

relations from public/agentic-ide/components/inference/tests/coding/run-coding-suite.js:
    [require] fs
    [require] path
    [require] util
    [require] vm
    [require] ../../main

relations from public/agentic-ide/components/inference/tests/text/hello-world-conformance.js:
    [require] fs
    [require] path

relations from public/agentic-ide/components/inference/tests/text/run-validation-suite.js:
    [require] fs
    [require] path
    [require] ../../main

relations from public/agentic-ide/components/tools/folder-graph-scanner/main.js:
    [import] fs
    [import] path

relations from public/agentic-ide/js/bridge-server.js:
    [require] http
    [require] crypto
    [require] fs
    [require] path
    [require] url
    [require] ./bridge-workspace
    [require] ../components/inference/main
    [require] ../components/inference/request-schema

relations from public/agentic-ide/js/bridge-workspace.js:
    [require] crypto
    [require] fs
    [require] path

relations from public/agentic-ide/js/export.js:
    [import] ./state.js
    [import] ./utils.js
    [import] ./render.js

relations from public/agentic-ide/js/main.js:
    [import] ./state.js
    [import] ./render.js
    [import] ./modals.js
    [import] ./export.js
    [import] ./schema-preview.js
    [import] ./utils.js
    [import] ./bridge.js
    [import] ../components/agents/chat-quality-inspector/main.js

relations from public/agentic-ide/js/modals.js:
    [import] ./types.js
    [import] ./state.js
    [import] ./utils.js
    [import] ./render.js

relations from public/agentic-ide/js/render.js:
    [import] ./types.js
    [import] ./state.js
    [import] ./utils.js
    [import] ./bridge.js

relations from public/agentic-ide/js/schema-preview.js:
    [import] ./bridge.js

relations from public/agentic-ide/js/state.js:
    [import] ./utils.js

relations from public/agentic-ide/js/utils.js:
    [import] ./types.js
    [import] ./state.js

relations from public/agentic-ide/tests/inference-debug.js:
    [require] http

relations from public/graph-composer/guide-index.html:
    [asset] images/favicon.svg
    [asset] images/favicon.png
    [asset] css/guide-index.css
    [asset] js/d3.v7.min.js
    [asset] js/guide-index.js

relations from public/graph-composer/index.html:
    [asset] css/graph-composer.css
    [asset] js/composer-app.js

relations from public/graph-composer/project-index.html:
    [asset] images/favicon.svg
    [asset] images/favicon.png
    [asset] css/project-index.css
    [asset] js/d3.v7.min.js
    [asset] js/project-index.js

relations from public/graph-composer/js/composer-app.js:
    [import] ../../graph-display/js/shared/graph-design-contract.js
    [import] ../../graph-display/js/shared/graph-template-storage.js
    [import] ./composer-defaults.js
    [import] ./composer-state.js
    [import] ./composer-render.js

relations from public/graph-composer/js/composer-defaults.js:
    [import] ../../graph-display/js/shared/link-types.js
    [import] ../../graph-display/js/shared/graph-design-contract.js

relations from public/graph-composer/js/composer-state.js:
    [import] ../../graph-display/js/shared/graph-design-contract.js
    [import] ./composer-defaults.js

relations from public/graph-display/index.html:
    [asset] images/favicon.svg
    [asset] images/favicon.png
    [asset] manifest.json
    [asset] css/styles-new.css
    [asset] js/d3.v7.min.js
    [asset] ../local-folder/js/folder-cache.js
    [asset] ../local-folder/js/local-folder-scanner.js
    [asset] ../local-folder/js/folder-picker-trigger.js
    [asset] ../task-engine/js/task-schema-clipboard.js
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
    [import] ./shared/graph-template-storage.js

relations from public/graph-display/js/guide-index.js:
    [import] ./shared/project-graph-utils.js

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
    [asset] ../local-folder/js/folder-cache.js
    [asset] ../local-folder/js/local-folder-scanner.js
    [asset] ../local-folder/js/folder-picker-trigger.js
    [asset] ../task-engine/js/task-schema-clipboard.js
    [asset] ../task-engine/js/task-schema-validator.js
    [asset] ../task-engine/js/task-field-automation.js
    [asset] ../task-engine/js/bridge/cache-watchdog.js
    [asset] ../task-engine/js/bridge/task-storage-sync.js
    [asset] ../task-engine/js/bridge/taskdb-bridge-integration.js
    [asset] ../task-engine/js/task-storage-sync.js
    [asset] ../calendar/js/task-ics-export.js
    [asset] ./js/list-display-controller.js

relations from public/local-folder/task-bridge-modules/taskbridge/server.js:
    [import] http
    [import] path
    [import] fs/promises
    [import] child_process
    [import] url
    [import] ./server/bridge-router.js
    [import] ./server/file-editor.js

relations from public/local-folder/task-bridge-modules/taskbridge/public/task-engine/js/app-integration-example.js:
    [import] ./task-storage-sync.js
    [import] ./cache-watchdog.js

relations from public/local-folder/task-bridge-modules/taskbridge/server/bridge-router.js:
    [import] ./file-editor.js
    [import] path
    [import] os

relations from public/local-folder/task-bridge-modules/taskbridge/server/file-editor.js:
    [import] fs/promises
    [import] path
    [import] os

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

relations from tests/e2e/local-project-editing.spec.js:
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

relations from tests/unit/bridge-workspace.test.js:
    [require] path
    [require] ../../public/agentic-ide/js/bridge-workspace

relations from tests/unit/folder-cache.test.js:
    [require] fs
    [require] path

relations from tests/unit/generate-project-calendars.test.js:
    [require] ../../tools/calendar/generate-project-calendars.js
    [require] ../../tools/calendar/calendar-constants.js
    [require] path

relations from tests/unit/graph-data.test.js:
    [require] fs
    [require] path

relations from tests/unit/graph-design-contract.test.js:
    [require] fs
    [require] path

relations from tests/unit/graph-schemas.test.js:
    [require] fs
    [require] path

relations from tests/unit/graph-template-storage.test.js:
    [require] fs
    [require] path

relations from tests/unit/inference-engines.test.js:
    [require] fs
    [require] path
    [require] ../../public/agentic-ide/components/inference/main
    [require] ../../public/agentic-ide/components/inference/engines/hyllama/adapter

relations from tests/unit/inference-request-schema.test.js:
    [require] ../../public/agentic-ide/components/inference/request-schema

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

relations from tests/unit/task-schema-clipboard.test.js:
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

relations from tools/scripts/validate-agentic-cells.js:
    [require] fs
    [require] path

relations from tools/scripts/validate-commit-format.js:
    [require] child_process

relations from tools/scripts/validate-tasks-schema.js:
    [require] fs
    [require] path

relations from tools/scripts/validate-tasks-workers.js:
    [require] fs
    [require] path

relations from tools/task-bridge/server.js:
    [import] http
    [import] path
    [import] fs/promises
    [import] child_process
    [import] url
    [import] ./server/bridge-router.js

relations from tools/task-bridge/server/bridge-router.js:
    [import] os
    [import] ./file-editor.js

relations from tools/task-bridge/server/file-editor.js:
    [import] fs/promises
    [import] path
    [import] os

---

## Flow structure

flow from server.js:
    input -> transform -> state -> output
    [input] scanFolderToGraph, readBody, readJsonFile, readDirectoryEntries
    [transform] generatePersistedCSV, normalizeRelativePath, inferModuleDepartment, inferModuleType
    [state] generatePersistedCSV, writeProjectPayload, writeStateFiles
    [output] sendJson, createServer

flow from public/agentic-ide/chat/js/chat-api.js:
    input -> state
    [input] fetchCatalog, fetchRegistry, fetchModelInfo
    [state] saveArtifact

flow from public/agentic-ide/chat/js/chat-app.js:
    input -> transform -> state -> output
    [input] readConfigFromUi, loadFiles
    [transform] buildContextBlock, buildMessages, toNormalizedTokens, extractResponseContent
    [state] writeConfigToUi, syncSliderLabels
    [output] renderEngineOptions, render, sendMessage, exportJson

flow from public/agentic-ide/chat/js/chat-render.js:
    input -> output
    [input] renderThread
    [output] renderThread

flow from public/agentic-ide/chat/js/chat-response-validator.js:
    transform
    [transform] validateResponse, extractValidatedContent

flow from public/agentic-ide/chat/js/chat-state.js:
    input -> state
    [input] loadState
    [state] saveState

flow from public/agentic-ide/chat/js/chat-telemetry.js:
    transform
    [transform] buildArtifactBundle

flow from public/agentic-ide/chat/tests/inference-chat-hello-world.spec.js:
    input
    [input] waitForPageReady, openChat, readChatMessages

flow from public/agentic-ide/chat/tests/inference-ui-series.spec.js:
    input -> output
    [input] loadCases
    [output] sendPrompt

flow from public/agentic-ide/components/agents/chat-quality-inspector/main.js:
    transform
    [transform] _extractContent

flow from public/agentic-ide/components/inference/main.js:
    input -> transform -> state
    [input] readJsonIfExists
    [transform] resolvePrunedEngineIds, normalizeContext, buildStaticCompatibilityScore, createInferenceManager
    [state] getPassingEngineSet

flow from public/agentic-ide/components/inference/request-schema.js:
    transform
    [transform] extractTextFromMessageContent, normalizeRole, normalizeMessages, buildPromptFromMessages

flow from public/agentic-ide/components/inference/engines/duck4i-llama/adapter.js:
    transform
    [transform] resolvePrompt

flow from public/agentic-ide/components/inference/engines/hyllama/adapter.js:
    input
    [input] readGgufHeader

flow from public/agentic-ide/components/inference/engines/llama-server-openai/adapter.js:
    input -> transform -> output
    [input] buildChatPayload, createLlamaServerOpenAiEngine
    [transform] normalizeBaseUrl, resolveSlotId, buildChatPayload
    [output] createLlamaServerOpenAiEngine

flow from public/agentic-ide/components/inference/engines/node-llama-cpp/adapter.js:
    input -> transform
    [input] sanitizeCompletionPayload, buildChatPayload
    [transform] normalizeBaseUrl, extractMessageText, resolveSlotId, buildChatPayload

flow from public/agentic-ide/components/inference/tests/benchmark.js:
    transform -> state
    [transform] runInferenceBenchmark
    [state] writeBenchmarkReport

flow from public/agentic-ide/components/inference/tests/select-best.js:
    input -> transform
    [input] readJson
    [transform] buildCombinedCaseLeaderboard

flow from public/agentic-ide/components/inference/tests/coding/run-coding-suite.js:
    input -> transform
    [input] readJson, loadCandidateFunction
    [transform] extractCode, buildPrompt, summarizeEngine, buildTimestamp

flow from public/agentic-ide/components/inference/tests/text/hello-world-conformance.js:
    input
    [input] fetchWithTimeout

flow from public/agentic-ide/components/inference/tests/text/run-validation-suite.js:
    input -> transform
    [input] readJson
    [transform] buildPrompt, computePromptTokenOverlap, summarizeEngine, buildTimestamp

flow from public/agentic-ide/components/tools/benchmark_result_writer_v1/main.js:
    input -> transform -> state
    [input] shouldSkipHistoryReads, fetchJson, loadPreviousRecord
    [transform] safeJsonParse, normalizeTopicTerms, computeComponentScore, summarizeComponents
    [state] persistRecord

flow from public/agentic-ide/components/tools/folder-graph-scanner/main.js:
    input -> transform
    [input] FolderGraphScanner, scan, scanFolder, scanFile
    [transform] generateId, inferIOPatterns

flow from public/agentic-ide/components/tools/folder-graph-scanner/ui/main.js:
    input -> transform
    [input] initFolderScannerUI, wireScanner, showFolderScannerUI
    [transform] getNodeTypeSummary

flow from public/agentic-ide/components/tools/research_benchmark_runner_v1/main.js:
    input -> transform
    [input] fetchJson, readModelStatus
    [transform] normalizeTopic

flow from public/agentic-ide/js/bridge-server.js:
    input -> transform -> state
    [input] readJsonIfExists, readBody, buildInferencePayload
    [transform] getActiveInferenceManifest, resolveRequestedEngineId, resolveInferenceEngine, buildInferencePayload
    [state] getModelAssetInfo, replyCachedJson

flow from public/agentic-ide/js/bridge-workspace.js:
    input -> transform -> output
    [input] readText, createMockFetch, loadRunFunction, discoverWorkspace
    [transform] parseJson, normalizePorts, normalizeStringList, normalizeRefList
    [output] renderPromptTemplate

flow from public/agentic-ide/js/bridge.js:
    input -> state
    [input] fetchCachedJson, readFile
    [state] getCacheEntry, fetchCachedJson, getCachedEtag, writeFile

flow from public/agentic-ide/js/export.js:
    input -> output
    [input] downloadJSON
    [output] wireExport

flow from public/agentic-ide/js/main.js:
    input -> transform -> state -> output
    [input] renderChatThread, openChatModal
    [transform] summarizeNodeForChat, summarizeRuntimeReport, buildChatPrompt, buildConstrainedPrompt
    [state] setupSplitter, setupLayoutSplitters, syncMobileScrim, chatPresetText
    [output] renderGlobalControls, renderChatConfigurator, renderChatThread, sendChatMessage

flow from public/agentic-ide/js/modals.js:
    input -> state
    [input] openNodeModal, openEdgeModal
    [state] updateNodeModalExtra

flow from public/agentic-ide/js/render.js:
    input -> transform -> state -> output
    [input] isTreeOpen, loadTasksForPanel, openFile
    [transform] resolveTasksUrl, buildScopeCrumbs, buildFileSymbolEntries, buildComponentFileTree
    [state] setSidebarTab, setupDragEvents, setScope, syncEditorHighlight
    [output] requestCanvasRender, renderLibraryEntry, renderSidebarNode, renderLibrarySidebar

flow from public/agentic-ide/js/schema-preview.js:
    input
    [input] openSchemaPreview, _downloadText

flow from public/agentic-ide/js/state.js:
    input -> transform -> state
    [input] readPersistedState, loadState
    [transform] buildCrumbs
    [state] readPersistedState, saveState, setBridgeStatus

flow from public/agentic-ide/js/utils.js:
    input -> transform
    [input] loadFileContent
    [transform] parsePorts

flow from public/agentic-ide/tests/inference-quality-test.js:
    transform
    [transform] extractMathAnswer, runInferenceTest

flow from public/config/worker-url.js:
    transform
    [transform] __resolveWorkerUrlRuntime

flow from public/graph-composer/js/composer-app.js:
    input -> state -> output
    [input] loadTemplate, readNodeDraft, readLinkDraft
    [state] setStatus, refreshStoredTemplates, persistCurrentTemplate, cacheDom
    [output] renderPanels, renderAll, exportCurrentTemplate

flow from public/graph-composer/js/composer-defaults.js:
    state
    [state] getMeasurementPresetById

flow from public/graph-composer/js/composer-render.js:
    transform -> state -> output
    [transform] renderValidationSummary
    [state] renderSavedTemplateList, renderMeasurementPresets
    [output] renderSchemaField, renderConfigEditor, renderSavedTemplateList, renderMeasurementPresets

flow from public/graph-composer/js/composer-state.js:
    transform -> state -> output
    [transform] normalizeNode, normalizeLink, normalizeDetails, parseJsonText
    [state] setValueAtPath, updateTemplateField, applyMeasurementPreset, updateNodeDetails
    [output] buildExportJson

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
    input -> transform -> state
    [input] loadTemplate, buildContextTaskPayload, buildCleanGraphPayload
    [transform] normalizePriority, buildDependencyLayering, validateAgainstSchema, resolveProjectIdFromTasksPath
    [state] registerStoredComposerTemplates, clearTemplateCache

flow from public/graph-display/js/guide-index.js:
    transform -> state -> output
    [transform] renderContractSummary
    [state] cacheDom
    [output] renderFeatureButtons, renderFeatureCopy, renderContractSummary, renderPreview

flow from public/graph-display/js/main-graph.js:
    input -> transform -> state -> output
    [input] openGraphTaskEditModal, downloadCalendar, _openNodeDetails, openNodeModal
    [transform] buildListDisplayUrl, _extractCalendarTasks
    [state] setSelectedTemplateId, setProfileButtonImage, setupNodeInteractions, setupTooltip
    [output] buildListDisplayUrl, renderError, displayPopup

flow from public/graph-display/js/project-index.js:
    input -> transform -> state -> output
    [input] openTypedPath, loadServerDirectory, buildBrowserBreadcrumbs, loadBrowserDirectory
    [transform] normalizePath, buildBrowserBreadcrumbs, buildBrowserFileSummary, buildBrowserDirectorySnapshot
    [state] cacheDom, setStatus
    [output] loadServerDirectory, renderAll, renderBreadcrumbs, renderLegend

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

flow from public/graph-display/js/shared/graph-design-contract.js:
    transform
    [transform] collectUnknownKeys, validateNumber, validateGraphUiConfig, validateGraphComponentInputs

flow from public/graph-display/js/shared/graph-metric-utils.js:
    transform
    [transform] resolveMetricRadius, resolveMetricColor

flow from public/graph-display/js/shared/graph-template-storage.js:
    input -> transform -> state
    [input] readStoredTemplates
    [transform] normalizeTemplateId, normalizeStoredTemplate, buildStoredGraphTemplateId
    [state] normalizeStoredTemplate, readStoredTemplates, writeStoredTemplates, buildStoredGraphTemplateId

flow from public/graph-display/js/shared/project-graph-utils.js:
    transform
    [transform] formatBytes, buildLegendEntries

flow from public/graph-display/js/shared/tours.js:
    transform
    [transform] resolveTourUrl, resolveStepsForTemplate

flow from public/list-display/js/list-display-controller.js:
    input -> transform -> state -> output
    [input] ensureGraphIframeLoaded, maybeOpenAddTaskFromQuery, loadConfig, getModuleFetchCandidates
    [transform] buildGraphIframeSrc, normalizeModulePath, normalizeModuleEntry, buildTaskFlowSummary
    [state] getStoredFolderProjects, setupProjectSelector, setActiveProject, updateTaskAuthoringAvailability
    [output] formatDisplayDate, renderProjectNavigation, renderHistory, renderTasks

flow from public/local-folder/task-bridge-modules/taskbridge/server.js:
    input
    [input] openBrowser

flow from public/local-folder/task-bridge-modules/taskbridge/public/task-engine/js/app-integration-example.js:
    state
    [state] saveTasks

flow from public/local-folder/task-bridge-modules/taskbridge/public/task-engine/js/cache-watchdog.js:
    input -> state
    [input] _fetchFull
    [state] CacheWatchdog, beginSave, endSave, _setBridgeOnline

flow from public/local-folder/task-bridge-modules/taskbridge/public/task-engine/js/task-storage-sync.js:
    input -> state
    [input] loadAll, _fetch
    [state] TaskStorageSync, setWatchdog, saveAll, updateOne

flow from public/local-folder/task-bridge-modules/taskbridge/server/file-editor.js:
    input -> state
    [input] readJSON, readText
    [state] writeAtomic, writeJSON, writeBatch

flow from public/task-engine/js/task-field-automation.js:
    transform
    [transform] generateTaskId, autoGenerateDependencies, validateAndFix, generateProjectSummary

flow from public/task-engine/js/task-schema-validator.js:
    transform
    [transform] validate, validateTemplate, validateProject, validateTask

flow from public/task-engine/js/task-storage-sync.js:
    input -> transform -> state -> output
    [input] resetLoadedMetadata, applyLoadedPayload, loadTasks, loadTemplates
    [transform] inferProjectIdFromTasksFile, normalizeTaskFilePath, resolveTemplateConfig, resolveActiveProjectId
    [state] resetLoadedMetadata, saveTasksToLocalFolder, saveTasksLocalDisk, generatePersistedCSV
    [output] exportToCSV

flow from public/task-engine/js/bridge/cache-watchdog.js:
    input -> state
    [input] _fetchFull
    [state] CacheWatchdog, setApiUrl, beginSave, endSave

flow from public/task-engine/js/bridge/task-storage-sync.js:
    input -> transform -> state
    [input] loadPayload, savePayload, _fetch
    [transform] _rebuildUrls
    [state] TaskStorageSync, setWatchdog, setProjectId, savePayload

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

flow from tests/e2e/local-project-editing.spec.js:
    input
    [input] waitForAppReady

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

flow from tests/unit/folder-cache.test.js:
    input -> state
    [input] loadFolderCache
    [state] loadFolderCache

flow from tests/unit/graph-data.test.js:
    input
    [input] loadGraphDataModule

flow from tests/unit/graph-design-contract.test.js:
    input
    [input] loadGraphDesignContractModule

flow from tests/unit/graph-template-storage.test.js:
    input
    [input] loadGraphTemplateStorageModule

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

flow from tools/scripts/validate-agentic-cells.js:
    input -> transform
    [input] readJson
    [transform] parseArgs, normalizeType, normalizePortArray, validatePortArray

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

flow from tools/task-bridge/server.js:
    input
    [input] openBrowser

flow from tools/task-bridge/server/file-editor.js:
    input -> state
    [input] readJSON, readText
    [state] writeAtomic, writeJSON, writeBatch

---

## API endpoints

api posture:
    [gap] public/api/ is documentation-only; no runtime endpoint provider was detected under public/
    [runtime-provider] runtime endpoints currently live in server.js, tools/cloudflare-worker/worker.js
    [gap] /api/tasks uses a full-payload GET/PUT model; no item-level POST/PATCH/DELETE task endpoints were detected
    [gap] no machine-readable API contract (OpenAPI/JSON) was detected under public/api/

cli entry points:
    [cli] public/agentic-ide/components/tools/folder-graph-scanner/main.js — process.argv CLI
    [cli] tools/calendar/generate-project-calendars.js — process.argv CLI
    [cli] tools/scripts/enrich-tasks-workers.js — process.argv CLI
    [cli] tools/scripts/generate-state-files.js — process.argv CLI
    [cli] tools/scripts/regenerate-tasks-csv.js — process.argv CLI
    [cli] tools/scripts/validate-agentic-cells.js — process.argv CLI
    [cli] tools/scripts/validate-commit-format.js — process.argv CLI
    [cli] tools/scripts/validate-tasks-schema.js — process.argv CLI
    [cli] tools/scripts/validate-tasks-workers.js — process.argv CLI

core surface candidates for API/MCP exposure:
    [candidate] public/agentic-ide/js/render.js: requestCanvasRender, wireCanvasInteractions, getTasksIntegrationConfig, resolveTasksUrl, setSidebarTab (+3 more)
    [candidate] public/agentic-ide/js/state.js: createRootNode, createEmptyGraph, createDefaultChatState, cloneGraph, readPersistedState (+3 more)
    [candidate] public/agentic-ide/js/utils.js: esc, ct, uid, childrenOf, structuredCloneSafe (+3 more)
    [candidate] public/graph-composer/js/composer-app.js: setStatus, refreshStoredTemplates, ensureSelections, loadTemplate, getSelectedNode (+3 more)
    [candidate] public/graph-composer/js/composer-render.js: escapeHtml, humanizeKey, renderSchemaField, renderConfigEditor, renderSavedTemplateList (+3 more)
    [candidate] public/graph-composer/js/composer-state.js: isPlainObject, setValueAtPath, normalizeNode, normalizeLink, normalizeDetails (+3 more)

automation suggestions:
    [suggest-mcp] wrap core functions with MCP SDK tool decorators for agent integration
    [suggest-contract] add an OpenAPI/JSON schema to document the API surface

api from server.js:
    [route] GET /api/health
    [route] GET /api/projects
    [route] GET /api/module
    [route] GET /api/project-tree
    [route] GET /api/file-content
    [route] GET /api/scan-path
    [route] POST /api/create-project
    [route] POST /api/scanner/scan
    [route] PATCH /api/task
    [route] POST /api/create-mcp
    [route] OPTIONS /api/task
    [route] OPTIONS /api/create-mcp
    [route] HEAD /api/tasks
    [route] GET /api/tasks
    [route] PUT /api/tasks

api from public/agentic-ide/js/bridge-server.js:
    [route] GET /api/file
    [route] GET /api/list
    [route] GET /api/model
    [route] GET /api/registry
    [route] GET /api/runtime/run
    [route] GET /api/runtime/test
    [route] GET /api/llm/complete

api from tools/cloudflare-worker/worker.js:
    [route] GET /health
    [route] GET /api/task-history
    [route] PUT /api/tasks

---
*305 files indexed · generated by extract_project_spec.py*