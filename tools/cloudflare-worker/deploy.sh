#!/usr/bin/env bash
# Cloudflare Worker Deployment Script
# This script helps deploy the worker and set up secrets

echo "🚀 GitHub Task Manager - Cloudflare Worker Deployment"
echo "======================================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Install with: npm install -g wrangler"
    exit 1
fi

echo "✓ Wrangler installed: $(wrangler --version)"
echo ""

# Step 1: Login
echo "📍 Step 1: Authenticate with Cloudflare"
echo "This will open your browser to log in..."
echo ""
wrangler login

# Step 2: Deploy
echo ""
echo "📍 Step 2: Deploying Worker..."
echo ""
wrangler deploy

# Step 3: Get the worker URL
echo ""
echo "📍 Step 3: Setting up secrets..."
echo ""
echo "The worker URL will be: https://github-task-manager.YOUR-USERNAME.workers.dev"
echo ""
echo "Now we'll set the secrets. You'll be prompted for each value."
echo ""

# Set secrets
echo "Enter your GitHub Fine-Grained PAT (with contents:write to github-task-manager):"
read -s github_token
wrangler secret put GITHUB_TOKEN --text "$github_token"

echo ""
echo "Enter ACCESS_PASSWORD_MASTER (fallback password for all projects):"
read -s password_master
wrangler secret put ACCESS_PASSWORD_MASTER --text "$password_master"

echo ""
echo "Enter ACCESS_PASSWORD_GITHUB_TASK_MANAGER (password for this project):"
read -s password_gtm
wrangler secret put ACCESS_PASSWORD_GITHUB_TASK_MANAGER --text "$password_gtm"

echo ""
echo "Enter ACCESS_PASSWORD_AI_CAREER_ROADMAP (password for ai-career-roadmap):"
read -s password_acr
wrangler secret put ACCESS_PASSWORD_AI_CAREER_ROADMAP --text "$password_acr"

echo ""
echo "✅ Worker deployed and secrets set!"
echo ""
echo "📝 Next steps:"
echo "1. Get your worker URL from: https://dash.cloudflare.com (Workers → github-task-manager)"
echo "2. Add GITHUB_WORKER_URL to GitHub repo secrets:"
echo "   https://github.com/nlarchive/github-task-manager/settings/secrets/actions"
echo "3. Redeploy the GitHub Pages site to pick up the new worker URL"
