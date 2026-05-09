(function attachTaskBridgeIntegration(globalScope) {
  function isLocalRuntime() {
    try {
      const host = String(globalScope.location && globalScope.location.hostname || '').toLowerCase();
      return host === 'localhost' || host === '127.0.0.1';
    } catch {
      return false;
    }
  }

  function resolveBaseUrl() {
    const cfg = globalScope.TEMPLATE_CONFIG && globalScope.TEMPLATE_CONFIG.GITHUB
      ? globalScope.TEMPLATE_CONFIG.GITHUB
      : null;
    const fromCfg = cfg && cfg.LOCAL_BRIDGE_URL ? String(cfg.LOCAL_BRIDGE_URL).trim() : '';
    if (fromCfg) return fromCfg.replace(/\/$/, '');

    try {
      if (!globalScope.location) return '';
      const localPort = String(globalScope.location.port || '');
      if (localPort === '3000' || localPort === '3100') return globalScope.location.origin;
      return 'http://localhost:3000';
    } catch {
      return 'http://localhost:3000';
    }
  }

  function resolveActiveProjectId() {
    const cfg = globalScope.TEMPLATE_CONFIG && globalScope.TEMPLATE_CONFIG.GITHUB
      ? globalScope.TEMPLATE_CONFIG.GITHUB
      : null;
    const projectId = (cfg && (cfg.ACTIVE_PROJECT_ID || cfg.DEFAULT_PROJECT_ID)) || 'github-task-manager';
    return String(projectId).replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
  }

  function dispatchBridgeStatus(online) {
    globalScope.dispatchEvent(new CustomEvent('bridge-status-changed', { detail: { online: Boolean(online) } }));
  }

  function createForDatabase(db) {
    if (!isLocalRuntime()) return null;
    if (!globalScope.TaskBridgeStorageSync || !globalScope.TaskBridgeCacheWatchdog) return null;

    const sync = new globalScope.TaskBridgeStorageSync({
      baseUrl: resolveBaseUrl(),
      projectId: resolveActiveProjectId(),
      timeout: 8000
    });

    const watchdog = new globalScope.TaskBridgeCacheWatchdog({
      apiUrl: sync.tasksUrl,
      cooldownMs: 3000,
      graceMs: 4000,
      onRefresh: async (freshPayload) => {
        const tasks = db.applyLoadedPayload(freshPayload);
        db.tasks = Array.isArray(tasks) ? tasks : [];
        db._lastSyncedTasksSnapshot = db.cloneTasksSnapshot(db.tasks);
        globalScope.dispatchEvent(new CustomEvent('tasks-externally-updated', {
          detail: { taskCount: db.tasks.length }
        }));
      },
      onOffline: () => dispatchBridgeStatus(false),
      onOnline: () => dispatchBridgeStatus(true)
    });

    sync.setWatchdog(watchdog);

    let initialized = false;
    let knownEtag = null;

    async function ensureInitialized() {
      if (initialized) return;
      const online = await sync.isOnline();
      dispatchBridgeStatus(online);
      if (!online) return;
      await watchdog.initialize();
      initialized = true;
    }

    async function loadFromBridge(projectId) {
      sync.setProjectId(projectId || resolveActiveProjectId());
      await ensureInitialized();

      const online = await sync.isOnline();
      dispatchBridgeStatus(online);
      if (!online) return { handled: false };

      const result = await sync.loadPayload(knownEtag);
      if (result.etag) knownEtag = result.etag;
      if (result.fromCache) return { handled: true, payload: null, fromCache: true };
      return { handled: true, payload: result.payload, fromCache: false };
    }

    async function saveToBridge(projectId, payload) {
      sync.setProjectId(projectId || resolveActiveProjectId());
      const online = await sync.isOnline();
      dispatchBridgeStatus(online);
      if (!online) return { handled: false };

      const result = await sync.savePayload(payload);
      if (result.etag) knownEtag = result.etag;
      return { handled: true, etag: result.etag };
    }

    return {
      loadFromBridge,
      saveToBridge,
      resolveProjectId: resolveActiveProjectId
    };
  }

  globalScope.TaskBridgeProjectIntegration = {
    createForDatabase,
    resolveBaseUrl
  };
})(typeof window !== 'undefined' ? window : globalThis);
