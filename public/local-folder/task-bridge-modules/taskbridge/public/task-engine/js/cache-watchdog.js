/**
 * cache-watchdog.js — Client-side event-driven cache manager
 *
 * Detects file changes on the local bridge server using ETag comparisons.
 * No polling — checks are triggered only by real user interaction events.
 *
 * Usage:
 *   import { CacheWatchdog } from './cache-watchdog.js';
 *
 *   const watchdog = new CacheWatchdog({
 *     apiUrl:   'http://localhost:7700/api/tasks',
 *     onRefresh: async (freshData) => { renderTasks(freshData); },
 *     onOffline: ()  => { showBridgeBanner(false); },
 *     onOnline:  ()  => { showBridgeBanner(true);  },
 *   });
 *
 *   await watchdog.initialize();  // first load + register event triggers
 *
 *   // After your app saves, call this so the watchdog doesn't
 *   // mistake your own write for an external change:
 *   watchdog.acknowledge(newEtag);
 */

export class CacheWatchdog {
  /**
   * @param {object} config
   * @param {string}   config.apiUrl        Full URL to the bridge API
   * @param {function} config.onRefresh      async (data: any[]) => void — called when new data available
   * @param {function} [config.onOffline]    () => void — bridge unreachable
   * @param {function} [config.onOnline]     () => void — bridge came back online
   * @param {number}   [config.cooldownMs]   Minimum ms between checks (default 3000)
   * @param {number}   [config.graceMs]      Ms to ignore checks after own save (default 4000)
   */
  constructor(config = {}) {
    const {
      apiUrl,
      onRefresh,
      onOffline    = () => {},
      onOnline     = () => {},
      cooldownMs   = 3000,
      graceMs      = 4000,
    } = config;

    if (!apiUrl)    throw new Error('CacheWatchdog: apiUrl is required');
    if (!onRefresh) throw new Error('CacheWatchdog: onRefresh is required');

    this._apiUrl     = apiUrl;
    this._onRefresh  = onRefresh;
    this._onOffline  = onOffline;
    this._onOnline   = onOnline;
    this._cooldownMs = cooldownMs;
    this._graceMs    = graceMs;

    this._knownEtag    = null;   // last ETag we received
    this._isChecking   = false;  // prevent concurrent checks
    this._lastCheckAt  = 0;      // timestamp of last completed check
    this._gracePeriod  = 0;      // timestamp: ignore checks until this time
    this._isSaving     = false;  // true while app is mid-save
    this._bridgeOnline = null;   // null=unknown, true=online, false=offline

    this._listeners = [];        // cleanup refs
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Load initial data from the bridge and register all event triggers.
   * Call this once during app startup.
   */
  async initialize() {
    await this._fetchFull('init');
    this._registerTriggers();
  }

  /**
   * Call this immediately after your app finishes writing to the bridge.
   * Stores the ETag from the save response so the watchdog knows
   * the file changed because of US — and won't re-fetch unnecessarily.
   *
   * @param {string} etag — the ETag header value from the POST/PUT response
   */
  acknowledge(etag) {
    if (etag) {
      this._knownEtag   = etag;
      this._gracePeriod = Date.now() + this._graceMs; // suppress checks briefly
    }
  }

  /**
   * Mark that a save operation is starting.
   * Prevents the watchdog from triggering a reload while save is in flight.
   */
  beginSave() {
    this._isSaving = true;
  }

  /**
   * Mark that a save operation is done (call in finally block).
   */
  endSave() {
    this._isSaving = false;
  }

  /**
   * Force a full reload regardless of ETag.
   * Use for "Refresh" buttons or after coming back online.
   */
  async forceRefresh() {
    await this._fetchFull('forced');
  }

  /**
   * Remove all event listeners. Call when tearing down the app.
   */
  destroy() {
    this._listeners.forEach(([target, event, fn]) =>
      target.removeEventListener(event, fn)
    );
    this._listeners = [];
  }

  // ─── Private: Event Triggers ──────────────────────────────────────────────

  _registerTriggers() {
    const on = (target, event, fn) => {
      target.addEventListener(event, fn);
      this._listeners.push([target, event, fn]);
    };

    // Best trigger: user switched back to this tab
    on(document, 'visibilitychange', () => {
      if (document.visibilityState === 'visible') this._check('visibilitychange');
    });

    // User switched from another app back to the browser
    on(window, 'focus', () => this._check('focus'));

    // Browser came back online after a network drop
    on(window, 'online', () => {
      this._lastCheckAt = 0;  // force a check even if cooldown hasn't expired
      this._check('online');
    });

    // Route/hash navigation (SPA page changes)
    on(window, 'popstate', () => this._check('popstate'));

    // Fallback: first click after bridge was offline → attempt reconnect
    on(document, 'click', () => {
      if (!this._bridgeOnline) this._check('click-reconnect');
    });
  }

  // ─── Private: Check Logic ─────────────────────────────────────────────────

  async _check(trigger) {
    // Skip if: concurrent check running, save in flight, or within cooldown
    if (this._isChecking)                              return;
    if (this._isSaving)                                return;
    if (Date.now() < this._gracePeriod)                return;
    if (Date.now() - this._lastCheckAt < this._cooldownMs) return;
    if (!this._knownEtag)  {
      // Never loaded yet — do a full fetch
      await this._fetchFull(trigger);
      return;
    }

    this._isChecking = true;
    try {
      // HEAD request — headers only, zero body downloaded
      const res = await fetch(this._apiUrl, { method: 'HEAD' });

      if (!res.ok) throw new Error(`HEAD ${res.status}`);

      const serverEtag = res.headers.get('ETag');
      this._setBridgeOnline(true);

      if (serverEtag && serverEtag !== this._knownEtag) {
        console.debug(`[watchdog] Change detected via ${trigger}. Fetching…`);
        await this._fetchFull(trigger);
      }
    } catch (err) {
      console.warn('[watchdog] Bridge unreachable:', err.message);
      this._setBridgeOnline(false);
    } finally {
      this._isChecking  = false;
      this._lastCheckAt = Date.now();
    }
  }

  async _fetchFull(trigger) {
    this._isChecking = true;
    try {
      const headers = {};
      // Conditional GET — server returns 304 if nothing changed
      if (this._knownEtag) headers['If-None-Match'] = this._knownEtag;

      const res = await fetch(this._apiUrl, { headers });

      if (res.status === 304) {
        // Identical data — nothing to do
        this._setBridgeOnline(true);
        return;
      }

      if (!res.ok) throw new Error(`GET ${res.status}`);

      const etag = res.headers.get('ETag');
      const data = await res.json();

      this._knownEtag = etag;
      this._setBridgeOnline(true);

      await this._onRefresh(data);
      console.debug(`[watchdog] Refreshed (${trigger}), ETag: ${etag}`);

    } catch (err) {
      console.warn('[watchdog] Fetch failed:', err.message);
      this._setBridgeOnline(false);
    } finally {
      this._isChecking  = false;
      this._lastCheckAt = Date.now();
    }
  }

  _setBridgeOnline(online) {
    if (this._bridgeOnline === online) return; // no state change — skip callback
    this._bridgeOnline = online;
    if (online) this._onOnline();
    else        this._onOffline();
  }
}
