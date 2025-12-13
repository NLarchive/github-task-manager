# GitHub Pages Setup — Quick Guide

This guide helps you enable GitHub Pages and configure the required secrets. The CI workflow regenerates the derived state and CSV files before deployment.

## Enable GitHub Pages

### Step 1: Enable GitHub Pages
1. Go to: https://github.com/NLarchive/github-task-manager/settings
2. Scroll down to **"Pages"** section
3. Under **"Build and deployment"**, select:
   - **Source**: "GitHub Actions" 
   - This allows the deploy.yml workflow to deploy directly

### Step 2: Configure GitHub Secret
Add your GitHub Personal Access Token to repository secrets:

1. Go to: https://github.com/NLarchive/github-task-manager/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `TASK_MANAGER_TOKEN`
4. Value: Your GitHub Personal Access Token with `repo` and `pages` scopes
5. Click **"Add secret"**

### Step 3: Trigger Deployment
The deployment will automatically trigger when you:
- Push to the main branch
- Or manually trigger via Actions tab

### Step 4: Verify Live Site
After successful deployment, your site will be available at:
**https://nlarchive.github.io/github-task-manager/**

---

## Workflow Status

Monitor deployment progress:
1. Go to: https://github.com/NLarchive/github-task-manager/actions
2. Look for "Deploy GitHub Task Manager" workflow
3. Check the "build" job status

Expected workflow steps:
- ✓ Checkout repository
- ✓ Create token config for deployment
- ✓ Validate tasks.json
- ✓ Setup Pages
- ✓ Upload artifact
- ✓ Deploy to GitHub Pages

---

## Troubleshooting

### "Source is not GitHub Actions"
→ Go to Pages settings and explicitly select "GitHub Actions" as source

### "Deployment failed"
→ Check the workflow run logs in Actions tab

### "404 Page not found"
→ Wait 1-2 minutes after successful deployment
→ Clear browser cache (Ctrl+Shift+Delete)
→ Verify token has correct permissions

### "Cannot read github-token.js"
→ This is injected by GitHub Actions at deployment time
→ Only affects the live site, not local development

---

## Local Testing (Before GitHub Pages)

Test locally before deploying:

```bash
# Simple HTTP server (Python)
python -m http.server 8000 --directory public

# Or using Node.js http-server
npx http-server public -p 8000
```

Then visit: http://localhost:8000

---

## Important Notes

1. **Token Security**: 
   - The token is only stored in GitHub secrets
   - Never commit actual tokens to repository
   - `.gitignore` prevents accidental token commits

2. **Public Site**:
   - Your application is now publicly accessible
   - Anyone can view and potentially create tasks
   - Use responsibly and monitor for misuse

3. **Database Location**:
   - Tasks are stored in: `/public/tasksDB/<projectId>/tasks.json` (default: `/public/tasksDB/github-task-manager/tasks.json`)
   - Also available as CSV: `/public/tasksDB/tasks.csv`
   - Both are version controlled for audit trail

4. **Future Updates**:
   - Simply push changes to main branch
   - Workflow automatically rebuilds and deploys
   - All task changes are persisted to git commits
