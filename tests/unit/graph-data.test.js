/**
 * Basic sanity test for `public/graph-display/js/graph-data.js` to ensure
 * it parses without syntax errors in the Node test environment.
 */
const fs = require('fs');
const path = require('path');

function loadGraphDataModule(windowMock = {
  location: {
    pathname: '/public/graph-display/index.html',
    hostname: '127.0.0.1',
    search: ''
  }
}, fetchMock = async () => ({ ok: false, status: 404, json: async () => ({}) })) {
  const filePath = path.join(__dirname, '../../public/graph-display/js/graph-data.js');
  let src = fs.readFileSync(filePath, 'utf8');
  src = src.replace(/^import\s.+$/mg, '');
  src = src.replace(/^export\s+/mg, '');
  src = `const CAREER_TEMPLATE_ID = 'career';\nconst TASK_MGMT_TEMPLATE_ID = 'task-management';\n${src}`;

  const fn = new Function(
    'window',
    'fetch',
    'console',
    src + '\nreturn { initTemplates: typeof initTemplates, getAvailableTemplates: typeof getAvailableTemplates, loadTemplate: typeof loadTemplate, buildProjectTaskTemplatePublic: typeof buildProjectTaskTemplatePublic === "function" ? buildProjectTaskTemplatePublic : null, buildInlineTaskSubgraphTemplatePublic: typeof buildInlineTaskSubgraphTemplatePublic === "function" ? buildInlineTaskSubgraphTemplatePublic : null };'
  );

  return fn(windowMock, fetchMock, console);
}

describe('Graph Data Module', () => {
  it('parses and exposes key functions (no syntax errors)', () => {
    const filePath = path.join(__dirname, '../../public/graph-display/js/graph-data.js');
    let src = fs.readFileSync(filePath, 'utf8');

    // Remove ES module import lines and export keywords so we can evaluate in Node test runner
    src = src.replace(/^import\s.+$/mg, '');
    src = src.replace(/^export\s+/mg, '');
    src = `const CAREER_TEMPLATE_ID = 'career';\nconst TASK_MGMT_TEMPLATE_ID = 'task-management';\n${src}`;

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
    src = `const CAREER_TEMPLATE_ID = 'career';\nconst TASK_MGMT_TEMPLATE_ID = 'task-management';\n${src}`;

    const requested = [];
    const mockFetch = async (url) => {
      requested.push(String(url));

      // Registry request
      if (String(url).endsWith('/public/tasksDB/registry.json')) {
        return {
          ok: true,
          json: async () => ([
            { id: 'first-graph', name: 'First Graph', type: 'task-management', path: '/tasksDB/external/first-graph/tasks.json' },
            { id: 'task-management', name: 'Task Management', type: 'task-management', path: '/tasksDB/_examples/task-management/data.json' },
            { id: 'github-task-manager-tasks', name: 'GTM (TaskDB)', type: 'task-management', path: '/tasksDB/external/github-task-manager/tasks.json' },
            { id: 'ai-career-roadmap-tasks', name: 'AI Roadmap (TaskDB)', type: 'task-management', path: '/tasksDB/external/ai-career-roadmap/tasks.json' }
          ])
        };
      }

      if (String(url).endsWith('/public/tasksDB/external/first-graph/tasks.json')) {
        return {
          ok: true,
          json: async () => ({
            project: { name: 'First Graph' },
            tasks: [],
            graphTemplate: {
              description: 'Embedded Graph',
              rawNodes: [
                { id: 'profile', properties: { name: 'Profile', layer: 0 }, labels: ['Person', 'Domain'] }
              ],
              rawRelationships: [],
              details: {},
              meta: { walkthroughStepsPath: '../tour/graph-tour.json' }
            }
          })
        };
      }

      if (String(url).endsWith('/public/tasksDB/_examples/task-management/data.json')) {
        return { ok: true, json: async () => ({ project: { name: 'Task Demo' }, tasks: [] }) };
      }

      // TaskDB templates (absolute-like)
      if (String(url).endsWith('/public/tasksDB/external/github-task-manager/tasks.json')) {
        return { ok: true, json: async () => ({ project: { name: 'GTM' }, tasks: [] }) };
      }
      if (String(url).endsWith('/public/tasksDB/external/ai-career-roadmap/tasks.json')) {
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

    const fn = new Function('window', 'fetch', 'console', src + '\nreturn { initTemplates, loadTemplate };');
    const res = fn(windowMock, mockFetch, console);
    await res.initTemplates();

    // Ensure we never build '/publictasksDB' (missing slash) and we do fetch the correct URLs.
    expect(requested.some(u => u.includes('/publictasksDB/'))).toBe(false);
    expect(requested.some(u => u.endsWith('/public/tasksDB/external/github-task-manager/tasks.json'))).toBe(true);
    expect(requested.some(u => u.endsWith('/public/tasksDB/external/ai-career-roadmap/tasks.json'))).toBe(true);

    const loaded = res.loadTemplate('first-graph');
    expect(loaded.nodes.length).toBeGreaterThan(0);
    expect(loaded.template.meta.walkthroughStepsPath).toBe('../tasksDB/external/first-graph/tour/graph-tour.json');

    const taskLoaded = res.loadTemplate('github-task-manager-tasks');
    expect(taskLoaded.template.sourceData.project.name).toBe('GTM');
  });

  it('loads embedded graphTemplate when requested via ?template=... and registers it', async () => {
    const filePath = path.join(__dirname, '../../public/graph-display/js/graph-data.js');
    let src = fs.readFileSync(filePath, 'utf8');
    src = src.replace(/^import\s.+$/mg, '');
    src = src.replace(/^export\s+/mg, '');
    src = `const CAREER_TEMPLATE_ID = 'career';\nconst TASK_MGMT_TEMPLATE_ID = 'task-management';\n${src}`;

    const requested = [];
    const mockFetch = async (url) => {
      const normalizedUrl = String(url).replace('/graph-display/../', '/');
      requested.push(normalizedUrl);

      if (normalizedUrl.endsWith('/public/tasksDB/registry.json')) {
        return { ok: true, json: async () => ([]) };
      }

      // When asked for the TaskDB tasks.json for first-graph, return a payload with graphTemplate
      if (normalizedUrl.endsWith('/public/tasksDB/external/first-graph/tasks.json')) {
        return {
          ok: true,
          json: async () => ({
            project: { name: 'First Graph' },
            tasks: [],
            graphTemplate: {
              description: 'Embedded Graph',
              rawNodes: [ { id: 'n1', properties: { name: 'Node 1', layer: 1 }, labels: ['Domain'] } ],
              rawRelationships: []
            }
          })
        };
      }

      return { ok: false, status: 404, json: async () => ({}) };
    };

    const windowMock = {
      location: {
        pathname: '/public/graph-display/index.html',
        hostname: '127.0.0.1',
        search: '?template=first-graph-tasks'
      }
    };

    const fn = new Function('window', 'fetch', 'console', src + '\nreturn { initTemplates, getAvailableTemplates, loadTemplate };');
    const res = fn(windowMock, mockFetch, console);

    // Run initTemplates() and then inspect available templates
    await res.initTemplates();

    const available = res.getAvailableTemplates();
    expect(available.some(t => t.id === 'first-graph-tasks')).toBe(true);

    const loaded = res.loadTemplate('first-graph-tasks');
    expect(loaded.nodes.length).toBeGreaterThan(0);
    expect(loaded.template.name).toMatch(/First Graph|Learning Graph/);
    expect(loaded.template.meta.walkthroughStepsPath).toBe('../tasksDB/external/first-graph/tour/graph-tour.json');
  });

  it('builds descriptive end-node details from explicit graph_end metadata', () => {
    const mod = loadGraphDataModule();

    const tpl = mod.buildProjectTaskTemplatePublic(
      { id: 'demo-project', name: 'Demo Project', path: '/tasksDB/external/demo-project/tasks.json' },
      {
        project: {
          name: 'Demo Project',
          graph_end: {
            mode: 'loop',
            summary: 'The mapped delivery scope resolves into the live service and ongoing upkeep.',
            next_step: 'Move from build work into monitoring, issue triage, and release health review.',
            maintenance_rhythm: 'Weekly maintenance review and deployment health check.'
          }
        },
        tasks: [
          { task_name: 'Ship release', estimated_hours: 4, status: 'Done', priority: 'High' },
          { task_name: 'Monitor production', estimated_hours: 2, status: 'Not Started', priority: 'Medium', category_name: 'Maintenance', dependencies: [{ predecessor_task_name: 'Ship release', type: 'FS' }] }
        ]
      }
    );

    const joined = tpl.details['project-end'].items.join(' ');
    expect(joined).toContain('Terminal tasks captured here');
    expect(joined).toContain('End node type');
    expect(joined).toContain('ongoing upkeep');
    expect(joined).toContain('Weekly maintenance review');
  });

  it('falls back to a richer milestone explanation when graph_end metadata is absent', () => {
    const mod = loadGraphDataModule();

    const tpl = mod.buildProjectTaskTemplatePublic(
      { id: 'fallback-project', name: 'Fallback Project', path: '/tasksDB/external/fallback-project/tasks.json' },
      {
        project: { name: 'Fallback Project' },
        tasks: [
          { task_name: 'Design API', estimated_hours: 4, status: 'Done', priority: 'High' },
          { task_name: 'Ship docs', estimated_hours: 2, status: 'Not Started', priority: 'Medium', dependencies: [{ predecessor_task_name: 'Design API', type: 'FS' }] }
        ]
      }
    );

    const joined = tpl.details['project-end'].items.join(' ');
    expect(joined).toContain('Terminal tasks captured here');
    expect(joined).toContain('real completion point');
    expect(joined).toContain('What happens next');
  });

  it('keeps navigation modules in sidebar metadata without turning inferred module matches into popup drill-down targets', () => {
    const mod = loadGraphDataModule();

    const tpl = mod.buildProjectTaskTemplatePublic(
      { id: 'multi-subgraph-project', name: 'Multi Subgraph Project', path: '/tasksDB/local/multi-subgraph-project/tasks.json' },
      {
        project: { name: 'Multi Subgraph Project' },
        navigation: {
          modules: [
            { path: 'src/apps/PRIVATE/app-a/tasks.json', label: 'app-a', name: 'app-a', taskIds: ['PIPE-001'] },
            { path: 'src/apps/PRIVATE/app-b/tasks.json', label: 'app-b', name: 'app-b', taskIds: ['PIPE-001'] }
          ]
        },
        tasks: [
          { task_name: 'PIPE-001: Define inter-app data transport mechanism', estimated_hours: 8, status: 'Done', priority: 'Critical' }
        ]
      }
    );

    const pipeNode = tpl.nodes.find((node) => node.id === 'task-1');
    expect(pipeNode).toBeTruthy();
    expect(Array.isArray(pipeNode.subtasksTargets)).toBe(true);
    expect(pipeNode.subtasksTargets).toHaveLength(0);
    expect(pipeNode.subtasksPath).toBe(null);
    expect(Array.isArray(tpl.meta.modules)).toBe(true);
    expect(tpl.meta.modules.map((target) => target.path)).toEqual([
      'src/apps/PRIVATE/app-a/tasks.json',
      'src/apps/PRIVATE/app-b/tasks.json'
    ]);
  });

  it('keeps explicit subtask module paths when task data points to another tasks.json file', () => {
    const mod = loadGraphDataModule();

    const tpl = mod.buildProjectTaskTemplatePublic(
      { id: 'explicit-subtask-path', name: 'Explicit Subtask Path', path: '/tasksDB/local/explicit-subtask-path/tasks.json' },
      {
        project: { name: 'Explicit Subtask Path' },
        tasks: [
          {
            task_name: 'CRM module handoff',
            estimated_hours: 5,
            status: 'Done',
            priority: 'High',
            subtasksPath: 'src/apps/PRIVATE/crm/tasks.json'
          }
        ]
      }
    );

    const node = tpl.nodes.find((candidate) => candidate.id === 'task-1');
    expect(node).toBeTruthy();
    expect(node.subtasksPath).toBe('src/apps/PRIVATE/crm/tasks.json');
    expect(node.subtasksTargets).toEqual([{ path: 'src/apps/PRIVATE/crm/tasks.json', label: 'Subtasks' }]);
  });

  it('builds recursive inline subgraphs from subtasks stored in the same JSON file', () => {
    const mod = loadGraphDataModule();

    const sourceData = {
      project: { name: 'Inline Subgraph Demo' },
      tasks: [
        {
          task_id: 1,
          task_name: 'CRM Platform Rollout',
          description: 'Parent task with checklist-style subtasks in the same JSON file.',
          priority: 'High',
          status: 'In Progress',
          estimated_hours: 8,
          subtasks: [
            {
              name: 'Review access model',
              status: 'Done',
              estimated_hours: 1
            },
            {
              name: 'Ship CRM dashboard',
              status: 'Not Started',
              estimated_hours: 3,
              dependencies: [{ predecessor_task_name: 'Review access model', type: 'FS' }],
              subtasks: [
                {
                  name: 'QA release checklist',
                  status: 'Not Started',
                  estimated_hours: 1
                }
              ]
            }
          ]
        }
      ]
    };

    const rootTpl = mod.buildProjectTaskTemplatePublic(
      { id: 'inline-subgraph-demo', name: 'Inline Subgraph Demo', path: '/tasksDB/local/inline-subgraph-demo/tasks.json' },
      sourceData
    );

    const parentNode = rootTpl.nodes.find((node) => node.id === 'task-1');
    expect(parentNode).toBeTruthy();
    expect(parentNode.subtasksTargets).toEqual([{ path: '__inline_task_id__:1', label: 'Subtasks' }]);

    const inlineTpl = mod.buildInlineTaskSubgraphTemplatePublic(
      { id: 'inline-subgraph-demo', name: 'Inline Subgraph Demo' },
      sourceData,
      '__inline_task_id__:1'
    );

    expect(inlineTpl).toBeTruthy();
    expect(inlineTpl.nodes.some((node) => node.label === 'Review access model')).toBe(true);
    expect(inlineTpl.nodes.some((node) => node.label === 'Ship CRM dashboard')).toBe(true);

    const nestedParentNode = inlineTpl.nodes.find((node) => node.label === 'Ship CRM dashboard');
    expect(nestedParentNode).toBeTruthy();
    expect(Array.isArray(nestedParentNode.subtasksTargets)).toBe(true);
    expect(nestedParentNode.subtasksTargets).toHaveLength(1);

    const nestedTpl = mod.buildInlineTaskSubgraphTemplatePublic(
      { id: 'inline-subgraph-demo', name: 'Inline Subgraph Demo' },
      inlineTpl.sourceData,
      nestedParentNode.subtasksTargets[0].path
    );

    expect(nestedTpl).toBeTruthy();
    expect(nestedTpl.nodes.some((node) => node.label === 'QA release checklist')).toBe(true);
  });

  it('includes acceptance_criteria and subtasks as dropdown HTML in popup details', () => {
    const mod = loadGraphDataModule();

    const tpl = mod.buildProjectTaskTemplatePublic(
      { id: 'ac-test', name: 'AC Test', path: '/tasksDB/external/ac-test/tasks.json' },
      {
        project: { name: 'AC Test' },
        tasks: [
          {
            task_id: 1,
            task_name: 'Task with acceptance criteria',
            priority: 'High',
            status: 'In Progress',
            estimated_hours: 4,
            acceptance_criteria: [
              'API returns 200 on valid input',
              'Validation errors return 400'
            ],
            subtasks: [
              { name: 'Build endpoint', status: 'Done', estimated_hours: 2 },
              { name: 'Write tests', status: 'Not Started', estimated_hours: 1 }
            ]
          }
        ]
      }
    );

    const detail = tpl.details['task-1'];
    expect(detail).toBeTruthy();
    const joined = detail.items.join(' ');
    expect(joined).toContain('Acceptance Criteria');
    expect(joined).toContain('(2)');
    expect(joined).toContain('API returns 200');
    expect(joined).toContain('Sub-tasks');
    expect(joined).toContain('Build endpoint');
    expect(joined).toContain('Write tests');
    expect(joined).toContain('popup-dropdown');
  });

  it('inherits parent context for inline subtasks so popup details stay informative', () => {
    const mod = loadGraphDataModule();

    const sourceData = {
      project: { name: 'Deploy Demo' },
      tasks: [
        {
          task_id: 1,
          task_name: 'Deploy to GitHub Pages',
          description: 'Setup GitHub Actions workflow to deploy the task manager to GitHub Pages.',
          acceptance_criteria: [
            'Workflow triggers on push to main',
            'Public URL serves the app correctly'
          ],
          start_date: '2025-12-20',
          end_date: '2025-12-23',
          due_date: '2025-12-23',
          priority: 'Critical',
          status: 'Done',
          progress_percentage: 100,
          estimated_hours: 6,
          actual_hours: 5,
          is_critical_path: true,
          tags: ['deployment', 'github-actions'],
          category_name: 'Deployment',
          sprint_name: 'Sprint 4',
          complexity: 'Medium',
          assigned_workers: [
            { name: 'Developer', role: 'Full Stack Developer' }
          ],
          reviewer: 'Lead Reviewer',
          subtasks: [
            {
              task_name: 'Create deploy.yml GitHub Actions workflow',
              status: 'Done',
              estimated_hours: 2,
              priority: 'Critical'
            }
          ]
        }
      ]
    };

    const inlineTpl = mod.buildInlineTaskSubgraphTemplatePublic(
      { id: 'deploy-demo', name: 'Deploy Demo' },
      sourceData,
      '__inline_task_id__:1'
    );

    expect(inlineTpl).toBeTruthy();
    const detail = inlineTpl.details['task-1'];
    expect(detail).toBeTruthy();
    const joined = detail.items.join(' ');
    expect(joined).toContain('Description');
    expect(joined).toContain('Setup GitHub Actions workflow');
    expect(joined).toContain('Acceptance Criteria');
    expect(joined).toContain('Timeline');
    expect(joined).toContain('Progress');
    expect(joined).toContain('Assigned');
    expect(joined).toContain('Developer');
  });

  it('does NOT inject inline subtask virtual modules into meta.modules', () => {
    const mod = loadGraphDataModule();

    const tpl = mod.buildProjectTaskTemplatePublic(
      { id: 'no-virtual-mod-test', name: 'No Virtual Modules Test', path: '/tasksDB/external/no-virtual-mod-test/tasks.json' },
      {
        project: { name: 'No Virtual Modules Test' },
        tasks: [
          {
            task_id: 1,
            task_name: 'Parent task with subtasks',
            priority: 'High',
            status: 'In Progress',
            estimated_hours: 8,
            subtasks: [
              { name: 'Child A', status: 'Done', estimated_hours: 2 },
              { name: 'Child B', status: 'Not Started', estimated_hours: 3 }
            ]
          },
          {
            task_id: 2,
            task_name: 'Leaf task without subtasks',
            priority: 'Medium',
            status: 'Done',
            estimated_hours: 2,
            dependencies: [{ predecessor_task_name: 'Parent task with subtasks', type: 'FS' }]
          }
        ]
      }
    );

    // meta.modules should NOT contain __inline_task_id__ entries
    const modules = tpl.meta.modules || [];
    const inlineMod = modules.find(m => String(m.path || '').startsWith('__inline_task_id__:'));
    expect(inlineMod).toBeFalsy();
  });
});
