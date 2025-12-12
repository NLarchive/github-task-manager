# Cloudflare Worker Deployment Script (PowerShell)
# This script helps deploy the worker and set up secrets

Write-Host "🚀 GitHub Task Manager - Cloudflare Worker Deployment" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

# Check if wrangler is installed
try {
    $wranglerVersion = wrangler --version 2>$null
    if ($wranglerVersion) {
        Write-Host "✓ Wrangler installed: $wranglerVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Wrangler not found. Install with: npm install -g wrangler" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📍 Step 1: Authenticate with Cloudflare" -ForegroundColor Yellow
Write-Host "This will open your browser to log in..."
Write-Host ""

wrangler login

Write-Host ""
Write-Host "📍 Step 2: Deploying Worker..." -ForegroundColor Yellow
Write-Host ""

wrangler deploy

Write-Host ""
Write-Host "📍 Step 3: Setting up secrets..." -ForegroundColor Yellow
Write-Host ""
Write-Host "The worker URL will be: https://github-task-manager.YOUR-USERNAME.workers.dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now we'll set the secrets. You'll be prompted for each value." -ForegroundColor Cyan
Write-Host ""

# Set secrets
Write-Host "1️⃣  Enter your GitHub Fine-Grained PAT (contents:write scope):" -ForegroundColor Yellow
$github_token = Read-Host -AsSecureString | ConvertFrom-SecureString -AsPlainText
wrangler secret put GITHUB_TOKEN --text $github_token

Write-Host ""
Write-Host "2️⃣  Enter ACCESS_PASSWORD_MASTER (fallback for all projects):" -ForegroundColor Yellow
$password_master = Read-Host -AsSecureString | ConvertFrom-SecureString -AsPlainText
wrangler secret put ACCESS_PASSWORD_MASTER --text $password_master

Write-Host ""
Write-Host "3️⃣  Enter ACCESS_PASSWORD_GITHUB_TASK_MANAGER:" -ForegroundColor Yellow
$password_gtm = Read-Host -AsSecureString | ConvertFrom-SecureString -AsPlainText
wrangler secret put ACCESS_PASSWORD_GITHUB_TASK_MANAGER --text $password_gtm

Write-Host ""
Write-Host "4️⃣  Enter ACCESS_PASSWORD_AI_CAREER_ROADMAP:" -ForegroundColor Yellow
$password_acr = Read-Host -AsSecureString | ConvertFrom-SecureString -AsPlainText
wrangler secret put ACCESS_PASSWORD_AI_CAREER_ROADMAP --text $password_acr

Write-Host ""
Write-Host "✅ Worker deployed and secrets set!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Get your worker URL from: https://dash.cloudflare.com"
Write-Host "   (Workers → github-task-manager → Settings → Triggers & Routes)"
Write-Host ""
Write-Host "2. Add GITHUB_WORKER_URL to GitHub repo secrets:"
Write-Host "   https://github.com/nlarchive/github-task-manager/settings/secrets/actions"
Write-Host ""
Write-Host "3. Redeploy the GitHub Pages site to pick up the new worker URL"
Write-Host ""
Write-Host "⚠️  Remember to revoke the exposed token if not already done!" -ForegroundColor Yellow
Write-Host "   https://github.com/settings/tokens"
