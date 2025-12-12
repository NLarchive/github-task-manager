// GitHub Token Configuration
// ⚠️ THIS FILE SHOULD BE GITIGNORED - DO NOT COMMIT TO REPOSITORY
// 
// For local development:
//   1. Copy this file and name it 'github-token.local.js'
//   2. Add your GitHub Personal Access Token below
//   3. Make sure 'github-token.local.js' is in .gitignore
//
// For GitHub Pages deployment:
//   The token is injected via GitHub Actions from repository secrets
//
// Required token permissions:
//   - repo (Full control of private repositories) OR
//   - public_repo (Access public repositories only)
//   - Contents: Read and write

// Replace with your actual GitHub Personal Access Token
// Generate at: https://github.com/settings/tokens
//
// IMPORTANT:
// - `GITHUB_TOKEN` may be injected at build/runtime (e.g., GitHub Actions).
// - When it is not injected, it will be undefined; do not reference it directly.
const GITHUB_TOKEN_VALUE = (typeof GITHUB_TOKEN !== 'undefined') ? GITHUB_TOKEN : '';
const GH_TOKEN = GITHUB_TOKEN_VALUE;

// DO NOT MODIFY BELOW THIS LINE
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GH_TOKEN, GITHUB_TOKEN_VALUE };
}

// Make available globally for browser environment
if (typeof window !== 'undefined') {
  window.GH_TOKEN = GH_TOKEN;
  window.GITHUB_TOKEN = GITHUB_TOKEN_VALUE;
}
