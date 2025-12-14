use the next files to track and update the project state:

"""
public\tasksDB\github-task-manager\tasks.json
public\tasksDB\github-task-manager\tasks.csv
public\tasksDB\ai-career-roadmap\tasks.json
public\tasksDB\ai-career-roadmap\tasks.csv
""",

frecuently update the project trough the ui "public\index.html", levarage the testing of the ui trough the task development and updates, not direct files modifications to leverage the lieve testing development,


current project structure;
"""
.github
.playwright-mcp
node_modules
playwright-report
public
public\config
public\config\access-secret.js
public\config\access-secret.local.js
public\config\github-oauth.js
public\config\github-token.js
public\config\github-token.local.js
public\config\template-config.js
public\config\worker-url.js
public\config\worker-url.local.js
public\scripts
public\scripts\task-manager-app.js
public\scripts\template-automation.js
public\scripts\template-validator.js
public\styles
public\styles\task-manager.css
public\tasksDB
public\tasksDB\ai-career-roadmap
public\tasksDB\ai-career-roadmap\history
public\tasksDB\ai-career-roadmap\state
public\tasksDB\ai-career-roadmap\README.md
public\tasksDB\ai-career-roadmap\tasks.csv
public\tasksDB\ai-career-roadmap\tasks.json
public\tasksDB\github-task-manager
public\tasksDB\github-task-manager\history
public\tasksDB\github-task-manager\state
public\tasksDB\github-task-manager\README.md
public\tasksDB\github-task-manager\tasks.csv
public\tasksDB\github-task-manager\tasks.json
public\tasksDB\task-database.js
public\health-check.html
public\index.html
public\styles.css
test-results
tests
tests\artifacts
tests\e2e
tests\e2e\crud-operations.spec.js
tests\e2e\live-multi-project-saves.spec.js
tests\e2e\new-features.spec.js
tests\e2e\smoke.spec.js
tests\e2e\update-task-via-ui.spec.js
tests\e2e\verify-commit-structure.spec.js
tests\playwright-report
tests\playwright-report\data
tests\playwright-report\trace
tests\playwright-report\index.html
tests\test-results
tests\unit
tests\unit\server-api.test.js
tests\unit\task-database.test.js
tests\unit\template-automation.test.js
tests\unit\template-config.test.js
tests\unit\template-validator.test.js
tests\unit\validate-schema.js
tests\playwright.config.js
tests\run-tests.js
tools
tools\cloudflare-worker
tools\cloudflare-worker\.wrangler
tools\cloudflare-worker\deploy.ps1
tools\cloudflare-worker\deploy.sh
tools\cloudflare-worker\package.json
tools\cloudflare-worker\README.md
tools\cloudflare-worker\validate-secrets.js
tools\cloudflare-worker\worker.js
tools\cloudflare-worker\wrangler.toml
tools\docs
tools\scripts
tools\scripts\archive-root-tasks.js
tools\scripts\generate-state-files.js
tools\scripts\regenerate-tasks-csv.js
tools\scripts\setup.bat
tools\scripts\setup.js
tools\scripts\validate-tasks-schema.js
tools\scripts\validate-commit-format.js
tools\task-templates
.gitignore
AGENTS.md
CONTRIBUTING.md
LICENSE
live-test-run.log
package-lock.json
package.json
README.md
server.js
"""

.gitignore:
"""
# Dependencies
node_modules/
package-lock.json

# Token files - NEVER COMMIT THESE
public/config/github-token.local.js
public/config/github-token.js
public/config/access-secret.local.js
public/config/access-secret.js
public/config/worker-url.local.js
public/config/github-oauth.js
config/github-token.local.js
*.token
*.secret

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/
tests/artifacts/

# Logs
*.log
npm-debug.log*

# Test coverage
coverage/

# Environment
.env
.env.local
.env.*.local
# Cloudflare Wrangler local state
tools/**/.wrangler/
playwright-report/
test-results/
.playwright-mcp/
 
# Ignore derived task state and CSV files to avoid merge conflicts
public/tasksDB/*/state/
public/tasksDB/*/state/**
public/tasksDB/*/tasks.csv
"""