const path = require('path');

require(path.join(__dirname, '../../public/task-engine/js/task-schema-clipboard.js'));

describe('TaskSchemaClipboard', () => {
  it('builds a valid node.tasks.json template payload', () => {
    expect(global.TaskSchemaClipboard).toBeTruthy();
    const payload = global.TaskSchemaClipboard.buildClipboardPayload({ scope: 'test', activeProjectId: 'test-project' });
    expect(payload).toBeTruthy();
    expect(payload.template).toBeTruthy();
    expect(payload.template.$schema).toContain('graph-template.schema.json');
    expect(Array.isArray(payload.template.tasks)).toBeTruthy();
    expect(payload.template.tasks.length).toBeGreaterThan(0);
    expect(typeof payload.template.project).toBe('object');
    expect(typeof payload.template.project.name).toBe('string');
  });
});
