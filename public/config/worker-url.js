/**
 * Runtime resolver for the Cloudflare worker URL used by secure write flows.
 *
 * Deployments can inject `GH_WORKER_URL`, while local and hosted debugging can
 * override the value with a query string or localStorage without rebuilding.
 */

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
