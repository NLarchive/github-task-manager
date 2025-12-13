# Live Testing Guide - GitHub Task Manager

## ✓ Issues Fixed
1. **GitHub token configuration** - Token now properly injected from GitHub Actions secrets
2. **Tasks loading error** - Implemented fallback mechanism to load from local `tasks.json` file
3. **Repository API access** - Added `tasks.json` to repository root for GitHub API access

## 🚀 Live Website
**https://nlarchive.github.io/github-task-manager/**

## ✅ Features to Test

### 1. **View Existing Tasks**
- Page loads 10 project tasks automatically
- Tasks from 4 categories visible: Frontend Development, Backend Development, Testing, Deployment, Documentation, Project Setup, Retrospective

### 2. **Task Statistics**
- Dashboard shows: Total Tasks (10), Not Started (5), In Progress (3), Completed (2)
- Stats update when you modify tasks

### 3. **Filters**
- Filter by Status: Not Started, In Progress, On Hold, Blocked, Completed, Cancelled, Pending Review
- Filter by Priority: Critical, High, Medium, Low
- Multiple filters work together

### 4. **Task List Display**
Each task card shows:
- Task ID and Name
- Priority (color-coded: Critical=red, High=orange, Medium=yellow, Low=blue)
- Status badge
- Progress percentage bar
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
