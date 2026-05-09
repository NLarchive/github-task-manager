/** Base URL for the local Agentic IDE bridge API. */
export const BRIDGE_BASE = 'http://localhost:3131';

/** Cached bridge responses with ETag and inflight request tracking. */
const cacheState = {
  registry: { data: null, etag: null, fetchedAt: 0, inflight: null },
  model: { data: null, etag: null, fetchedAt: 0, inflight: null }
};

/** Get the cache entry object for a named bridge resource. */
function getCacheEntry(key) {
  return cacheState[key];
}

/** Fetch JSON from the bridge with ETag caching and optional TTL overrides. */
async function fetchCachedJson(key, endpoint, { force = false, ttlMs = 2000 } = {}) {
  const entry = getCacheEntry(key);
  if (!force && entry.data && Date.now() - entry.fetchedAt < ttlMs) return entry.data;
  if (entry.inflight) return entry.inflight;

  entry.inflight = (async () => {
    const headers = {};
    if (entry.etag) headers['If-None-Match'] = entry.etag;
    const res = await fetch(`${BRIDGE_BASE}${endpoint}`, { headers });
    if (res.status === 304 && entry.data) {
      entry.fetchedAt = Date.now();
      return entry.data;
    }
    if (!res.ok) throw new Error(`${endpoint} ${res.status}`);
    entry.etag = res.headers.get('ETag') || null;
    entry.data = await res.json();
    entry.fetchedAt = Date.now();
    return entry.data;
  })().finally(() => {
    entry.inflight = null;
  });

  return entry.inflight;
}

/** Get the current cached ETag for a bridge resource key. */
export function getCachedEtag(key) {
  return getCacheEntry(key)?.etag || null;
}

/** Get the workspace registry from the bridge, with optional caching controls. */
export async function getRegistry(options = {}) {
  return fetchCachedJson('registry', '/api/registry', options);
}

/** Get model asset and status information from the bridge. */
export async function getModelInfo(options = {}) {
  return fetchCachedJson('model', '/api/model', options);
}

/** Read a component file through the bridge file API. */
export async function readFile(componentPath, filename) {
  const rel = componentPath ? `${componentPath}/${filename}` : filename;
  try {
    const res = await fetch(`${BRIDGE_BASE}/api/file?path=${encodeURIComponent(rel)}`);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Write a component file to the bridge file API. */
export async function writeFile(componentPath, filename, content) {
  const rel = componentPath ? `${componentPath}/${filename}` : filename;
  try {
    const res = await fetch(`${BRIDGE_BASE}/api/file?path=${encodeURIComponent(rel)}`, {
      method: 'PUT',
      body: content,
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** List files in a component folder using the bridge API. */
export async function listFiles(componentPath) {
  try {
    const res = await fetch(`${BRIDGE_BASE}/api/list?path=${encodeURIComponent(componentPath || '')}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Send a prompt to the bridge LLM completion endpoint and return text. */
export async function llmComplete(prompt, options = {}) {
  try {
    const res = await fetch(`${BRIDGE_BASE}/api/llm/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        modelId: options.modelId,
        max_tokens: options.max_tokens ?? 512,
        temperature: options.temperature ?? 0.2,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content ?? data.text ?? data.generated_text ?? null;
  } catch {
    return null;
  }
}

/** Run a workspace node through the bridge runtime API. */
export async function runRuntimeNode(nodeId, input = {}, options = {}) {
  const res = await fetch(`${BRIDGE_BASE}/api/runtime/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nodeId,
      input,
      modelId: options.modelId,
      max_tokens: options.max_tokens,
      temperature: options.temperature,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Runtime run failed (${res.status})`);
  }
  return res.json();
}

/** Run tests for a workspace component via the bridge runtime API. */
export async function runRuntimeTests(nodeId, options = {}) {
  const res = await fetch(`${BRIDGE_BASE}/api/runtime/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nodeId,
      modelId: options.modelId,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Runtime test failed (${res.status})`);
  }
  return res.json();
}

/** Check whether the bridge and LLM endpoints are reachable. */
export async function checkBridge() {
  try {
    const data = await getModelInfo({ force: true, ttlMs: 0 });
    let llm = false;
    try {
      const llmRes = await fetch(`${BRIDGE_BASE}/api/llm/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'health check', max_tokens: 1 }),
      });
      llm = llmRes.ok;
    } catch {}
    return { bridge: true, llm, ggufExists: data.ggufExists ?? data.exists ?? false, models: data.models || [] };
  } catch {
    return { bridge: false, llm: false, ggufExists: false, models: [] };
  }
}

/** Watch the bridge registry for changes and notify UI callbacks. */
export class RegistryWatchdog {
  constructor(config = {}) {
    const {
      onRefresh,
      onOffline = () => {},
      onOnline = () => {},
      cooldownMs = 3000,
      graceMs = 4000,
    } = config;

    if (typeof onRefresh !== 'function') throw new Error('RegistryWatchdog: onRefresh is required');

    this._onRefresh = onRefresh;
    this._onOffline = onOffline;
    this._onOnline = onOnline;
    this._cooldownMs = cooldownMs;
    this._graceMs = graceMs;
    this._knownEtag = null;
    this._isChecking = false;
    this._lastCheckAt = 0;
    this._gracePeriod = 0;
    this._bridgeOnline = null;
    this._listeners = [];
  }

  /** Initialize the watchdog and load the latest registry snapshot. */
  async initialize() {
    const registry = await getRegistry({ force: true, ttlMs: 0 });
    this._knownEtag = getCachedEtag('registry');
    this._registerTriggers();
    return registry;
  }

  /** Force a registry refresh and notify listeners. */
  async forceRefresh() {
    const registry = await getRegistry({ force: true, ttlMs: 0 });
    this._knownEtag = getCachedEtag('registry');
    await this._onRefresh(registry, { trigger: 'forced', etag: this._knownEtag });
  }

  /** Stop watching DOM triggers and clean up listeners. */
  destroy() {
    this._listeners.forEach(([target, event, fn]) => target.removeEventListener(event, fn));
    this._listeners = [];
  }

  /** Register DOM triggers to refresh the registry when the app state changes. */
  _registerTriggers() {
    const on = (target, event, fn) => {
      target.addEventListener(event, fn);
      this._listeners.push([target, event, fn]);
    };

    on(document, 'visibilitychange', () => {
      if (document.visibilityState === 'visible') this._check('visibilitychange');
    });
    on(window, 'focus', () => this._check('focus'));
    on(window, 'online', () => {
      this._lastCheckAt = 0;
      this._check('online');
    });
    on(window, 'popstate', () => this._check('popstate'));
    on(document, 'click', () => {
      if (!this._bridgeOnline) this._check('click-reconnect');
    });
  }

  /** Poll the bridge and reload registry data when conditions allow. */
  async _check(trigger) {
    if (this._isChecking) return;
    if (Date.now() < this._gracePeriod) return;
    if (Date.now() - this._lastCheckAt < this._cooldownMs) return;

    this._isChecking = true;
    try {
      const res = await fetch(`${BRIDGE_BASE}/api/registry`, { method: 'HEAD' });
      if (!res.ok) throw new Error(`HEAD ${res.status}`);
      const serverEtag = res.headers.get('ETag');
      this._setBridgeOnline(true);
      if (!this._knownEtag || (serverEtag && serverEtag !== this._knownEtag)) {
        const registry = await getRegistry({ force: true, ttlMs: 0 });
        this._knownEtag = getCachedEtag('registry');
        this._gracePeriod = Date.now() + this._graceMs;
        await this._onRefresh(registry, { trigger, etag: this._knownEtag });
      }
    } catch (err) {
      this._setBridgeOnline(false);
      console.warn('[agentic-ide watchdog] Bridge unreachable:', err.message);
    } finally {
      this._isChecking = false;
      this._lastCheckAt = Date.now();
    }
  }

  /** Update online/offline status and notify listeners if changed. */
  _setBridgeOnline(online) {
    if (this._bridgeOnline === online) return;
    this._bridgeOnline = online;
    if (online) this._onOnline();
    else this._onOffline();
  }
}
