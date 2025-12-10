#!/usr/bin/env node
/**
 * GitHub Task Manager - Setup Script
 * Initializes the repository and pushes to GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`${colors.red}Command failed: ${cmd}${colors.reset}`);
    throw error;
  }
}

async function main() {
  console.log(`${colors.blue}🚀 GitHub Task Manager Setup${colors.reset}`);
  console.log('='.repeat(50));

  // Check if git is initialized
  if (!fs.existsSync('.git')) {
    console.log(`\n${colors.cyan}Initializing git repository...${colors.reset}`);
    exec('git init');
  }

  // Get GitHub token
  console.log(`\n${colors.cyan}GitHub Configuration${colors.reset}`);
  console.log('You need a GitHub Personal Access Token with repo permissions.');
  console.log('Generate one at: https://github.com/settings/tokens\n');
  
  const token = await question('Enter your GitHub Personal Access Token: ');
  
  if (!token) {
    console.log(`${colors.red}Token is required!${colors.reset}`);
    process.exit(1);
  }

  // Create local token file
  const tokenContent = `// GitHub Token Configuration (Local Development)
// ⚠️ THIS FILE IS GITIGNORED - DO NOT COMMIT
const GITHUB_TOKEN = '${token}';
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GITHUB_TOKEN };
}
`;

  fs.writeFileSync('public/config/github-token.local.js', tokenContent);
  console.log(`${colors.green}✓ Token saved to public/config/github-token.local.js${colors.reset}`);

  // Update .gitignore to include local token
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (!gitignore.includes('github-token.local.js')) {
    fs.appendFileSync('.gitignore', '\npublic/config/github-token.local.js\n');
    console.log(`${colors.green}✓ Added github-token.local.js to .gitignore${colors.reset}`);
  }

  // Run tests
  console.log(`\n${colors.cyan}Running tests...${colors.reset}`);
  try {
    exec('node tests/run-tests.js');
    exec('node tests/validate-schema.js');
    console.log(`${colors.green}✓ All tests passed!${colors.reset}`);
  } catch {
    console.log(`${colors.red}Tests failed! Please fix issues before pushing.${colors.reset}`);
    process.exit(1);
  }

  // Add and commit files
  console.log(`\n${colors.cyan}Committing files...${colors.reset}`);
  exec('git add .');
  
  try {
    exec('git commit -m "Initial setup: GitHub Task Manager"');
    console.log(`${colors.green}✓ Files committed${colors.reset}`);
  } catch {
    console.log(`${colors.yellow}No changes to commit${colors.reset}`);
  }

  // Check for remote
  console.log(`\n${colors.cyan}Setting up GitHub remote...${colors.reset}`);
  try {
    execSync('git remote get-url origin', { stdio: 'pipe' });
    console.log(`${colors.green}✓ Remote origin already exists${colors.reset}`);
  } catch {
    const repoUrl = 'https://github.com/nlarchive/github-task-manager.git';
    exec(`git remote add origin ${repoUrl}`);
    console.log(`${colors.green}✓ Added remote origin: ${repoUrl}${colors.reset}`);
  }

  // Push to GitHub
  console.log(`\n${colors.cyan}Pushing to GitHub...${colors.reset}`);
  const push = await question('Push to GitHub now? (y/n): ');
  
  if (push.toLowerCase() === 'y') {
    exec('git branch -M main');
    exec('git push -u origin main');
    console.log(`${colors.green}✓ Pushed to GitHub!${colors.reset}`);
    
    console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
    console.log('1. Go to repository Settings → Secrets → Actions');
    console.log('2. Add secret: TASK_MANAGER_TOKEN with your GitHub token');
    console.log('3. Go to Settings → Pages → Enable GitHub Pages');
    console.log('4. Your site will be at: https://nlarchive.github.io/github-task-manager');
  }

  console.log(`\n${colors.green}✅ Setup complete!${colors.reset}`);
  rl.close();
}

main().catch(console.error);
