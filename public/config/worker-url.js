// Placeholder - Worker URL will be injected at deploy time by GitHub Actions
// This file prevents 404 errors during local development
// The actual GH_WORKER_URL is set in worker-url.local.js (local) or injected at deploy

// GitHub Pages runtime convenience:
// Allow setting Worker URL without rebuilding by using either:
//   - Query string: ?workerUrl=https://YOUR.workers.dev
//   - Local storage: localStorage['GH_WORKER_URL']
// NOTE: Worker URL is not a secret (tokens stay inside the Worker).

function __resolveWorkerUrlRuntime() {
  try {
    if (typeof window === 'undefined' || !window.location) return '';

    const params = new URLSearchParams(window.location.search || '');
    const fromQuery = (params.get('workerUrl') || params.get('workerURL') || params.get('ghWorkerUrl') || '').trim();

    const storageKey = 'GH_WORKER_URL';
    if (fromQuery && typeof window.localStorage !== 'undefined') {
      try { window.localStorage.setItem(storageKey, fromQuery); } catch (e) { /* ignore */ }
    }

    let fromStorage = '';
    if (typeof window.localStorage !== 'undefined') {
      try { fromStorage = String(window.localStorage.getItem(storageKey) || '').trim(); } catch (e) { /* ignore */ }
    }

    return fromQuery || fromStorage || '';
  } catch (e) {
    return '';
  }
}

// Prefer deploy-time injection, but fall back to runtime config when empty.
try {
  const runtimeUrl = __resolveWorkerUrlRuntime();
  if (typeof GH_WORKER_URL === 'undefined') {
    // eslint-disable-next-line no-var
    var GH_WORKER_URL = runtimeUrl;
  } else if (!String(GH_WORKER_URL || '').trim() && runtimeUrl) {
    // If deploy didn't inject, allow runtime override.
    // eslint-disable-next-line no-undef
    GH_WORKER_URL = runtimeUrl;
  }
} catch (e) {
  // ignore
}

if (typeof GH_WORKER_URL === 'undefined') {
  var GH_WORKER_URL = '';
}

// Backwards/alias support
if (typeof GITHUB_WORKER_URL === 'undefined') {
  var GITHUB_WORKER_URL = GH_WORKER_URL;
}
