(function attachTaskStorageSync(globalScope) {
  class TaskStorageSync {
    constructor(config = {}) {
      const { baseUrl = '', projectId = 'github-task-manager', timeout = 8000 } = config;
      this.baseUrl = String(baseUrl || '').replace(/\/$/, '');
      this.projectId = String(projectId || 'github-task-manager');
      this._timeout = timeout;
      this._watchdog = null;
      this._rebuildUrls();
    }

    setWatchdog(watchdog) {
      this._watchdog = watchdog;
    }

    setProjectId(projectId) {
      this.projectId = String(projectId || 'github-task-manager');
      this._rebuildUrls();
      this._watchdog?.setApiUrl(this.tasksUrl);
    }

    async isOnline() {
      try {
        const res = await this._fetch(this.statusUrl, { method: 'GET' });
        return res.ok;
      } catch {
        return false;
      }
    }

    async loadPayload(knownEtag = null) {
      const headers = {};
      if (knownEtag) headers['If-None-Match'] = knownEtag;
      const res = await this._fetch(this.tasksUrl, { headers });

      if (res.status === 304) {
        return { payload: null, etag: knownEtag, fromCache: true };
      }

      if (!res.ok) throw new Error(`Load failed: ${res.status} ${res.statusText}`);

      const payload = await res.json();
      const etag = res.headers.get('ETag');
      return { payload, etag, fromCache: false };
    }

    async savePayload(payload) {
      this._watchdog?.beginSave();
      try {
        const res = await this._fetch(this.tasksUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          let message = `Save failed: ${res.status} ${res.statusText}`;
          try {
            const err = await res.json();
            if (err && err.error) message = `Save failed: ${err.error}`;
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        const etag = res.headers.get('ETag');
        this._watchdog?.acknowledge(etag);
        return { etag };
      } finally {
        this._watchdog?.endSave();
      }
    }

    _rebuildUrls() {
      const qs = `project=${encodeURIComponent(this.projectId)}`;
      this.tasksUrl = `${this.baseUrl}/api/tasks?${qs}`;
      this.statusUrl = `${this.baseUrl}/api/health`;
    }

    _fetch(url, options = {}) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this._timeout);

      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
    }
  }

  globalScope.TaskBridgeStorageSync = TaskStorageSync;
})(typeof window !== 'undefined' ? window : globalThis);
