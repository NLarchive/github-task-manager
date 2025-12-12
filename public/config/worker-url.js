// Placeholder - Worker URL will be injected at deploy time by GitHub Actions
// This file prevents 404 errors during local development
// The actual GH_WORKER_URL is set in worker-url.local.js (local) or injected at deploy

if (typeof GH_WORKER_URL === 'undefined') {
  var GH_WORKER_URL = '';
}
