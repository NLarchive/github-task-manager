/**
 * Unit tests for browser-local Graph Composer template storage.
 */

const fs = require('fs');
const path = require('path');

function loadGraphTemplateStorageModule() {
  const filePath = path.join(__dirname, '../../public/graph-display/js/shared/graph-template-storage.js');
  let src = fs.readFileSync(filePath, 'utf8');
  src = src.replace(/^export\s+/mg, '');

  const fn = new Function(
    'window',
    'console',
    `${src}\nreturn { STORED_GRAPH_TEMPLATES_KEY, buildStoredGraphTemplateId, listStoredGraphTemplates, getStoredGraphTemplate, saveStoredGraphTemplate, deleteStoredGraphTemplate };`
  );

  return fn(undefined, console);
}

function createMockStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

describe('Graph Template Storage', () => {
  it('saves and reloads normalized templates', () => {
    const mod = loadGraphTemplateStorageModule();
    const storage = createMockStorage();

    const saved = mod.saveStoredGraphTemplate({
      name: 'My Composer Graph',
      nodes: [{ id: 'n1', label: 'Node 1' }],
      links: [],
      details: { n1: { title: 'Node 1' } },
      configOverrides: { colorMode: 'metric' }
    }, storage);

    expect(saved.id).toBe('my-composer-graph');
    expect(mod.listStoredGraphTemplates(storage)).toHaveLength(1);
    expect(mod.getStoredGraphTemplate('my-composer-graph', storage).name).toBe('My Composer Graph');
  });

  it('builds unique ids when names collide', () => {
    const mod = loadGraphTemplateStorageModule();
    const templateId = mod.buildStoredGraphTemplateId('My Graph', ['my-graph', 'my-graph-2']);
    expect(templateId).toBe('my-graph-3');
  });

  it('deletes a stored template', () => {
    const mod = loadGraphTemplateStorageModule();
    const storage = createMockStorage();

    mod.saveStoredGraphTemplate({ name: 'Disposable', nodes: [], links: [], details: {} }, storage);
    const removed = mod.deleteStoredGraphTemplate('disposable', storage);

    expect(removed).toBe(true);
    expect(mod.listStoredGraphTemplates(storage)).toHaveLength(0);
  });
});
