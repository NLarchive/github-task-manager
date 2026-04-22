// Projects Configuration (Centralized)
//
// Purpose
// - Defines the canonical list of supported projects and their repository metadata.
// - Used by `public/config/tasks-template-config.js` to populate `TEMPLATE_CONFIG.GITHUB.PROJECTS`.
//
// Security
// - This file is intentionally NON-SECRET and may be committed.
// - Do NOT place tokens or passwords here.
//   Keep sensitive values in access-secret.* (client gate) and/or Worker environment variables.

// Global variable expected by `tasks-template-config.js`
// Shape: Array<{ id, label, scope, owner, repo, branch, tasksRoot }>
//   scope: 'external' = deployed to GitHub Pages / live apps
//          'local'    = local development / test fixtures
var PROJECTS_CONFIG = [
  // --- External (deployed) ---
  {
    id: 'github-task-manager',
    label: 'GitHub Task Manager',
    scope: 'external',
    owner: 'nlarchive',
    repo: 'github-task-manager',
    branch: 'main',
    tasksRoot: 'public/tasksDB'
  },
  {
    id: 'ai-career-roadmap',
    label: 'AI Career Roadmap (learn.deeplearning.ai)',
    scope: 'external',
    owner: 'nlarchive',
    repo: 'github-task-manager',
    branch: 'main',
    tasksRoot: 'public/tasksDB'
  },
  {
    id: 'first-graph',
    label: 'First Graph',
    scope: 'external',
    owner: 'nlarchive',
    repo: 'github-task-manager',
    branch: 'main',
    tasksRoot: 'public/tasksDB'
  },
  // --- Local (dev / test) ---
  {
    id: 'test-tasks',
    label: 'Test Tasks (Fixture)',
    scope: 'local',
    owner: 'nlarchive',
    repo: 'github-task-manager',
    branch: 'main',
    tasksRoot: 'public/tasksDB'
  },
  {
    id: 'web-e2e-bussines',
    label: 'ACME-OS — E2E Business OS',
    scope: 'local',
    owner: 'nlarchive',
    repo: 'github-task-manager',
    branch: 'main',
    tasksRoot: 'public/tasksDB'
  }
];

// For non-browser environments (tests, scripts), export when possible.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PROJECTS_CONFIG;
}
