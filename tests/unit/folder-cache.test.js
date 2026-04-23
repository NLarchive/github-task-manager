/**
 * Unit tests for the FolderCache IndexedDB-backed cache engine.
 *
 * The browser IndexedDB API is not available in Node.js, so tests
 * use an in-memory stub to exercise all public cache logic paths
 * including hash comparison, change detection, and per-module updates.
 */

const fs   = require('fs');
const path = require('path');

/** Load folder-cache.js into a Node test harness with a stubbed IndexedDB. */
function loadFolderCache() {
  const filePath = path.join(__dirname, '../../public/local-folder/js/folder-cache.js');
  const src = fs.readFileSync(filePath, 'utf8');

  // Minimal in-memory IndexedDB stub
  const store = new Map();
  const idbStub = {
    open(name, version) {
      const req = {
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        result: {
          transaction(storeName, mode) {
            const tx = {
              objectStore() {
                return {
                  get(key) {
                    const r = { onsuccess: null, onerror: null };
                    setTimeout(() => r.onsuccess && r.onsuccess({ target: { result: store.get(key) || null } }), 0);
                    return r;
                  },
                  put(record) {
                    store.set(record.id, JSON.parse(JSON.stringify(record)));
                    const r = { onsuccess: null, onerror: null };
                    setTimeout(() => r.onsuccess && r.onsuccess({ target: { result: record.id } }), 0);
                    return r;
                  },
                  delete(key) {
                    store.delete(key);
                    const r = { onsuccess: null, onerror: null };
                    setTimeout(() => r.onsuccess && r.onsuccess({ target: {} }), 0);
                    return r;
                  },
                  getAll() {
                    const r = { onsuccess: null, onerror: null };
                    setTimeout(() => r.onsuccess && r.onsuccess({ target: { result: Array.from(store.values()) } }), 0);
                    return r;
                  }
                };
              }
            };
            return tx;
          },
          objectStoreNames: { contains: () => true }
        }
      };
      setTimeout(() => req.onsuccess && req.onsuccess({ target: { result: req.result } }), 0);
      return req;
    }
  };

  const windowMock = { indexedDB: idbStub };
  new Function('window', `${src}`)(windowMock);
  return { cache: windowMock.FolderCache, store };
}

/** Validate FolderCache save, load, and hash-based change detection. */
describe('FolderCache', () => {
  it('hashContent returns a stable string for the same input', () => {
    const { cache } = loadFolderCache();
    const a = cache.hashContent({ tasks: [{ id: 1 }] });
    const b = cache.hashContent({ tasks: [{ id: 1 }] });
    expect(a).toBe(b);
    expect(typeof a).toBe('string');
    expect(a.length).toBeGreaterThan(0);
  });

  it('hashContent returns different values for different inputs', () => {
    const { cache } = loadFolderCache();
    const a = cache.hashContent({ tasks: [{ id: 1 }] });
    const b = cache.hashContent({ tasks: [{ id: 2 }] });
    expect(a).not.toBe(b);
  });

  it('saveProjectCache stores a record and loadProjectCache retrieves it', async () => {
    const { cache } = loadFolderCache();

    const record = {
      id: 'folder-test',
      label: 'Test Project',
      folderName: 'test-project',
      rootModuleRelative: 'src/node.tasks.json',
      discoveredFiles: ['src/node.tasks.json'],
      moduleDataByPath: { 'src/node.tasks.json': { tasks: [{ task_id: 1, task_name: 'T1' }] } },
      payload: { tasks: [{ task_id: 1, task_name: 'T1' }] }
    };
    const fileMap = { 'src/node.tasks.json': { tasks: [{ task_id: 1, task_name: 'T1' }] } };

    await cache.saveProjectCache(record, fileMap);
    const loaded = await cache.loadProjectCache('folder-test');

    expect(loaded).toBeTruthy();
    expect(loaded.id).toBe('folder-test');
    expect(loaded.label).toBe('Test Project');
    expect(loaded.fileHashes).toBeTruthy();
    expect(Object.keys(loaded.fileHashes)).toContain('src/node.tasks.json');
    expect(loaded.cachedAt).toBeTruthy();
    expect(loaded.version).toBe('1.0');
  });

  it('detectChanges returns added paths on first load (no prior cache)', async () => {
    const { cache } = loadFolderCache();
    const freshFileMap = {
      'src/node.tasks.json': { tasks: [] },
      'src/apps/crm/node.tasks.json': { tasks: [] }
    };

    const result = await cache.detectChanges('folder-new-project', freshFileMap);
    expect(result.added).toContain('src/node.tasks.json');
    expect(result.added).toContain('src/apps/crm/node.tasks.json');
    expect(result.changed).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
  });

  it('detectChanges identifies changed, added, and removed files after a rescan', async () => {
    const { cache } = loadFolderCache();

    const record = {
      id: 'folder-change-test',
      label: 'Change Test',
      folderName: 'change-test',
      rootModuleRelative: 'node.tasks.json',
      discoveredFiles: ['node.tasks.json', 'src/sub/node.tasks.json'],
      moduleDataByPath: {},
      payload: null
    };
    const firstFileMap = {
      'node.tasks.json': { tasks: [{ task_id: 1 }] },
      'src/sub/node.tasks.json': { tasks: [{ task_id: 2 }] }
    };

    await cache.saveProjectCache(record, firstFileMap);

    // Simulate a rescan: root file changed, sub removed, new file added
    const secondFileMap = {
      'node.tasks.json': { tasks: [{ task_id: 1 }, { task_id: 99 }] }, // changed
      'src/other/node.tasks.json': { tasks: [] }                        // added
      // src/sub/node.tasks.json is gone → removed
    };

    const result = await cache.detectChanges('folder-change-test', secondFileMap);
    expect(result.changed).toContain('node.tasks.json');
    expect(result.added).toContain('src/other/node.tasks.json');
    expect(result.removed).toContain('src/sub/node.tasks.json');
  });

  it('updateModuleInCache updates the stored record without touching other modules', async () => {
    const { cache } = loadFolderCache();

    const record = {
      id: 'folder-update-test',
      label: 'Update Test',
      folderName: 'update-test',
      rootModuleRelative: 'src/node.tasks.json',
      discoveredFiles: ['src/node.tasks.json', 'src/crm/node.tasks.json'],
      moduleDataByPath: {
        'src/node.tasks.json':     { tasks: [] },
        'src/crm/node.tasks.json': { tasks: [] }
      },
      payload: { tasks: [] }
    };
    await cache.saveProjectCache(record, record.moduleDataByPath);

    const editedData = { tasks: [{ task_id: 10, task_name: 'Edited CRM Task' }] };
    const ok = await cache.updateModuleInCache('folder-update-test', 'src/crm/node.tasks.json', editedData);
    expect(ok).toBe(true);

    const loaded = await cache.loadProjectCache('folder-update-test');
    expect(loaded.moduleDataByPath['src/crm/node.tasks.json'].tasks[0].task_name).toBe('Edited CRM Task');
    // Root payload should not be changed (different module)
    expect(loaded.payload.tasks).toHaveLength(0);
    // Hash should be updated
    expect(loaded.fileHashes['src/crm/node.tasks.json']).toBe(cache.hashContent(editedData));
  });

  it('updateModuleInCache refreshes root payload when the root module is updated', async () => {
    const { cache } = loadFolderCache();

    const record = {
      id: 'folder-root-update',
      label: 'Root Update',
      folderName: 'root-update',
      rootModuleRelative: 'node.tasks.json',
      discoveredFiles: ['node.tasks.json'],
      moduleDataByPath: { 'node.tasks.json': { tasks: [] } },
      payload: { tasks: [] }
    };
    await cache.saveProjectCache(record, record.moduleDataByPath);

    const updated = { tasks: [{ task_id: 5, task_name: 'Fresh Root Task' }] };
    await cache.updateModuleInCache('folder-root-update', 'node.tasks.json', updated);

    const loaded = await cache.loadProjectCache('folder-root-update');
    expect(loaded.payload.tasks[0].task_name).toBe('Fresh Root Task');
  });

  it('removeProjectCache deletes the record', async () => {
    const { cache } = loadFolderCache();

    await cache.saveProjectCache(
      { id: 'folder-remove-me', label: 'To Remove', folderName: 'x', rootModuleRelative: 'node.tasks.json', discoveredFiles: [], moduleDataByPath: {}, payload: null },
      {}
    );
    expect(await cache.loadProjectCache('folder-remove-me')).toBeTruthy();

    await cache.removeProjectCache('folder-remove-me');
    expect(await cache.loadProjectCache('folder-remove-me')).toBeNull();
  });

  it('listCachedProjects returns summaries for all stored records', async () => {
    const { cache } = loadFolderCache();

    for (const id of ['folder-alpha', 'folder-beta']) {
      await cache.saveProjectCache(
        { id, label: id, folderName: id, rootModuleRelative: 'node.tasks.json', discoveredFiles: ['node.tasks.json'], moduleDataByPath: {}, payload: null },
        { 'node.tasks.json': {} }
      );
    }

    const list = await cache.listCachedProjects();
    const ids = list.map(r => r.id);
    expect(ids).toContain('folder-alpha');
    expect(ids).toContain('folder-beta');
    list.forEach(r => {
      expect(r.fileCount).toBeGreaterThanOrEqual(0);
      expect(typeof r.cachedAt).toBe('string');
    });
  });
});
