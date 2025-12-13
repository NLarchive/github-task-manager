# Testing Guide

## Unit Tests

Run Node.js unit tests:

```bash
npm test                    # Run all tests once
npm run test:watch        # Watch mode (reruns on changes)
npm run test:validate     # Validate task schema only
```

Tests cover:
- Task validation rules
- Field automation
- Task database operations
- Configuration schema

---

## Playwright E2E Tests

End-to-end browser automation tests.

### Setup

```bash
npm install @playwright/test  # Already in package.json
```

### Run Tests

```bash
# Headless (default)
npm run test:playwright

# With UI (watch mode, very useful)
npm run test:playwright:ui

# Headed (see browser)
npm run test:playwright:headed

# Debug mode (step through)
npm run test:playwright:debug

# HTML report
npm run test:playwright:report
```

### Specific Tests

```bash
# Run one test file
npx playwright test tests/e2e/crud-operations.spec.js

# Run one test
npx playwright test -g "should create new task"

# Chrome only
npx playwright test --project=chromium
```

---

## Task Update via UI

Use Playwright to update tasks through the web interface instead of editing JSON:

```bash
npx playwright test tests/e2e/update-task-via-ui.spec.js --headed
```

This automation:
- Navigates to the app
- Fills task forms programmatically
- Updates progress, status, dates, etc.
- Saves through the UI
- Regenerates derived files

---

## Local Testing Workflow

```bash
# 1. Start local server
cd public
python -m http.server 8000    # or: npx http-server -p 8000

# 2. In another terminal, run tests
npm run test:playwright:ui    # Use UI mode to watch

# 3. Tests interact with http://localhost:3000/
```

---

## Coverage

Current test categories:
- ✅ **Unit Tests** — Configuration, validation, automation, database
- ✅ **E2E Tests** — Create, read, update, delete tasks
- ✅ **UI Automation** — Update tasks via web form
- ✅ **Password Protection** — Write gate testing
- ✅ **GitHub Issues Sync** — Sync operations
- ✅ **Timeline View** — Visualization rendering

---

## Continuous Integration

Tests run automatically on:
- Every push to `main`
- Every pull request
- Can be manually triggered in Actions tab

See [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml) for CI configuration.

---

## Tips

1. **Use UI mode for development**: `npm run test:playwright:ui` lets you watch tests run and interact
2. **Debug specific tests**: `npx playwright test -g "keyword" --debug`
3. **Check Playwright Report**: `npm run test:playwright:report` opens interactive HTML report
4. **Run headless for CI**: Default mode is faster and suitable for automation

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Test Files](../../tests/e2e/)
- [Configuration](../../tests/playwright.config.js)
- Category label
- Start/End dates
- Estimated hours vs Actual hours
- Assigned workers
- Tags

### 5. **Add New Task**
Click "+ Add New Task" button to open form with:
- **Required Fields** (marked with *):
  - Task Name
  - Description
  - Status (dropdown)
  - Priority (dropdown)
  - Start Date
  - End Date
  - Estimated Hours
  - Category (dropdown with 10 options)

- **Optional Fields**:
  - Progress Percentage (0-100%)
  - Actual Hours
  - Tags (comma-separated)
  - Parent Task ID (for subtasks)
  - Dependencies (format: "id: TYPE" - where TYPE is FS/SS/FF/SF)
  - Assigned Workers
  - Critical Path (checkbox)
  - Comments

- **Auto-populated Fields**:
  - Task ID (auto-generated, next sequential number)
  - Created Date (current timestamp)
  - Creator ID (your name from top input)
  - Completed Date (set when status = "Completed")

### 6. **Task Management**
- **View Details**: Click on any task to see full details
- **Edit Task**: Modify any field and save
- **Delete Task**: Remove tasks from the list
- **Mark Complete**: Update status to "Completed"
- **Track Progress**: Update progress percentage and actual hours

### 7. **Data Persistence**
- Changes sync to GitHub repository
- Click "🔄 Refresh" to reload latest from GitHub
- Export to CSV for local backup

### 8. **Validation**
Testing error handling - try:
- Submit form with empty required fields
- Enter invalid dates (end before start)
- Enter non-numeric hours
- Invalid priority/status selections
All trigger validation errors with helpful messages

### 9. **GitHub Integration**
- View connected repository: "nlarchive/github-task-manager"
- All changes commit to main branch
- Task data stored in repository's tasks.json file

### 10. **User Collaboration**
- Enter your name at top (saved in localStorage)
- Your name appears as creator when creating tasks
- Public users can see all updates with timestamps

## 📊 Current Project State
- **Total Tasks**: 10
- **Completed**: Tasks 1, 2, 3, 7 (4 tasks)
- **In Progress**: Task 9 (GitHub Pages - 75%)
- **Not Started**: Tasks 4, 5, 6, 8, 10

### Task Breakdown
1. ✅ Remove Auth Form & Pre-Configure Token
2. ✅ Update Task Form with All Required Fields  
3. ✅ Implement Task Automation Logic
4. ⏳ Create Subtask Support (High)
5. ⏳ Implement Task Dependencies & Critical Path (High)
6. ⏳ Implement Public Collaboration Features (High)
7. ✅ Test Task Creation & Automation
8. ⏳ Update Documentation & README (Medium)
9. 🔄 Deploy to GitHub Pages (75% - In Progress)
10. ⏳ Project Retrospective (Medium)

## 🔧 Technical Details
- **Framework**: Vanilla JavaScript (no build tools)
- **Storage**: GitHub repository (tasks.json)
- **Deployment**: GitHub Pages via GitHub Actions
- **API**: GitHub REST API v3
- **Token**: Injected via GitHub Actions secrets (GH_TOKEN)

## 🐛 Error Handling
If you see errors:
1. **Token error**: Check GitHub Actions secrets (GH_TOKEN) is set
2. **Tasks not loading**: Browser console shows fallback to local file working
3. **Save fails**: Verify GitHub token has `repo` permissions

## 📝 Test Checklist
- [ ] Tasks load on page open
- [ ] Statistics update correctly
- [ ] Filters work independently and together
- [ ] Can create new task with all field types
- [ ] Auto-populated fields show correct values
- [ ] Validation errors appear for required fields
- [ ] Can edit existing task
- [ ] Can delete task (confirm with modal)
- [ ] Progress bar updates with percentage
- [ ] Status changes update completed_date
- [ ] Refresh loads latest from GitHub
- [ ] CSV export downloads with all tasks
- [ ] Can assign workers to tasks
- [ ] Can add tags to tasks
- [ ] Comments section functional
- [ ] Dependencies can be set (format: "id: FS")
- [ ] Critical path checkbox works
