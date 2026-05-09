/**
 * task-storage-sync.js — Client-side task CRUD + sync layer
 *
 * Wraps all API calls to the local bridge server.
 * Integrates with CacheWatchdog so saves update the known ETag
 * and the watchdog never mistakes our own writes for external changes.
 *
 * Usage:
 *   import { TaskStorageSync } from './task-storage-sync.js';
 *   import { CacheWatchdog }   from './cache-watchdog.js';
 *
 *   const sync = new TaskStorageSync({ baseUrl: 'http://localhost:7700' });
 *
 *   const watchdog = new CacheWatchdog({
 *     apiUrl:    sync.tasksUrl,
 *     onRefresh: (data) => app.applyTasks(data),
 *     onOffline: ()     => ui.showBridgeStatus(false),
 *     onOnline:  ()     => ui.showBridgeStatus(true),
 *   });
 *
 *   sync.setWatchdog(watchdog);       // wire them together
 *   await watchdog.initialize();      // initial load + start watching
 */

export class TaskStorageSync {
  /**
   * @param {object} config
   * @param {string} config.baseUrl   e.g. 'http://localhost:7700'
   * @param {number} [config.timeout] Fetch timeout in ms (default 8000)
   */
  constructor(config = {}) {
    const { baseUrl = 'http://localhost:7700', timeout = 8000 } = config;

    this.baseUrl   = baseUrl.replace(/\/$/, '');
    this.tasksUrl  = `${this.baseUrl}/api/tasks`;
    this.statusUrl = `${this.baseUrl}/api/status`;
    this._timeout  = timeout;
    this._watchdog = null;
  }

  /**
   * Wire in the CacheWatchdog so saves automatically call acknowledge().
   */
  setWatchdog(watchdog) {
    this._watchdog = watchdog;
  }

  // ─── Bridge Health ────────────────────────────────────────────────────────

  /**
   * Returns true if the bridge server is reachable.
   * Safe to call before initialize() to show/hide the "run server.js" prompt.
   */
  async isOnline() {
    try {
      const res = await this._fetch(this.statusUrl, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ─── Load ─────────────────────────────────────────────────────────────────

  /**
   * Load all tasks from the bridge.
   * Returns { tasks, etag, fromCache } — fromCache=true means 304, data unchanged.
   */
  async loadAll(knownEtag = null) {
    const headers = {};
    if (knownEtag) headers['If-None-Match'] = knownEtag;

    const res = await this._fetch(this.tasksUrl, { headers });

    if (res.status === 304) {
      return { tasks: null, etag: knownEtag, fromCache: true };
    }

    if (!res.ok) throw new Error(`Load failed: ${res.status} ${res.statusText}`);

    const tasks = await res.json();
    const etag  = res.headers.get('ETag');
    return { tasks, etag, fromCache: false };
  }

  // ─── Save All ─────────────────────────────────────────────────────────────

  /**
   * Replace the entire task list on disk.
   * Signals the watchdog before + after so it doesn't trigger a phantom reload.
   *
   * @param {any[]} tasks — full tasks array
   * @returns {{ ok: boolean, count: number, etag: string }}
   */
  async saveAll(tasks) {
    this._watchdog?.beginSave();
    try {
      const res = await this._fetch(this.tasksUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(tasks),
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);

      const data = await res.json();
      const etag = res.headers.get('ETag');

      this._watchdog?.acknowledge(etag); // suppress phantom reload
      return { ...data, etag };

    } finally {
      this._watchdog?.endSave();
    }
  }

  // ─── Update One ───────────────────────────────────────────────────────────

  /**
   * Patch a single task by id.
   * Only sends changed fields — server merges with existing record.
   *
   * @param {string|number} id
   * @param {object} patch — partial task object (id is ignored if present)
   * @returns {{ task: object, etag: string }}
   */
  async updateOne(id, patch) {
    this._watchdog?.beginSave();
    try {
      const res = await this._fetch(`${this.tasksUrl}/${encodeURIComponent(id)}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(patch),
      });

      if (res.status === 404) throw new Error(`Task "${id}" not found`);
      if (!res.ok) throw new Error(`Update failed: ${res.status} ${res.statusText}`);

      const task = await res.json();
      const etag = res.headers.get('ETag');

      this._watchdog?.acknowledge(etag);
      return { task, etag };

    } finally {
      this._watchdog?.endSave();
    }
  }

  // ─── Delete One ───────────────────────────────────────────────────────────

  /**
   * Delete a single task by id.
   * @returns {{ etag: string }}
   */
  async deleteOne(id) {
    this._watchdog?.beginSave();
    try {
      const res = await this._fetch(`${this.tasksUrl}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.status === 404) throw new Error(`Task "${id}" not found`);
      if (res.status !== 204) throw new Error(`Delete failed: ${res.status} ${res.statusText}`);

      const etag = res.headers.get('ETag');
      this._watchdog?.acknowledge(etag);
      return { etag };

    } finally {
      this._watchdog?.endSave();
    }
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  /**
   * Fetch with timeout. Throws on network error or timeout.
   */
  _fetch(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this._timeout);

    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(timer));
  }
}
