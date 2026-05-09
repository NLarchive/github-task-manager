(function attachCacheWatchdog(globalScope) {
  class CacheWatchdog {
    constructor(config = {}) {
      const {
        apiUrl,
        onRefresh,
        onOffline = () => {},
        onOnline = () => {},
        cooldownMs = 3000,
        graceMs = 4000
      } = config;

      if (!apiUrl) throw new Error('CacheWatchdog: apiUrl is required');
      if (!onRefresh) throw new Error('CacheWatchdog: onRefresh is required');

      this._apiUrl = apiUrl;
      this._onRefresh = onRefresh;
      this._onOffline = onOffline;
      this._onOnline = onOnline;
      this._cooldownMs = cooldownMs;
      this._graceMs = graceMs;

      this._knownEtag = null;
      this._isChecking = false;
      this._lastCheckAt = 0;
      this._gracePeriod = 0;
      this._isSaving = false;
      this._bridgeOnline = null;
      this._listeners = [];
    }

    setApiUrl(apiUrl) {
      if (!apiUrl) return;
      this._apiUrl = apiUrl;
      this._lastCheckAt = 0;
    }

    async initialize() {
      await this._fetchFull('init');
      this._registerTriggers();
    }

    acknowledge(etag) {
      if (!etag) return;
      this._knownEtag = etag;
      this._gracePeriod = Date.now() + this._graceMs;
    }

    beginSave() {
      this._isSaving = true;
    }

    endSave() {
      this._isSaving = false;
    }

    async forceRefresh() {
      await this._fetchFull('forced');
    }

    destroy() {
      this._listeners.forEach(([target, event, fn]) => target.removeEventListener(event, fn));
      this._listeners = [];
    }

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

    async _check(trigger) {
      if (this._isChecking) return;
      if (this._isSaving) return;
      if (Date.now() < this._gracePeriod) return;
      if (Date.now() - this._lastCheckAt < this._cooldownMs) return;
      if (!this._knownEtag) {
        await this._fetchFull(trigger);
        return;
      }

      this._isChecking = true;
      try {
        const res = await fetch(this._apiUrl, { method: 'HEAD' });
        if (!res.ok) throw new Error(`HEAD ${res.status}`);

        const serverEtag = res.headers.get('ETag');
        this._setBridgeOnline(true);

        if (serverEtag && serverEtag !== this._knownEtag) {
          await this._fetchFull(trigger);
        }
      } catch (err) {
        this._setBridgeOnline(false);
        console.warn('[watchdog] Bridge unreachable:', err.message);
      } finally {
        this._isChecking = false;
        this._lastCheckAt = Date.now();
      }
    }

    async _fetchFull(trigger) {
      this._isChecking = true;
      try {
        const headers = {};
        if (this._knownEtag) headers['If-None-Match'] = this._knownEtag;

        const res = await fetch(this._apiUrl, { headers });
        if (res.status === 304) {
          this._setBridgeOnline(true);
          return;
        }
        if (!res.ok) throw new Error(`GET ${res.status}`);

        const etag = res.headers.get('ETag');
        const data = await res.json();
        this._knownEtag = etag;
        this._setBridgeOnline(true);
        await this._onRefresh(data, { trigger, etag });
      } catch (err) {
        this._setBridgeOnline(false);
        console.warn('[watchdog] Fetch failed:', err.message);
      } finally {
        this._isChecking = false;
        this._lastCheckAt = Date.now();
      }
    }

    _setBridgeOnline(online) {
      if (this._bridgeOnline === online) return;
      this._bridgeOnline = online;
      if (online) this._onOnline();
      else this._onOffline();
    }
  }

  globalScope.TaskBridgeCacheWatchdog = CacheWatchdog;
})(typeof window !== 'undefined' ? window : globalThis);
