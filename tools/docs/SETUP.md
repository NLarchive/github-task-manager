# Setup Guide

## Prerequisites

- Git installed
- GitHub account with a public repository
- (Optional) Local Node.js for running tests

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/NLarchive/github-task-manager.git
cd github-task-manager
```

### 2. Install Dependencies (Optional - for local testing only)

```bash
npm install
```

### 3. Create Local Token Config (Optional)

For local GitHub API testing:

```bash
# Create file: public/config/github-token.local.js
const GITHUB_TOKEN = 'your_github_pat_here';
```

This file is gitignored and won't be committed.

---

## GitHub Pages Deployment

### 1. Enable GitHub Pages in Repository

1. **Settings** → **Pages**
2. **Source**: Select `GitHub Actions`
3. Save

### 2. Add Required Secret

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
   - **Name**: `TASK_MANAGER_TOKEN`
   - **Value**: [GitHub PAT](https://github.com/settings/tokens/new) with `repo` scope
3. Click **Add secret**

### 3. Deploy

- Push to `main` branch or manually trigger in **Actions** tab
- Workflow runs automatically
- Site goes live in 1-2 minutes at: https://github.com/username/repository-name/

---

## Verifying Deployment

Check **Actions** tab:
1. Look for "Deploy GitHub Task Manager" workflow
2. Should show ✅ if successful
3. If ✗, click to see logs and errors

---

## Multi-Project Configuration

The app supports multiple task databases (projects).

Each project lives in: `public/tasksDB/<projectId>/tasks.json`

Current projects:
- `github-task-manager` - Main task manager
- `ai-career-roadmap` - AI career learning roadmap

To add a new project:
1. Create `public/tasksDB/my-project/tasks.json`
2. Update access secrets in GitHub Actions (if using password gate)
3. Regenerate state files: `npm run tasks:generate-state`

---

## Local Development Commands

```bash
# Regenerate task state and CSV (after editing tasks.json)
npm run tasks:regenerate-all

# Serve locally for testing
cd public && python -m http.server 8000

# Run tests
npm test
npm run test:playwright

# Format code
npm run format

# Lint code
npm run lint
```

---

## Troubleshooting

**Workflow fails in Actions?**
- Check that `TASK_MANAGER_TOKEN` secret is added
- Verify token has `repo` scope
- Check that `.github/workflows/deploy.yml` exists

**Site shows 404?**
- Wait 2 minutes after deployment
- Clear browser cache
- Check GitHub Pages setting is on `GitHub Actions`

**Can't view tasks locally?**
- Make sure you're in `/public` directory: `cd public`
- Start server: `python -m http.server 8000`
- Visit: `http://localhost:8000`

---

## Next Steps

- Read [TESTING.md](TESTING.md) for running automated tests
- Check [CONTRIBUTING.md](../../CONTRIBUTING.md) for development workflow
- See [README.md](../../README.md) for full project documentation
