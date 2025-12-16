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
});
