# Project Architecture Overview

## Quick Facts

- **Type**: Static site (vanilla JavaScript, no build step)
- **Hosting**: GitHub Pages
- **Database**: JSON files in repository + optional GitHub API sync
- **UI**: Responsive web interface
- **Tests**: Unit tests (Node.js) + E2E tests (Playwright)

---

## Project Structure

```
github-task-manager/
├── .github/workflows/
│   └── deploy.yml                 # CI/CD: validates, regenerates CSVs, deploys
├── public/                        # GitHub Pages content
│   ├── index.html                # Main application
│   ├── health-check.html         # Deployment diagnostics
│   ├── config/
│   │   ├── template-config.js    # Task schema & defaults
│   │   ├── github-token.js       # Token config (injected at deploy)
│   │   └── access-secret.js      # Password gate secrets (injected)
│   ├── scripts/
│   │   ├── task-manager-app.js   # Main controller
│   │   ├── template-validator.js # Form validation
│   │   └── template-automation.js # Auto-populate fields
│   ├── tasksDB/                  # Task databases (one per project)
│   │   ├── task-database.js      # CRUD operations
│   │   ├── github-task-manager/  # Project: main task manager
│   │   │   ├── tasks.json        # Source of truth
│   │   │   ├── tasks.csv         # Generated export
│   │   │   └── state/            # Generated filtered views
│   │   └── ai-career-roadmap/    # Project: learning roadmap
│   │       └── tasks.json
│   └── styles/
│       └── task-manager.css
├── tools/
│   ├── docs/                     # Documentation (this folder)
│   ├── scripts/
│   │   ├── generate-state-files.js  # Generate state/ JSONs
│   │   ├── regenerate-tasks-csv.js  # Regenerate CSV from JSON
│   │   └── archive-root-tasks.js
│   └── cloudflare-worker/        # Optional: secure API proxy
├── tests/
│   ├── e2e/                      # Playwright end-to-end tests
│   │   ├── crud-operations.spec.js
│   │   ├── update-task-via-ui.spec.js
│   │   └── new-features.spec.js
│   ├── unit/                     # Node.js unit tests
│   │   ├── template-config.test.js
│   │   ├── template-validator.test.js
│   │   └── task-database.test.js
│   └── playwright.config.js      # Playwright config
├── CONTRIBUTING.md               # Developer workflow
├── README.md                     # Full documentation
└── package.json
```

---

## Data Flow

### Reading Tasks

```
User loads app
    ↓
fetch /public/tasksDB/<project>/tasks.json
    ↓
Parse JSON into memory
    ↓
Render task list UI
```

### Creating/Updating Tasks

```
User fills form → Validation → Auto-populate (task_id, dates, creator)
    ↓
GitHub API: PUT /repos/{owner}/{repo}/contents/public/tasksDB/<project>/tasks.json
    ↓
GitHub commits change
    ↓
CI regenerates: state/ + CSV
    ↓
GitHub Pages deploy
    ↓
Site updated
```

### Derived Files (State & CSV)

Generated from `tasks.json` via:
- `npm run tasks:generate-state` → creates `public/tasksDB/<project>/state/*.json`
- `npm run tasks:regenerate-csv` → creates `public/tasksDB/<project>/tasks.csv`

These are **ignored by git** to prevent merge conflicts.
CI regenerates them before each deploy.

---

## Key Features

| Feature | Implementation |
|---------|-----------------|
| **Task Storage** | JSON file + optional GitHub sync |
| **Auto-ID Generation** | Sequential numbering with gap filling |
| **Form Validation** | Client-side rules from `template-config.js` |
| **Authentication** | GitHub token (injected at deploy) |
| **Public Writes** | Password gate (optional, injected secrets) |
| **Export** | CSV and filtered JSON state files |
| **Multi-Project** | Each project in separate `tasks.json` |
| **Responsive** | CSS media queries for mobile/tablet |
| **Comments** | Task-level notes and discussions |
| **Worker Assignment** | Assign tasks without auth |
| **Task Dependencies** | FS/SS/FF/SF relationship types |
| **Progress Tracking** | Percentage + actual vs estimated hours |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JavaScript, HTML, CSS |
| **Storage** | JSON files in Git repository |
| **API** | GitHub REST API v3 |
| **Hosting** | GitHub Pages (static) |
| **CI/CD** | GitHub Actions |
| **Testing** | Playwright (E2E), Node.js (unit) |
| **Build** | None (vanilla JS) |

---

## Development Workflow

1. **Edit code** → test locally
2. **Update `tasks.json`** → run `npm run tasks:regenerate-all` to test locally
3. **Commit & push** → CI validates and deploys
4. **GitHub Actions**:
   - Validates `tasks.json` schema
   - Runs test suite
   - Regenerates `state/` and CSV files
   - Deploys to GitHub Pages

---

## Configuration

See code comments in:
- `public/config/template-config.js` — task schema, categories, statuses, priorities
- `.github/workflows/deploy.yml` — deployment and CI steps
- `tests/playwright.config.js` — test runner config

---

## Common Tasks

```bash
# Development
npm run tasks:regenerate-all     # Regenerate state/CSV after editing tasks.json
npm run test:playwright:ui       # Run E2E tests with UI
npm run format                   # Format code (Prettier)
npm run lint                     # Lint code (ESLint)

# Deployment
git add public/tasksDB/<project>/tasks.json
git commit -m "Update tasks: ..."
git push origin main
# CI handles the rest!
```

---

## Testing

- **Unit Tests**: Configuration, validation, database operations
- **E2E Tests**: Full user workflows (create, edit, delete tasks)
- **UI Automation**: Update tasks via Playwright instead of JSON

See [TESTING.md](TESTING.md) for details.

---

## Deployment

**Automatic**: Every push to `main` triggers GitHub Actions
- Validates tasks.json
- Runs tests
- Regenerates derived files
- Deploys to GitHub Pages

See [SETUP.md](SETUP.md) and `.github/workflows/deploy.yml` for details.

---

## Multi-Project Support

Each project is isolated in `public/tasksDB/<projectId>/`:

```
public/tasksDB/
├── github-task-manager/
│   ├── tasks.json
│   ├── tasks.csv
│   └── state/
└── ai-career-roadmap/
    ├── tasks.json
    ├── tasks.csv
    └── state/
```

Access in UI via project selector or direct URL.
Each project has optional password gate (configured in GitHub Actions secrets).

---

## Performance

- **Page Load**: ~2-4 seconds (GitHub Pages CDN)
- **Task Create**: ~1-2 seconds (GitHub API + deploy)
- **Filtering**: <100ms (client-side)
- **CSV Export**: <500ms (client-side)

Optimizations:
- Vanilla JS (no framework overhead)
- Static hosting (no server)
- Minimal dependencies
- Local caching of tasks
