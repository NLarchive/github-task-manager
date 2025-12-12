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
public
public\config
public\config\access-secret.local.js
public\config\github-token.js
public\config\github-token.local.js
public\config\template-config.js
public\scripts
public\scripts\task-manager-app.js
public\scripts\template-automation.js
public\scripts\template-validator.js
public\styles
public\styles\task-manager.css
public\tasksDB
public\tasksDB\task-database.js
public\tasksDB\ai-career-roadmap
public\tasksDB\github-task-manager
public\app.js
public\health-check.html
public\index.html
public\styles.css
test-results
tests
tests\artifacts
tests\e2e
tests\e2e\crud-operations.spec.js
tests\e2e\new-features.spec.js
tests\e2e\test-scenarios.md
tests\playwright-report
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
tools\docs
tools\scripts
tools\scripts\archive-root-tasks.js
tools\scripts\generate-state-files.js
tools\scripts\regenerate-tasks-csv.js
tools\scripts\setup.bat
tools\scripts\setup.js
tools\task-templates
tools\task-templates\starter_project_template.csv
tools\task-templates\starter_project_template.json
.gitignore
AGENTS.md
LICENSE
package-lock.json
package.json
README.md
server.js
"""