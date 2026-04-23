/**
 * Unit coverage for browser-side local-folder TaskDB discovery and registration.
 */

const fs = require('fs');
const path = require('path');

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

describe('Folder Project Service', () => {
  it('builds a root payload and module list from browser-selected task files', () => {
    const { service } = loadFolderProjectService();

    const record = service.__test__.buildProjectRecordFromFileMap({
      folderName: 'web-e2e-bussines',
      fileMap: {
        'tasks.json': {
          project: { name: 'Web E2E Business' },
          navigation: { rootModule: 'src/tasks.json' }
        },
        'src/tasks.json': {
          template_type: 'project_task_template',
          project: { name: 'Web E2E Business' },
          tasks: [
            { task_name: 'INFRA-001: Super-repo setup', status: 'Done', priority: 'High' }
          ]
        },
        'src/SHARED/shared-ui/tasks.json': {
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
    expect(record.rootModuleRelative).toBe('src/tasks.json');
    expect(record.payload.navigation.rootModule).toBe('src/tasks.json');
    expect(record.payload.navigation.modules).toHaveLength(1);
    expect(record.payload.navigation.modules[0].path).toBe('src/SHARED/shared-ui/tasks.json');
  });

  it('stores and retrieves folder projects by project id or template id', () => {
    const { service } = loadFolderProjectService();

    const record = service.registerProjectRecord({
      id: 'folder-acme-os',
      templateId: 'folder-acme-os-tasks',
      label: 'Acme OS',
      rootModuleRelative: 'src/tasks.json',
      payload: {
        project: { name: 'Acme OS' },
        tasks: [{ task_name: 'Task 1', priority: 'High', status: 'Done' }],
        navigation: { rootModule: 'src/tasks.json', modules: [] }
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