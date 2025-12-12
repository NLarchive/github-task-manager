# Cloudflare Worker for Secure GitHub Writes

This worker acts as a secure proxy between the static GitHub Pages site and the GitHub API. It:

1. **Validates ACCESS_PASSWORD** before allowing any write
2. **Restricts writes to TaskDB paths only** (prevents arbitrary repo modifications)
3. **Keeps the GitHub token secret** (never exposed to browser)

## Setup

### 1. Create Cloudflare Account
- Go to [cloudflare.com](https://cloudflare.com) and create a free account
- Navigate to Workers & Pages → Create Application → Create Worker

### 2. Deploy the Worker
- Copy the contents of `worker.js` into the Cloudflare Worker editor
- Click "Save and Deploy"

### 3. Configure Environment Variables
In your Worker settings, add these environment variables:

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | Fine-grained PAT with `contents:write` for the repo |
| `ACCESS_PASSWORD_MASTER` | Master password (unlocks all projects) |
| `ACCESS_PASSWORD_GITHUB_TASK_MANAGER` | Password for github-task-manager project |
| `ACCESS_PASSWORD_AI_CAREER_ROADMAP` | Password for ai-career-roadmap project |

### 4. Get Your Worker URL
After deploying, you'll get a URL like:
```
https://task-manager-api.YOUR-SUBDOMAIN.workers.dev
```

### 5. Configure the App
Update `public/config/template-config.js` to add the worker URL:

```javascript
GITHUB: {
  // ... existing config ...
  WORKER_URL: 'https://task-manager-api.YOUR-SUBDOMAIN.workers.dev'
}
```

## Security Features

### Path Validation
The worker only allows writes to these patterns:
- `public/tasksDB/<projectId>/tasks.json`
- `public/tasksDB/<projectId>/tasks.csv`
- `public/tasksDB/<projectId>/state/*.json`
- `public/tasksDB/<projectId>/history/*.json`

Any attempt to write elsewhere (e.g., `README.md`, `index.html`) will be rejected with 403.

### Password Validation
Every request must include a valid `accessPassword` that matches either:
- The master password (`ACCESS_PASSWORD_MASTER`)
- The project-specific password (e.g., `ACCESS_PASSWORD_GITHUB_TASK_MANAGER`)

### CORS Protection
Only requests from allowed origins are accepted:
- `https://nlarchive.github.io`
- `http://localhost:3000` (for development)

## API Endpoints

### PUT /api/tasks
Update a TaskDB file.

**Request Body:**
```json
{
  "projectId": "github-task-manager",
  "accessPassword": "your-password",
  "filePath": "public/tasksDB/github-task-manager/tasks.json",
  "content": "{ ... JSON content ... }",
  "message": "Update tasks"
}
```

**Response:**
```json
{
  "success": true,
  "sha": "abc123...",
  "commit": "def456..."
}
```

### GET /api/task-history
Read per-project task history events (latest-first).

**Query params:**
- `project` (required): project id, e.g. `github-task-manager`
- `taskId` (optional): filter by a single task id
- `limit` (optional): max events to return (default 200, max 500)

**Example:**
`GET /api/task-history?project=github-task-manager&limit=100`

**Response:**
```json
{
  "items": [
    {
      "ts": "2025-12-12T19:00:00.000Z",
      "projectId": "github-task-manager",
      "actor": "Alice",
      "action": "update",
      "taskId": "12",
      "changeSummary": "status, progress_percentage"
    }
  ]
}
```

### GET /health
Health check endpoint.

## Cost
Cloudflare Workers free tier includes:
- 100,000 requests per day
- No credit card required

This is more than enough for a task management app.

## Alternative: Vercel Edge Functions
If you prefer Vercel, the same logic can be deployed as an Edge Function. The code is nearly identical - just adapt the handler signature.
