# Quickstart — GitHub Task Manager

This quickstart gets you running locally and enables GitHub Pages deployment with minimal steps.

## Local Development
1. Clone repository:
   ```bash
   git clone https://github.com/nlarchive/github-task-manager.git
   cd github-task-manager
   ```
2. Regenerate derived files:
   ```bash
   npm run tasks:regenerate-all
   ```
3. Serve the `public/` directory:
   ```bash
   cd public
   npx http-server -p 8000
   # or python -m http.server 8000
   ```
4. Visit: http://localhost:8000

## Enable GitHub Pages
1. Settings → Pages → Build and deployment → Source: **GitHub Actions**
2. Add SECRET: `TASK_MANAGER_TOKEN` (PAT with `repo` + `pages` scopes)
3. Push to `main` to trigger deploy

## Quick Tests
- Run unit tests:
  ```bash
  npm test
  ```
- Run Playwright E2E:
  ```bash
  npx playwright test
  ```



## ⚡ 2-Minute Setup

### 1. Go to Settings
📍 https://github.com/NLarchive/github-task-manager/settings

### 2. Find "Pages" Section
Scroll down to **Pages** and look for "Build and deployment"

### 3. Change Source
**Current**: "Deploy from a branch"  
**Change to**: "GitHub Actions"

### 4. Add Secret
📍 https://github.com/NLarchive/github-task-manager/settings/secrets/actions

- Click **"New repository secret"**
- **Name**: `TASK_MANAGER_TOKEN`
- **Value**: [Your GitHub PAT with repo + pages scope]
- Click **"Add secret"**

### 5. Done! 
Site will be live at: https://nlarchive.github.io/github-task-manager/

---

## 📋 Files Changed Today

| File | Change | Status |
|------|--------|--------|
| `.github/workflows/deploy.yml` | Removed npm dependency | ✅ Pushed |
| `public/tasksDB/external/github-task-manager/node.tasks.json` | Created task database | ✅ Pushed |

> Multi-project note: each project lives in `public/tasksDB/<scope>/<projectId>/node.tasks.json`.
| `public/tasksDB/external/github-task-manager/tasks.csv` | Created CSV export | ✅ Pushed |
| `public/tasksDB/README.md` | Database docs | ✅ Pushed |
| `public/health/index.html` | Diagnostics page | ✅ Pushed |
| `GITHUB_PAGES_SETUP.md` | Setup instructions | ✅ Pushed |
| `DEPLOYMENT_SUMMARY.md` | Full summary | ✅ Pushed |

---

## 🎯 Current Project State

```
✅ Task 1: Remove Authentication ...................... Completed
✅ Task 2: Update Task Form ............................ Completed
✅ Task 3: Implement Automation ........................ Completed
⏳ Task 4: Create Subtask Support ...................... Not Started
⏳ Task 5: Implement Dependencies ...................... Not Started
⏳ Task 6: Collaboration Features ...................... Not Started
✅ Task 7: Test Task Creation .......................... Completed
⏳ Task 8: Update Documentation ........................ Not Started
✅ Task 9: Deploy to GitHub Pages ...................... Completed
⏳ Task 10: Project Retrospective ...................... Not Started
```

**Progress**: 5/10 tasks completed (50%)

---

## 🌐 After Setup Complete

| Component | Status | URL |
|-----------|--------|-----|
| GitHub Repo | ✅ Live | https://github.com/NLarchive/github-task-manager |
| GitHub Pages | ⏳ Waiting | https://nlarchive.github.io/github-task-manager/ |
| Health Check | ⏳ Waiting | https://nlarchive.github.io/github-task-manager/health/ |
| Task Manager UI | ⏳ Waiting | https://nlarchive.github.io/github-task-manager/list-display/ |

---

## 💡 Key Features Ready

- 📋 Task creation with validation
- 🤖 Auto-populated fields (task_id, dates, creator)
- 📊 JSON + CSV database formats
- 🔐 GitHub token integration
- 💬 Comment system on tasks
- 👥 Worker assignment
- 🏷️ Tags and categories
- 📈 Progress tracking
- 🔗 Task dependencies
- 🌍 Public collaboration (no authentication required)

---

## 📞 Issues During Setup?

**GitHub Pages not showing up?**
→ Settings > Pages must show "GitHub Actions" as source

**Token error when deploying?**
→ Check Actions secrets: Settings > Secrets > Actions > TASK_MANAGER_TOKEN

**404 on live site?**
→ Wait 1-2 minutes after successful deployment
→ Clear browser cache (Ctrl+Shift+Delete)

**Need to test locally first?**
```bash
cd public
python -m http.server 8000
# Visit http://localhost:8000
```

---

**Repository**: https://github.com/NLarchive/github-task-manager  
**Last Updated**: December 10, 2025  
**Status**: Ready for GitHub Pages activation ✨
