/*
 * Basic sanity test for `public/graph-display/js/graph-data.js` to ensure
 * it parses without syntax errors in the Node test environment.
 */
const fs = require('fs');
const path = require('path');

describe('Graph Data Module', () => {
  it('parses and exposes key functions (no syntax errors)', () => {
    const filePath = path.join(__dirname, '../../public/graph-display/js/graph-data.js');
    let src = fs.readFileSync(filePath, 'utf8');

    // Remove ES module import lines and export keywords so we can evaluate in Node test runner
    src = src.replace(/^import\s.+$/mg, '');
    src = src.replace(/^export\s+/mg, '');

    // Evaluate in a safe function scope; provide minimal globals used by the module
    const fn = new Function('window', 'fetch', 'console', src + '\nreturn { initTemplates: typeof initTemplates, getAvailableTemplates: typeof getAvailableTemplates, loadTemplate: typeof loadTemplate };');
    const res = fn({}, () => Promise.resolve({ ok: false }), console);

    expect(res.initTemplates).toBe('function');
    expect(res.getAvailableTemplates).toBe('function');
    expect(res.loadTemplate).toBe('function');
  });

  it('resolves registry absolute paths under /public/graph-display/ correctly', async () => {
    const filePath = path.join(__dirname, '../../public/graph-display/js/graph-data.js');
    let src = fs.readFileSync(filePath, 'utf8');

    // Remove ES module import lines and export keywords so we can evaluate in Node test runner
    src = src.replace(/^import\s.+$/mg, '');
    src = src.replace(/^export\s+/mg, '');

    const requested = [];
    const mockFetch = async (url) => {
      requested.push(String(url));

      // Registry request
      if (String(url).endsWith('/public/graph-display/templates/registry.json')) {
        return {
          ok: true,
          json: async () => ([
            { id: 'first-graph', name: 'First Graph', type: 'career', path: 'first-graph/data.json' },
            { id: 'github-task-manager-tasks', name: 'GTM (TaskDB)', type: 'task-management', path: '/tasksDB/github-task-manager/tasks.json' },
            { id: 'ai-career-roadmap-tasks', name: 'AI Roadmap (TaskDB)', type: 'task-management', path: '/tasksDB/ai-career-roadmap/tasks.json' }
          ])
        };
      }

      // Career template request (local)
      if (String(url).endsWith('/public/graph-display/templates/first-graph/data.json')) {
        return { ok: true, json: async () => ({ rawNodes: [], rawRelationships: [], details: {}, meta: {} }) };
      }

      // TaskDB templates (absolute-like)
      if (String(url).endsWith('/public/tasksDB/github-task-manager/tasks.json')) {
        return { ok: true, json: async () => ({ project: { name: 'GTM' }, tasks: [] }) };
      }
      if (String(url).endsWith('/public/tasksDB/ai-career-roadmap/tasks.json')) {
        return { ok: true, json: async () => ({ project: { name: 'AI' }, tasks: [] }) };
      }

      return { ok: false, status: 404, json: async () => ({}) };
    };

    const windowMock = {
      location: {
        pathname: '/public/graph-display/index.html',
        hostname: '127.0.0.1',
        search: ''
      }
    };

    const fn = new Function('window', 'fetch', 'console', src + '\nreturn { initTemplates };');
    const res = fn(windowMock, mockFetch, console);
    await res.initTemplates();

    // Ensure we never build '/publictasksDB' (missing slash) and we do fetch the correct URLs.
    expect(requested.some(u => u.includes('/publictasksDB/'))).toBe(false);
    expect(requested.some(u => u.endsWith('/public/tasksDB/github-task-manager/tasks.json'))).toBe(true);
    expect(requested.some(u => u.endsWith('/public/tasksDB/ai-career-roadmap/tasks.json'))).toBe(true);
  });
});
