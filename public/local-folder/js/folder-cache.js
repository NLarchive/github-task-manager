/**
 * FolderCache — IndexedDB-backed cache for local-folder TaskDB projects.
 *
 * Stores project payloads and per-file content hashes so the app can:
 *   1. Load instantly from cache on subsequent visits.
 *   2. Detect which files changed since the last scan (hash comparison).
 *   3. Write UI edits back to cached per-file data for local writeback.
 *
 * The cache itself is never the source of truth — it mirrors the real
 * file system and is always invalidated when a hash mismatch is found.
 *
 * DB schema (single object store "projects"):
 *   key   → projectId (string)
 *   value → CachedProjectRecord {
 *     id, label, folderName,
 *     rootModuleRelative,
 *     discoveredFiles,     // string[]
 *     fileHashes,          // Record<relativePath, hash>
 *     moduleDataByPath,    // Record<relativePath, JSON>
 *     payload,             // full root-module payload
 *     directoryHandle,     // FileSystemDirectoryHandle | null  (if available)
 *     cachedAt,            // ISO timestamp
 *     version              // schema version for forward-compat
 *   }
 */
(function (globalScope) {
    const DB_NAME    = 'taskManagerFolderCache';
    const STORE_NAME = 'projects';
    const DB_VERSION = 1;
    const SCHEMA_VER = '1.0';

    // ── Hashing ──────────────────────────────────────────────────────────────

    /** Return a deterministic hash string for a JSON-serialisable value. */
    function hashContent(value) {
        const str = (typeof value === 'string') ? value : JSON.stringify(value);
        let h = 5381;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) + h) ^ str.charCodeAt(i);
            h = h >>> 0; // keep unsigned 32-bit
        }
        return h.toString(36);
    }

    /** Build a hash map for all entries in a fileMap. */
    function buildFileHashes(fileMap) {
        const hashes = {};
        Object.keys(fileMap || {}).forEach((relativePath) => {
            hashes[relativePath] = hashContent(fileMap[relativePath]);
        });
        return hashes;
    }

    // ── IndexedDB helpers ────────────────────────────────────────────────────

    function openDB() {
        return new Promise((resolve, reject) => {
            if (typeof globalScope.indexedDB === 'undefined') {
                reject(new Error('IndexedDB not available'));
                return;
            }
            const req = globalScope.indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            req.onsuccess = (event) => resolve(event.target.result);
            req.onerror   = (event) => reject(event.target.error);
        });
    }

    async function dbGet(projectId) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx   = db.transaction(STORE_NAME, 'readonly');
            const req  = tx.objectStore(STORE_NAME).get(projectId);
            req.onsuccess = (e) => resolve(e.target.result || null);
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    async function dbPut(record) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE_NAME, 'readwrite');
            const req = tx.objectStore(STORE_NAME).put(record);
            req.onsuccess = () => resolve(record);
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    async function dbDelete(projectId) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORE_NAME, 'readwrite');
            const req = tx.objectStore(STORE_NAME).delete(projectId);
            req.onsuccess = () => resolve(true);
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    async function dbList() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx   = db.transaction(STORE_NAME, 'readonly');
            const req  = tx.objectStore(STORE_NAME).getAll();
            req.onsuccess = (e) => resolve(e.target.result || []);
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    // ── Public API ───────────────────────────────────────────────────────────

    /**
     * Save (or overwrite) a complete project record into the cache.
     * Called after a successful folder scan.
     *
     * @param {object} projectRecord - The FolderProjectService project record.
     * @param {object} fileMap       - Raw relativePath → JSON data map from the scan.
     * @param {FileSystemDirectoryHandle|null} directoryHandle - FS Access API handle, if available.
     * @returns {Promise<object>} The cached record.
     */
    async function saveProjectCache(projectRecord, fileMap, directoryHandle = null) {
        const hashes = buildFileHashes(fileMap || {});
        const cached = {
            id:                 projectRecord.id,
            label:              projectRecord.label || '',
            folderName:         projectRecord.folderName || '',
            rootModuleRelative: projectRecord.rootModuleRelative || '',
            discoveredFiles:    projectRecord.discoveredFiles || [],
            fileHashes:         hashes,
            moduleDataByPath:   projectRecord.moduleDataByPath || {},
            payload:            projectRecord.payload || null,
            directoryHandle:    directoryHandle || null,
            cachedAt:           new Date().toISOString(),
            version:            SCHEMA_VER
        };
        await dbPut(cached);
        return cached;
    }

    /**
     * Load a cached project record.
     * Returns null if the project is not cached.
     *
     * @param {string} projectId
     * @returns {Promise<object|null>}
     */
    async function loadProjectCache(projectId) {
        try {
            return await dbGet(String(projectId || '').trim());
        } catch {
            return null;
        }
    }

    /**
     * Compare a fresh fileMap against cached hashes and return only the changed files.
     *
     * @param {string} projectId
     * @param {object} freshFileMap - relativePath → JSON data
     * @returns {Promise<{changed: string[], added: string[], removed: string[]}>}
     */
    async function detectChanges(projectId, freshFileMap) {
        const cached = await loadProjectCache(projectId);
        if (!cached || !cached.fileHashes) {
            const added = Object.keys(freshFileMap || {});
            return { changed: [], added, removed: [] };
        }

        const freshHashes = buildFileHashes(freshFileMap);
        const cachedKeys  = new Set(Object.keys(cached.fileHashes));
        const freshKeys   = new Set(Object.keys(freshHashes));

        const changed = [];
        const added   = [];
        const removed = [];

        for (const key of freshKeys) {
            if (!cachedKeys.has(key)) {
                added.push(key);
            } else if (freshHashes[key] !== cached.fileHashes[key]) {
                changed.push(key);
            }
        }
        for (const key of cachedKeys) {
            if (!freshKeys.has(key)) removed.push(key);
        }

        return { changed, added, removed };
    }

    /**
     * Update a single module's data in the cache and refresh its hash.
     * Called when the user edits a module in the UI.
     *
     * @param {string} projectId
     * @param {string} relativePath   - e.g. "src/node.tasks.json"
     * @param {object} updatedData    - new JSON content to store
     * @returns {Promise<boolean>} true on success
     */
    async function updateModuleInCache(projectId, relativePath, updatedData) {
        try {
            const cached = await dbGet(String(projectId || '').trim());
            if (!cached) return false;

            cached.moduleDataByPath = cached.moduleDataByPath || {};
            cached.fileHashes       = cached.fileHashes || {};

            cached.moduleDataByPath[relativePath] = updatedData;
            cached.fileHashes[relativePath]       = hashContent(updatedData);

            // If it's the root module, also refresh the top-level payload
            if (relativePath === cached.rootModuleRelative) {
                cached.payload = { ...updatedData };
            }

            cached.cachedAt = new Date().toISOString();
            await dbPut(cached);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Remove a project from the cache.
     * @param {string} projectId
     * @returns {Promise<boolean>}
     */
    async function removeProjectCache(projectId) {
        try {
            await dbDelete(String(projectId || '').trim());
            return true;
        } catch {
            return false;
        }
    }

    /**
     * List all cached project summaries (id, label, cachedAt, fileCount).
     * @returns {Promise<object[]>}
     */
    async function listCachedProjects() {
        try {
            const records = await dbList();
            return records.map((r) => ({
                id:          r.id,
                label:       r.label || r.id,
                folderName:  r.folderName || '',
                fileCount:   (r.discoveredFiles || []).length,
                cachedAt:    r.cachedAt || '',
                hasHandle:   !!(r.directoryHandle),
                version:     r.version || ''
            }));
        } catch {
            return [];
        }
    }

    /**
     * Store a FileSystemDirectoryHandle for a previously cached project.
     * Useful for re-attaching a write handle obtained after a user gesture.
     *
     * @param {string} projectId
     * @param {FileSystemDirectoryHandle} handle
     * @returns {Promise<boolean>}
     */
    async function attachDirectoryHandle(projectId, handle) {
        try {
            const cached = await dbGet(String(projectId || '').trim());
            if (!cached) return false;
            cached.directoryHandle = handle;
            cached.cachedAt = new Date().toISOString();
            await dbPut(cached);
            return true;
        } catch {
            return false;
        }
    }

    // Expose
    globalScope.FolderCache = {
        saveProjectCache,
        loadProjectCache,
        detectChanges,
        updateModuleInCache,
        removeProjectCache,
        listCachedProjects,
        attachDirectoryHandle,
        /** Utility: compute a hash for any value (for external comparison). */
        hashContent
    };

}(typeof window !== 'undefined' ? window : this));
