// Projects Configuration (Centralized)
//
// Purpose
// - Defines the canonical list of supported projects and their repository metadata.
// - Used by `public/config/template-config.js` to populate `TEMPLATE_CONFIG.GITHUB.PROJECTS`.
//
// Security
// - This file is intentionally NON-SECRET and may be committed.
// - Do NOT place tokens or passwords here.
//   Keep sensitive values in access-secret.* (client gate) and/or Worker environment variables.

// Global variable expected by `template-config.js`
// Shape: Array<{ id, label, owner, repo, branch, tasksRoot }>
var PROJECTS_CONFIG = [
  {
    id: 'github-task-manager',
    label: 'GitHub Task Manager',
    owner: 'nlarchive',
    repo: 'github-task-manager',
    branch: 'main',
    tasksRoot: 'public/tasksDB'
  },
  {
    id: 'ai-career-roadmap',
    label: 'AI Career Roadmap (learn.deeplearning.ai)',
    // Store and serve roadmap tasks from this repository's TaskDB
    // so the UI can load them via same-origin fetch on localhost and GitHub Pages.
    owner: 'nlarchive',
    repo: 'github-task-manager',
    branch: 'main',
    tasksRoot: 'public/tasksDB'
  },
  {
    id: 'first-graph',
    label: 'First Graph',
    // Store and serve tasks from this repository's TaskDB
    owner: 'nlarchive',
    repo: 'first-graph',
    branch: 'main',
    tasksRoot: 'public/tasksDB'
  }
];

// For non-browser environments (tests, scripts), export when possible.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PROJECTS_CONFIG;
}
