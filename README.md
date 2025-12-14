# GitHub Task Manager 📋

A collaborative, open-source task management system integrated with GitHub, enabling public users to manage tasks through a modern web UI with automatic task ID generation, real-time GitHub synchronization, and template-based task creation.

**Live Demo**: https://nlarchive.github.io/github-task-manager/

## Features ✨

### Core Functionality
- ✅ **Public Read + Optional Write Gate** - Viewing is public; GitHub Pages can require a shared password for modifications
- ✅ **Auto-Generated Task IDs** - Sequential numbering with gap filling
- ✅ **Real-Time GitHub Sync** - All changes commit directly to repository
- ✅ **Full CRUD Operations** - Create, read, update, delete tasks seamlessly
- ✅ **Advanced Filtering** - Filter by status, priority, category, search
- ✅ **Data Validation** - Template-based validation with helpful error messages
- ✅ **CSV Export** - Download all tasks for offline analysis
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

### Task Management Features
- 📝 **Rich Task Properties**:
  - Automatic: task_id, created_date, creator_id, completed_date
  - Required: name, description, status, priority, dates, hours, category
  - Optional: tags, assigned workers, dependencies, subtasks, progress, comments

- 🔗 **Task Dependencies**: Define predecessor relationships (FS/SS/FF/SF types)
- 👥 **Worker Assignment**: Assign tasks to collaborators without authentication
- 📊 **Progress Tracking**: Monitor completion percentage and actual vs estimated hours
- 🏷️ **Task Tags**: Organize with flexible tagging system
- 💬 **Comments**: Add notes and discussions to tasks
- 📌 **Critical Path**: Mark important tasks for project timeline

### Statistics Dashboard
- Total tasks count
- Tasks by status (Not Started, In Progress, Completed, etc.)
- Priority distribution
- Category breakdown
- Team workload analysis

## Getting Started 🚀

### Using the Live Website

1. **Visit**: https://nlarchive.github.io/github-task-manager/
2. **Enter Your Name** (optional): Top input field for task attribution
3. **View Existing Tasks**: Dashboard shows all project tasks
4. **Create Task**: Click "+ Add New Task" button
5. **Manage Tasks**: Edit, delete, or mark complete
6. **Filter & Search**: Use dropdowns to filter by status/priority
7. **Export**: Download as CSV for external processing

### Local Development Setup

#### Prerequisites
- Node.js 14+ (for development/testing only)
- Git

#### Installation

```bash
# Clone repository
git clone https://github.com/nlarchive/github-task-manager.git
cd github-task-manager

# Install dependencies (optional - only for testing)
npm install

# (Optional) Setup a GitHub token for local development
# IMPORTANT: Never ship a repo write token to GitHub Pages.
# Create public/config/github-token.local.js (gitignored) if you want direct GitHub writes locally.

# Run tests
npm test

# No build step needed (vanilla JS)
```

#### Running Locally
```bash
# Option 1: Open directly in browser
open public/index.html

# Option 2: Serve with Python
python -m http.server 8000

# Option 3: Serve with Node (if installed)
npx http-server
```

Visit `http://localhost:8000/` in your browser.

## How to Use 📖

### Creating a New Task

1. Click **"+ Add New Task"** button
2. Fill in required fields:
   - **Task Name**: Brief title (e.g., "Implement auth form")
   - **Description**: Detailed explanation
   - **Status**: Select from dropdown (Not Started, In Progress, etc.)
   - **Priority**: Choose level (Low, Medium, High, Critical)
   - **Start Date**: When task begins
   - **End Date**: Target completion date
   - **Estimated Hours**: Expected effort
   - **Category**: Select from predefined categories
3. **Optional fields**:
   - **Tags**: Comma-separated keywords (e.g., "frontend, urgent")
   - **Assigned Workers**: Add team members
   - **Progress %**: Completion percentage (0-100)
   - **Actual Hours**: Time actually spent
   - **Dependencies**: Link to other tasks (format: "taskId: FS")
   - **Parent Task ID**: For subtasks (leave blank if main task)
   - **Critical Path**: Check if on critical path
4. Click **"Save Task"** button
5. Task auto-populates:
   - ✅ Task ID (next sequential)
   - ✅ Created Date (current timestamp)
   - ✅ Creator ID (your name from top input)

### Auto-Populated Fields

When creating a task, these fields are automatically set:

| Field | How It's Set |
|-------|-------------|
| `task_id` | Sequential numbering (1, 2, 3, ...) - fills gaps automatically |
| `created_date` | Current timestamp (ISO format) |
| `creator_id` | Your name from the "Your Name" input field |
| `completed_date` | Set when status changes to "Completed" |
| `progress_percentage` | Auto-set to 100 if status is "Completed" |

### Editing Tasks

1. Click **"Edit"** button on any task card
2. Modal opens with task data pre-filled
3. Modify any fields
4. Click **"Save Task"** to update

### Deleting Tasks

1. Click **"Delete"** button on task card
2. Confirm deletion in modal
3. Task removed from list
4. Changes synced to GitHub

### Filtering & Searching

**By Status:**
- All Tasks (default)
- Not Started
- In Progress
- On Hold
- Blocked
- Completed
- Cancelled
- Pending Review

**By Priority:**
- All Priorities (default)
- Critical
- High
- Medium
- Low

Filters combine - select status AND priority to narrow results.

### Exporting Tasks

1. Click **"📥 Export CSV"** button
2. CSV file downloads with all tasks
3. Includes all fields: ID, name, description, dates, status, priority, hours, etc.
4. Open in Excel, Google Sheets, or text editor
5. Perfect for reports and offline analysis

### Data Persistence

The app supports **dual-mode persistence** that works seamlessly whether deployed or running locally:

#### GitHub Pages (Deployed)
For security, the deployed site should **not** include a repo write token.

Write options:
- **Cloudflare Worker mode (recommended)**: the UI sends authenticated write requests to the Worker; the Worker performs GitHub writes with a server-side token.
- **Read-only**: users can still browse and export.

#### Local Storage Mode (Local Development)
When no GitHub token is available:
- Changes save to browser's localStorage automatically
- No network authentication required
- Perfect for local development and offline work
- Persists across page refreshes within same browser
- Data stored as JSON + CSV in browser

#### How It Works
1. **On Save**:
   - Check for valid GitHub token
   - If token exists → save to GitHub (with localStorage backup)
   - If no token → save to localStorage only
   - Show user which mode was used ("Tasks saved to GitHub" or "Tasks saved locally")

2. **On Load**:
   - Check localStorage first (fastest, local data)

Note: For easy machine‑parsing, single-event commit subjects are compact and fully pipe-separated: `TaskDB|<action>|<id>|<task_name>|<short-summary>`.
   - If empty, try GitHub API (production data)
   - If API fails, try fetching static JSON file
   - Always fall back gracefully to empty task list

3. **Failover Handling**:
   - GitHub API errors → automatically save locally as fallback
   - No network → works offline with localStorage
   - Multiple sources → user always has access to tasks

#### Local Development Writes

On localhost, the app can persist in three ways (in priority order):
- Worker URL configured → save via Worker
- Dev server running (`npm start`) → save to local disk via `/api/tasks`
- Otherwise → save to browser localStorage

#### Data Sync Between Modes

Tasks saved locally can be manually copied to GitHub:
- Export tasks as CSV from UI
- Commit to GitHub manually
- Or implement CI/CD to sync periodically

Tasks saved to GitHub automatically sync when:
- Page is refreshed
- User revisits the site
- localStorage is cleared (forces GitHub load)

## Task Properties Explained 📋

### Automatic Fields
These are set by the system and cannot be manually entered:

- **task_id**: Unique sequential number (1, 2, 3...)
- **created_date**: Timestamp when task created (ISO 8601)
- **creator_id**: Name of user who created task
- **completed_date**: Set when status becomes "Completed"

### Required Fields
Must be filled when creating a task:

- **task_name**: Short, descriptive title
- **description**: Detailed explanation of work
- **status**: Current stage (Not Started, In Progress, Completed, etc.)
- **priority**: Importance level (Low, Medium, High, Critical)
- **start_date**: When work begins
- **end_date**: Target completion date
- **estimated_hours**: Expected effort in hours
- **category_name**: Work category (Frontend, Backend, Testing, etc.)

### Optional Fields
Can be filled but not required:

- **progress_percentage**: Completion progress (0-100%)
- **actual_hours**: Time actually spent so far
- **tags**: Comma-separated keywords for organization
- **assigned_workers**: Team members responsible
- **parent_task_id**: For subtasks (leave blank if main task)
- **dependencies**: Link to blocking tasks (format: "taskId: FS")
- **is_critical_path**: Critical for project timeline
- **comments**: Notes and discussions

### Status Values
- **Not Started**: Work hasn't begun
- **In Progress**: Currently being worked on
- **On Hold**: Paused, waiting for something
- **Blocked**: Cannot proceed, dependency issue
- **Completed**: Finished and closed
- **Cancelled**: Not needed anymore
- **Pending Review**: Done, awaiting approval

### Priority Levels
- **Low**: Nice-to-have, can be deferred
- **Medium**: Important, should be done
- **High**: Very important, needed soon
- **Critical**: Must be done, blocks others

### Dependency Types
When setting dependencies, use these types:

- **FS** (Finish-to-Start): Task B starts after Task A finishes
- **SS** (Start-to-Start): Task B starts when Task A starts
- **FF** (Finish-to-Finish): Task B finishes when Task A finishes
- **SF** (Start-to-Finish): Task B finishes when Task A starts

Example: "5: FS" means task 5 must be finished before this task starts.

## Categories 🏷️

Pre-defined categories for organization:

1. **Project Setup** - Initial project work
2. **Backend Development** - Server and API work
3. **Frontend Development** - UI and user interface
4. **Testing** - QA and testing activities
5. **Deployment** - Release and deployment
6. **Documentation** - User guides and docs
7. **Retrospective** - Team reviews

Add more categories by editing `TEMPLATE_CONFIG` in `public/config/template-config.js`.

## GitHub Integration 🔗

### Architecture

```
├── Repository: nlarchive/github-task-manager
│   ├── main branch (deployed)
│   ├── tasks.json (source of truth)
│   ├── public/ (GitHub Pages content)
│   └── .github/workflows/deploy.yml (CI/CD)
│
├── GitHub Pages
│   └── https://nlarchive.github.io/github-task-manager/
│
└── GitHub API
    └── Reads/writes tasks.json via REST API
```

### Data Sync Flow

```
User Action (Create/Edit/Delete)
    ↓
Form Validation
    ↓
Task Database (In-Memory)
    ↓
GitHub API Request
    ↓
Update tasks.json in Repository
    ↓
GitHub Commit (Tracked in history)
    ↓
GitHub Pages Deploy (Automatic)
    ↓
Live Site Updated
```

### API Configuration

The app uses GitHub REST API v3 to manage tasks:

```javascript
// Configuration in public/config/template-config.js
GITHUB: {
  OWNER: 'nlarchive',           // Repository owner
  REPO: 'github-task-manager',  // Repository name
  BRANCH: 'main',               // Target branch
  TOKEN: GH_TOKEN,              // GitHub API token
  TASKS_FILE: 'tasks.json'      // Tasks file path
}
```

### Token Security

For GitHub Pages deployment:
- Token stored in GitHub Actions secrets
- Injected at build time (not in source code)
- Limited to `repo` scope permissions
- Automatically rotated regularly

For local development:
1. Create GitHub personal access token
2. Save to `.gitignore`'d file
3. Token never committed to repository

## Testing 🧪

### Automated Tests

```bash
# Run all tests (Node.js unit tests)
npm test

# Run specific test file
npm test tests/template-validator.test.js

# Run with coverage
npm test -- --coverage
```

### Manual Testing (Playwright)

```bash
# Install Playwright
npm install @playwright/test

# Run Playwright tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/playwright/crud-operations.test.js
```

### Test Coverage

- ✅ **Configuration** - Template validation rules (68 tests)
- ✅ **Validation** - Field validation and error messages
- ✅ **Automation** - Task ID generation and field population
- ✅ **Database** - CRUD operations and statistics
- ✅ **UI/UX** - Form interactions and filtering (Playwright)
- ✅ **GitHub Integration** - API sync and persistence

For detailed Playwright test scenarios, see [tests/playwright/test-scenarios.md](tests/playwright/test-scenarios.md).

### Browser Compatibility

Tested and working on:
- ✅ Chrome 120+
- ✅ Edge 120+
- ✅ Firefox (partial)
- ✅ Safari (partial)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Project Structure 📁

```
github-task-manager/
├── public/                          # GitHub Pages content
│   ├── index.html                  # Main application
│   ├── config/
│   │   ├── template-config.js      # Configuration and validation rules
│   │   └── github-token.js         # GitHub API token (injected)
│   ├── scripts/
│   │   ├── task-manager-app.js     # Main application controller
│   │   ├── template-validator.js   # Validation logic
│   │   ├── template-automation.js  # Auto-population logic
│   │   └── (GitHub API wrapper lives in task-manager-app.js)
│   ├── tasksDB/
│   │   ├── task-database.js        # Database CRUD operations
│   │   ├── tasks.json              # Task storage file
│   │   └── tasks.csv               # Exported tasks
│   ├── styles/
│   │   └── task-manager.css        # Application styling
│   └── docs/                        # Documentation files
│
├── tests/                           # Test files
│   ├── playwright/                  # Playwright E2E tests
│   ├── template-config.test.js     # Config tests
│   ├── template-validator.test.js  # Validator tests
│   ├── template-automation.test.js # Automation tests
│   └── task-database.test.js       # Database tests
│
├── task-templates/                  # Project templates
│   ├── starter_project_template.json
│   └── starter_project_template.csv
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD
│
├── public/tasksDB/<project>/tasks.json  # Task database (source of truth)
├── package.json                     # Node.js dependencies
├── README.md                        # This file
├── QUICKSTART.md                    # Quick start guide
└── LICENSE                          # MIT License
```

## Configuration 🔧

### Template Configuration

Edit `public/config/template-config.js` to customize:

```javascript
FIELD_CATEGORIES: {
  AUTOMATIC: [...],      // System-generated fields
  REQUIRED_INPUT: [...], // Must fill when creating
  OPTIONAL_INPUT: [...]  // Can optionally fill
}

ENUMS: {
  TASK_STATUS: [...],    // Available statuses
  TASK_PRIORITY: [...],  // Available priorities
  DEPENDENCY_TYPES: [...] // FS, SS, FF, SF
}

CATEGORIES: [...]        // Task categories
```

### Environment Variables

For GitHub Actions deployment:

```yaml
# .github/workflows/deploy.yml
secrets:
  GH_TOKEN: ${{ secrets.GH_TOKEN }}  # GitHub API token
  # Access passwords (client-side gate). Add per-project secrets to allow project-specific write access.
  ACCESS_PASSWORD_MASTER: ${{ secrets.ACCESS_PASSWORD_MASTER }}  # Master password (fallback)
  ACCESS_PASSWORD_GITHUB_TASK_MANAGER: ${{ secrets.ACCESS_PASSWORD_GITHUB_TASK_MANAGER }}  # Password for public/tasksDB/github-task-manager
  ACCESS_PASSWORD_AI_CAREER_ROADMAP: ${{ secrets.ACCESS_PASSWORD_AI_CAREER_ROADMAP }}  # Password for public/tasksDB/ai-career-roadmap
```

How to set secrets for each project folder in GitHub:

- Go to your repository on GitHub → Settings → Secrets and variables → Actions.
- Click "New repository secret" and add the following secrets (example names):
   - `ACCESS_PASSWORD_MASTER` — a master password that unlocks all projects (fallback).
   - `ACCESS_PASSWORD_GITHUB_TASK_MANAGER` — password specifically for public/tasksDB/github-task-manager.
   - `ACCESS_PASSWORD_AI_CAREER_ROADMAP` — password specifically for public/tasksDB/ai-career-roadmap.
- You may add more per-project secrets using the pattern `ACCESS_PASSWORD_<PROJECT_ID>` and update `.github/workflows/deploy.yml` to include the new mapping.

During deployment, the workflow writes the secrets into `public/config/access-secret.js` so the client can identify which password applies for each active project. The master password continues to be supported for backward compatibility.

Security note: These passwords are injected into client-side code and are not a substitute for server-side authentication. They provide a basic gate to prevent casual edits on the live site; users can still inspect JavaScript to read the password.

## Troubleshooting 🔧

### Tasks Not Loading
- ✅ Check GitHub token is set in Actions secrets
- ✅ Verify repository is public
- ✅ Check browser console for API errors
- ✅ Try refreshing the page

### Changes Not Saving
- ✅ Ensure GitHub token has `repo` scope
- ✅ Check network connection
- ✅ Verify form validation passes
- ✅ Check browser console for errors

### Form Validation Errors
- ✅ **Date format**: Use YYYY-MM-DD (browser date input requirement)
- ✅ **Required fields**: All marked with * must be filled
- ✅ **Hours**: Must be numeric
- ✅ **Status**: Must select from dropdown

### GitHub API Errors
| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid token | Regenerate token in GitHub settings |
| 403 Forbidden | Token lacks permissions | Ensure `repo` scope is selected |
| 404 Not Found | File not found | Tasks.json missing in repo root |
| 422 Validation | Invalid data format | Check task JSON structure |

## Contributing 🤝

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Avoiding Conflicts on Generated Task Files

When working on system code, the repository stores both the canonical `tasks.json` and a few derived/state files (CSV exports and `state/` JSON files). These derived files are often regenerated and can cause merge conflicts when multiple contributors update them. Follow these best practices to avoid conflicts:

- **Don't commit derived files**: Avoid committing `public/tasksDB/*/state/*` and `public/tasksDB/*/tasks.csv` — they're generated from `tasks.json`.
- **Rebase before starting work**: Run `git fetch && git rebase origin/main` before making changes.
- **Only commit `tasks.json`**: Treat `tasks.json` as the single source of truth for task data.
- **Use `git rerere` to speed conflict resolution**: Enable it with `git config --global rerere.enabled true`.
- **If you must update derived files**: Regenerate them using the repo's tooling (such as the CSV/state generation scripts in `tools/scripts`) and commit only when necessary.
   - **Regenerate locally**: Use the npm script `npm run tasks:generate-state` to produce fresh `state/` pages and CSVs before testing locally.

These changes are enabled by updating `.gitignore` so generated state files are no longer tracked by default. If you see a conflict for these files, rebase and ensure you didn't accidentally check them in.

## Roadmap 🗺️

### Current Phase (Sprint 1) ✅ COMPLETE
- ✅ Task 1: Remove Auth Form
- ✅ Task 2: Form Fields
- ✅ Task 3: Task Automation
- ✅ Task 7: Testing
- ✅ Task 9: GitHub Pages

### Next Phase (Sprint 2) ⏳ IN PLANNING
- ⏳ Task 4: Subtask Support
- ⏳ Task 5: Dependencies & Critical Path
- ⏳ Task 6: Public Collaboration
- ⏳ Task 8: Documentation

### Future Features
- 📅 Gantt chart visualization
- 🔔 Notifications and alerts
- 👥 Real-time collaboration
- 📊 Advanced reporting
- ⏱️ Time tracking integration
- 🔐 Optional authentication
- 🌐 Multi-language support

## Performance 📈

Metrics on GitHub Pages:

| Metric | Value | Status |
|--------|-------|--------|
| Page Load | ~2-4s | ✅ Fast |
| Task Creation | ~1-2s | ✅ Fast |
| GitHub Sync | ~1-2s | ✅ Fast |
| Filter Response | <100ms | ✅ Instant |
| Export CSV | <500ms | ✅ Instant |

Optimizations:
- Vanilla JavaScript (no framework overhead)
- Minimal HTTP requests
- Efficient DOM updates
- Local caching of tasks

## Browser Support 🌐

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |
| Mobile Safari | 14+ | ✅ Full Support |
| Chrome Mobile | 90+ | ✅ Full Support |

## License 📄

MIT License - See [LICENSE](LICENSE) file for details.

Copyright © 2025 Nicolas Larenas

## Security 🔒

### Best Practices Implemented

- ✅ **Token Security**: Never stored in source code
- ✅ **HTTPS Only**: GitHub Pages uses HTTPS by default
- ✅ **Input Validation**: All user input validated before processing
- ✅ **CORS Protection**: API calls respect GitHub's CORS policy
- ✅ **Read-Only by Default**: Live site can require a shared password to modify tasks
- ✅ **Rate Limiting**: Respects GitHub API rate limits

### Security Considerations

- ⚠️ Client-side passwords are not a strong security boundary (users can inspect served JS)
- ⚠️ No user authentication - attribution based on name input
- ⚠️ GitHub history is permanent - no true deletion
- ⚠️ Token is visible in Actions logs - use read-only token if sensitive

Recommendations:
1. Use a dedicated GitHub account for the token
2. Monitor repository activity regularly
3. Review commits in GitHub history
4. Consider adding branch protection rules
5. Backup tasks regularly

Important update (GitHub Pages security):

- Do NOT ship a repo write token to the browser. Anything under `public/` is downloadable by anyone.
- If you previously injected `GH_TOKEN` into `public/config/github-token.js` during deploy, rotate/revoke that token immediately.
- Recommended model for a static site:
   - Public read: fetch tasks without auth.
   - Writes: require the shared access password AND a user-provided fine-grained token stored only in that user's browser (or a GitHub OAuth flow).

## Support & Contact 💬

### Getting Help

1. **Check Documentation**: Review README sections above
2. **View Test Reports**: See `tests/playwright/test-scenarios.md`
3. **Check GitHub Issues**: Open an issue on repository
4. **Review Code Comments**: Source code has detailed comments

### Reporting Issues

When reporting issues, include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Error messages from console
- Screenshots if helpful

## Acknowledgments

Built with:
- 🎯 Vanilla JavaScript (no frameworks)
- 📚 GitHub API v3
- 🚀 GitHub Pages
- ⚙️ GitHub Actions
- 🧪 Playwright for testing

## Changelog 📝

### Version 1.0.0 (2025-12-10)
- 🎉 Initial release
- ✅ Core CRUD operations
- ✅ GitHub synchronization
- ✅ Task filtering and search
- ✅ CSV export
- ✅ Form validation
- ✅ Responsive design
- ✅ Automated testing
- ✅ GitHub Pages deployment
- ✅ Full documentation

---

For the latest updates and features, visit: https://github.com/nlarchive/github-task-manager
