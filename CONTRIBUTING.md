# Contributing to GitHub Task Manager

Thank you for contributing to the GitHub Task Manager! This guide explains the recommended workflow and best practices.

## Development Workflow

### 1. Before Starting Work

Always fetch and rebase on the latest `main` branch to avoid conflicts:

```bash
git fetch origin
git rebase origin/main
```

Or configure git to always rebase on pull:

```bash
git config pull.rebase true
```

### 2. Making Changes

#### Editing Task Data

The canonical task data source is [`public/tasksDB/<project>/tasks.json`](public/tasksDB/) (e.g., `public/tasksDB/github-task-manager/tasks.json`).

**Important**: Do NOT commit derived files:
- `public/tasksDB/*/state/*.json` — auto-generated state files (ignored by git)
- `public/tasksDB/*/tasks.csv` — auto-generated CSV export (ignored by git)

These are regenerated from `tasks.json` and are excluded from version control to prevent merge conflicts.

#### Recommended: Update Through the UI

Instead of manually editing JSON, use the Playwright automation scripts to update tasks through the web UI:

```bash
# Update a task using Playwright
npx playwright test tests/e2e/update-task-via-ui.spec.js --headed
```

See [`tests/e2e/update-task-via-ui.spec.js`](tests/e2e/update-task-via-ui.spec.js) for examples.

#### Manual JSON Edits (if needed)

If you must edit `tasks.json` directly:

1. Edit [`public/tasksDB/github-task-manager/tasks.json`](public/tasksDB/github-task-manager/tasks.json)
2. Regenerate derived files locally:
   ```bash
   npm run tasks:regenerate-all
   ```
3. Commit **only** the `tasks.json` change:
   ```bash
   git add public/tasksDB/github-task-manager/tasks.json
   git commit -m "Update tasks: <short description>"
   ```
4. The derived files will stay ignored (not committed).

### 3. Regenerating Derived Files

After editing `tasks.json`, regenerate the state and CSV files for local testing:

```bash
# Regenerate both state and CSV in one command
npm run tasks:regenerate-all

# Or individually:
npm run tasks:generate-state
npm run tasks:regenerate-csv
```

**Note**: These files are not committed; they're ignored by `.gitignore`. The live site regenerates them during deploy via CI.

### Writes, Tokens, and Security

- Do **not** ship a repo write token to GitHub Pages. Anything under `public/` is publicly downloadable.
- Preferred write path for the live site is **Cloudflare Worker mode**, where the token stays server-side.
- For local development only, you may provide a fine-grained token in `public/config/github-token.local.js` (gitignored), or run the local dev server (`npm start`) to persist to disk via `/api/tasks`.

### 4. Testing Locally

#### View generated files (without committing them):
```bash
npm run tasks:regenerate-all

# Now you can view/test with fresh state/csv
ls public/tasksDB/github-task-manager/state/
cat public/tasksDB/github-task-manager/tasks.csv
```

#### Verify files are ignored:
```bash
git check-ignore -v public/tasksDB/github-task-manager/state/* public/tasksDB/github-task-manager/tasks.csv

# Should show .gitignore rules matching these files
```

### 5. Committing Changes

Only track `tasks.json` and code changes — never commit derived files:

```bash
# Good: commit only the source JSON
git add public/tasksDB/github-task-manager/tasks.json
git commit -m "Update tasks: document token strategy"
git push origin main

# Bad: do not commit these
git add public/tasksDB/github-task-manager/state/*
git add public/tasksDB/github-task-manager/tasks.csv
```

If you accidentally stage them, unstage with:
```bash
git reset HEAD public/tasksDB/github-task-manager/state/*
git reset HEAD public/tasksDB/github-task-manager/tasks.csv
```

### 6. Handling Merge Conflicts

If you encounter merge conflicts during rebase, prefer the remote version for derived files:

```bash
# Resolve conflict by accepting remote's version
git checkout --theirs public/tasksDB/github-task-manager/state/*
git checkout --theirs public/tasksDB/github-task-manager/tasks.csv
git add <conflicted-files>
git rebase --continue
```

For `tasks.json`, manually inspect and merge if needed, then:
```bash
git add public/tasksDB/github-task-manager/tasks.json
git rebase --continue
```

## Tips for Friction-Free Collaboration

1. **Use `git rerere`** to cache conflict resolutions automatically:
   ```bash
   git config --global rerere.enabled true
   ```

2. **Small, focused commits** — split large changes across commits so others can merge/rebase without major conflicts.

3. **Update often** — run `git fetch && git rebase origin/main` frequently to stay current.

4. **Use the Playwright UI tests** — instead of editing JSON directly, use the automation scripts to create/update tasks so the workflow is reproducible and testable.

## Continuous Integration & Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. Validates `tasks.json` schema
2. Runs test suite
3. **Regenerates derived files** (`state/` and `tasks.csv`) before deploying to GitHub Pages

This ensures the live site always has fresh, consistent derived artifacts without developers needing to commit them.

## Questions?

Refer to:
- [README.md](README.md) — project overview and architecture
- [tests/e2e/update-task-via-ui.spec.js](tests/e2e/update-task-via-ui.spec.js) — Playwright automation examples
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) — CI/CD configuration

---

**Happy contributing!** 🚀
