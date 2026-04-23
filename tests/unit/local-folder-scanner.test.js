/**
 * Unit coverage for browser-side local-folder TaskDB discovery and registration.
 */

const fs = require('fs');
const path = require('path');

/** Load the browser folder-project service into a Node test harness with mocked storage. */
function loadFolderProjectService(initialStorage = {}) {
  const filePath = path.join(__dirname, '../../public/local-folder/js/local-folder-scanner.js');
  const src = fs.readFileSync(filePath, 'utf8');
  const storageState = { ...initialStorage };

  const windowMock = {
    localStorage: {
      getItem(key) {
        return Object.prototype.hasOwnProperty.call(storageState, key) ? storageState[key] : null;
      },
      setItem(key, value) {
        storageState[key] = String(value);
      },
      removeItem(key) {
        delete storageState[key];
      }
    },
    document: {
      createElement() {
        return {
          style: {},
          setAttribute() {},
          addEventListener() {},
          removeEventListener() {},
          click() {},
          files: []
        };
      },
      body: {
        appendChild() {},
        removeChild() {}
      }
    }
  };

  const service = new Function('window', 'globalThis', 'console', `${src}\nreturn window.FolderProjectService;`)(windowMock, windowMock, console);
  return { service, storageState };
}

/** Validate local folder TaskDB discovery, registration, and lookup behavior. */
describe('Folder Project Service', () => {
  it('builds a root payload and module list from browser-selected task files', () => {
    const { service } = loadFolderProjectService();

    const record = service.__test__.buildProjectRecordFromFileMap({
      folderName: 'web-e2e-bussines',
      fileMap: {
        'node.tasks.json': {
          project: { name: 'Web E2E Business' },
          navigation: { rootModule: 'src/node.tasks.json' }
        },
        'src/node.tasks.json': {
          template_type: 'project_task_template',
          project: { name: 'Web E2E Business' },
          tasks: [
            { task_name: 'INFRA-001: Super-repo setup', status: 'Done', priority: 'High' }
          ]
        },
        'src/SHARED/shared-ui/node.tasks.json': {
          module: { name: 'shared-ui', label: 'Shared UI' },
          tasks: [
            {
              task_name: 'SHARED-001: Design system scaffold',
              status: 'In Progress',
              priority: 'High',
              dependencies: [{ predecessor_task_name: 'INFRA-001: Super-repo setup', type: 'FS' }]
            }
          ]
        }
      }
    });

    expect(record.id).toBe('folder-web-e2e-bussines');
    expect(record.templateId).toBe('folder-web-e2e-bussines-tasks');
    expect(record.rootModuleRelative).toBe('src/node.tasks.json');
    expect(record.payload.navigation.rootModule).toBe('src/node.tasks.json');
    expect(record.payload.navigation.modules).toHaveLength(1);
    expect(record.payload.navigation.modules[0].path).toBe('src/SHARED/shared-ui/node.tasks.json');
  });

  it('stores and retrieves folder projects by project id or template id', () => {
    const { service } = loadFolderProjectService();

    const record = service.registerProjectRecord({
      id: 'folder-acme-os',
      templateId: 'folder-acme-os-tasks',
      label: 'Acme OS',
      rootModuleRelative: 'src/node.tasks.json',
      payload: {
        project: { name: 'Acme OS' },
        tasks: [{ task_name: 'Task 1', priority: 'High', status: 'Done' }],
        navigation: { rootModule: 'src/node.tasks.json', modules: [] }
      },
      moduleDataByPath: {}
    });

    expect(record).toBeTruthy();
    expect(service.getProjectPayload('folder-acme-os').project.name).toBe('Acme OS');
    expect(service.getProjectPayload('folder-acme-os-tasks').project.name).toBe('Acme OS');
    expect(service.isFolderProject('folder-acme-os-tasks')).toBe(true);
    expect(service.listProjects()).toHaveLength(1);
  });
});

/** Validate local-folder write-back: updateModuleData persists task edits into the in-memory record. */
describe('Folder Project Service — write-back', () => {
  it('updateModuleData updates the moduleDataByPath and refreshes root payload for root module', () => {
    const { service } = loadFolderProjectService();

    service.registerProjectRecord({
      id: 'folder-write-test',
      templateId: 'folder-write-test-tasks',
      label: 'Write Test',
      rootModuleRelative: 'src/node.tasks.json',
      payload: { project: { name: 'Write Test' }, tasks: [], navigation: { rootModule: 'src/node.tasks.json', modules: [] } },
      moduleDataByPath: { 'src/node.tasks.json': { tasks: [] } }
    });

    const updated = { project: { name: 'Write Test' }, tasks: [{ task_id: 1, task_name: 'New Task', status: 'Not Started', priority: 'High' }], navigation: { rootModule: 'src/node.tasks.json', modules: [] } };
    const ok = service.updateModuleData('folder-write-test', 'src/node.tasks.json', updated);

    expect(ok).toBe(true);
    const record = service.getProjectRecord('folder-write-test');
    expect(record.moduleDataByPath['src/node.tasks.json'].tasks).toHaveLength(1);
    expect(record.moduleDataByPath['src/node.tasks.json'].tasks[0].task_name).toBe('New Task');
    // Root payload should also be refreshed
    expect(record.payload.tasks).toHaveLength(1);
  });

  it('updateModuleData updates a sub-module without touching root payload tasks', () => {
    const { service } = loadFolderProjectService();

    service.registerProjectRecord({
      id: 'folder-module-test',
      templateId: 'folder-module-test-tasks',
      label: 'Module Test',
      rootModuleRelative: 'src/node.tasks.json',
      payload: { project: { name: 'Module Test' }, tasks: [{ task_id: 1, task_name: 'Root Task', status: 'Done', priority: 'Low' }], navigation: { rootModule: 'src/node.tasks.json', modules: [] } },
      moduleDataByPath: {
        'src/node.tasks.json': { tasks: [{ task_id: 1, task_name: 'Root Task', status: 'Done', priority: 'Low' }] },
        'src/apps/PRIVATE/crm/node.tasks.json': { tasks: [] }
      }
    });

    const updated = { tasks: [{ task_id: 10, task_name: 'CRM Task', status: 'In Progress', priority: 'Medium' }] };
    service.updateModuleData('folder-module-test', 'src/apps/PRIVATE/crm/node.tasks.json', updated);

    const record = service.getProjectRecord('folder-module-test');
    expect(record.moduleDataByPath['src/apps/PRIVATE/crm/node.tasks.json'].tasks[0].task_name).toBe('CRM Task');
    // Root payload should be unchanged
    expect(record.payload.tasks[0].task_name).toBe('Root Task');
  });

  it('writeModuleToDisk falls back to localStorage-only when FolderCache is unavailable', async () => {
    const { service } = loadFolderProjectService();

    service.registerProjectRecord({
      id: 'folder-disk-test',
      templateId: 'folder-disk-test-tasks',
      label: 'Disk Test',
      rootModuleRelative: 'node.tasks.json',
      payload: { tasks: [] },
      moduleDataByPath: { 'node.tasks.json': { tasks: [] } }
    });

    const result = await service.writeModuleToDisk('folder-disk-test', 'node.tasks.json', { tasks: [{ task_id: 1, task_name: 'Saved', status: 'Done', priority: 'High' }] });
    // No FolderCache or FS handle available in test, so it falls back gracefully
    expect(result.success).toBe(true);
    expect(['localStorage-only', 'fs-access'].includes(result.source)).toBe(true);
  });
});
