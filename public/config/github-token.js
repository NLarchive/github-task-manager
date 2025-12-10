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
const GH_TOKEN = '';

// DO NOT MODIFY BELOW THIS LINE
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GH_TOKEN };
}
