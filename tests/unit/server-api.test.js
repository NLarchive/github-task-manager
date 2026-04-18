/**
 * Server API Tests
 * Validates local disk persistence API and derived state files generation.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const { createServer } = require('../../server');

function httpRequest({ port, method, path: reqPath, body, headers = {} }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        method,
        path: reqPath,
        headers: {
          ...headers,
          ...(body
            ? {
                'Content-Length': Buffer.byteLength(body)
              }
            : {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

describe('Server API - /api/tasks', () => {
  it('should persist tasks.json + tasks.csv and generate state files', async () => {
    const repoRoot = path.join(__dirname, '..', '..');
    const publicDir = path.join(repoRoot, 'public');
    const tasksDbDir = path.join(repoRoot, 'test-results', 'unit', 'tasksDB-server-api');

    fs.rmSync(tasksDbDir, { recursive: true, force: true });
    fs.mkdirSync(tasksDbDir, { recursive: true });

    const server = createServer({ publicDir, tasksDbDir });
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    try {
      const payload = {
        project: { name: 'Test Project', start_date: '2025-12-01', end_date: '2025-12-31', status: 'In Progress' },
        categories: [{ name: 'Testing', parent_category_name: null }],
        workers: [],
        tasks: [
          {
            task_id: 1,
            task_name: 'A',
            description: 'A',
            start_date: '2025-12-02',
            end_date: '2025-12-03',
            priority: 'Medium',
            status: 'Not Started',
            progress_percentage: 0,
            estimated_hours: 1,
            actual_hours: 0,
            is_critical_path: false,
            category_name: 'Testing',
            parent_task_id: null,
            creator_id: 'unit@test',
            created_date: new Date().toISOString(),
            completed_date: null,
            tags: [],
            assigned_workers: [],
            dependencies: [],
            comments: [],
            attachments: []
          },
          {
            task_id: 2,
            task_name: 'B',
            description: 'B',
            start_date: '2025-12-04',
            end_date: '2025-12-05',
            priority: 'High',
            status: 'Completed',
            progress_percentage: 100,
            estimated_hours: 2,
            actual_hours: 2,
            is_critical_path: false,
            category_name: 'Testing',
            parent_task_id: null,
            creator_id: 'unit@test',
            created_date: new Date().toISOString(),
            completed_date: new Date().toISOString(),
            tags: [],
            assigned_workers: [],
            dependencies: [],
            comments: [],
            attachments: []
          }
        ]
      };

      const putRes = await httpRequest({
        port,
        method: 'PUT',
        path: '/api/tasks',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });

      expect(putRes.status).toBe(200);

      const jsonPath = path.join(tasksDbDir, 'tasks.json');
      const csvPath = path.join(tasksDbDir, 'tasks.csv');
      expect(fs.existsSync(jsonPath)).toBeTruthy();
      expect(fs.existsSync(csvPath)).toBeTruthy();

      const stateDir = path.join(tasksDbDir, 'state');
      expect(fs.existsSync(path.join(stateDir, 'tasks-by-status.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(stateDir, 'tasks-not-started.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(stateDir, 'tasks-in-progress.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(stateDir, 'tasks-completed.json'))).toBeTruthy();

      const summary = JSON.parse(fs.readFileSync(path.join(stateDir, 'tasks-by-status.json'), 'utf8'));
      expect(summary.total_tasks).toBe(2);
      expect(summary.counts_by_status['Not Started']).toBe(1);
      expect(summary.counts_by_status['Completed']).toBe(1);

      const getRes = await httpRequest({ port, method: 'GET', path: '/api/tasks' });
      expect(getRes.status).toBe(200);
      const readBack = JSON.parse(getRes.body);
      expect(Array.isArray(readBack.tasks)).toBeTruthy();
      expect(readBack.tasks.length).toBe(2);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('should read and write synchronized root project payloads backed by src/tasks.json', async () => {
    const repoRoot = path.join(__dirname, '..', '..');
    const publicDir = path.join(repoRoot, 'public');
    const tasksDbDir = path.join(repoRoot, 'test-results', 'unit', 'tasksDB-server-api-sync');
    const projectDir = path.join(tasksDbDir, 'local', 'sync-project');
    const srcDir = path.join(projectDir, 'src');
    const moduleDir = path.join(srcDir, 'apps', 'PRIVATE', '1-STRATEGY', 'crm');

    fs.rmSync(tasksDbDir, { recursive: true, force: true });
    fs.mkdirSync(moduleDir, { recursive: true });

    fs.writeFileSync(path.join(projectDir, 'tasks.json'), JSON.stringify({
      template_type: 'project_task_template',
      version: '3.0',
      navigation: {
        rootModule: 'src/tasks.json',
        modules: []
      },
      tasks: []
    }, null, 2), 'utf8');

    fs.writeFileSync(path.join(srcDir, 'tasks.json'), JSON.stringify({
      template_type: 'project_task_template',
      version: '3.0',
      project: { name: 'Synced Root Project', status: 'Planning' },
      tasks: [
        {
          task_name: 'STRAT-003: crm app scaffold',
          description: 'Root task',
          priority: 'High',
          status: 'Not Started',
          estimated_hours: 3,
          category_name: '1-Strategy',
          dependencies: []
        }
      ]
    }, null, 2), 'utf8');

    fs.writeFileSync(path.join(moduleDir, 'tasks.json'), JSON.stringify({
      template_type: 'submodule_task_template',
      version: '1.0',
      module: {
        name: 'crm',
        path: 'apps/PRIVATE/1-STRATEGY/crm',
        type: 'private-app',
        task_ids: ['STRAT-003']
      },
      tasks: [
        {
          task_name: 'STRAT-003: crm app scaffold',
          description: 'Module task',
          priority: 'High',
          status: 'Not Started',
          estimated_hours: 3,
          category_name: '1-Strategy',
          dependencies: []
        }
      ]
    }, null, 2), 'utf8');

    const server = createServer({ publicDir, tasksDbDir });
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    try {
      const getRes = await httpRequest({ port, method: 'GET', path: '/api/tasks?project=sync-project' });
      expect(getRes.status).toBe(200);
      const readBack = JSON.parse(getRes.body);
      expect(readBack.project.name).toBe('Synced Root Project');
      expect(readBack.navigation.rootModule).toBe('src/tasks.json');
      expect(Array.isArray(readBack.navigation.modules)).toBeTruthy();
      expect(readBack.navigation.modules[0].path).toBe('src/apps/PRIVATE/1-STRATEGY/crm/tasks.json');
      expect(readBack.navigation.modules[0].taskIds).toEqual(['STRAT-003']);

      const updatedPayload = {
        ...readBack,
        tasks: [
          ...readBack.tasks,
          {
            task_name: 'SHARED-001: shared engine setup',
            description: 'New root task',
            priority: 'Medium',
            status: 'In Progress',
            estimated_hours: 2,
            category_name: 'Shared Layer',
            dependencies: []
          }
        ]
      };

      const putRes = await httpRequest({
        port,
        method: 'PUT',
        path: '/api/tasks?project=sync-project',
        body: JSON.stringify(updatedPayload),
        headers: { 'Content-Type': 'application/json' }
      });
      expect(putRes.status).toBe(200);

      const syncedTasksJson = JSON.parse(fs.readFileSync(path.join(projectDir, 'tasks.json'), 'utf8'));
      const syncedRootTasks = JSON.parse(fs.readFileSync(path.join(srcDir, 'tasks.json'), 'utf8'));
      expect(syncedTasksJson.tasks.length).toBe(2);
      expect(syncedRootTasks.tasks.length).toBe(2);
      expect(syncedTasksJson.navigation.rootModule).toBe('src/tasks.json');
      expect(syncedRootTasks.navigation.modules[0].path).toBe('apps/PRIVATE/1-STRATEGY/crm/tasks.json');
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('should discover and synchronize projects backed by recursive tasks.json files', async () => {
    const repoRoot = path.join(__dirname, '..', '..');
    const publicDir = path.join(repoRoot, 'public');
    const tasksDbDir = path.join(repoRoot, 'test-results', 'unit', 'tasksDB-server-api-mixed');
    const projectDir = path.join(tasksDbDir, 'local', 'mixed-project');
    const srcDir = path.join(projectDir, 'src');
    const moduleDir = path.join(srcDir, 'apps', 'PRIVATE', '1-STRATEGY', 'crm');

    fs.rmSync(tasksDbDir, { recursive: true, force: true });
    fs.mkdirSync(moduleDir, { recursive: true });

    fs.writeFileSync(path.join(srcDir, 'tasks.json'), JSON.stringify({
      template_type: 'project_task_template',
      version: '3.0',
      project: { name: 'Mixed Filename Root', status: 'Planning' },
      tasks: [
        {
          task_name: 'STRAT-001: crm foundation',
          description: 'Root task loaded from src/tasks.json',
          priority: 'High',
          status: 'Not Started',
          estimated_hours: 5,
          category_name: '1-Strategy',
          dependencies: []
        }
      ]
    }, null, 2), 'utf8');

    fs.writeFileSync(path.join(moduleDir, 'tasks.json'), JSON.stringify({
      template_type: 'submodule_task_template',
      version: '1.0',
      module: {
        name: 'crm',
        path: 'apps/PRIVATE/1-STRATEGY/crm',
        type: 'private-app',
        task_ids: ['STRAT-001']
      },
      tasks: [
        {
          task_name: 'STRAT-001: crm foundation',
          description: 'Module task loaded from tasks.json',
          priority: 'High',
          status: 'Not Started',
          estimated_hours: 5,
          category_name: '1-Strategy',
          dependencies: []
        }
      ]
    }, null, 2), 'utf8');

    const server = createServer({ publicDir, tasksDbDir });
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    try {
      const getRes = await httpRequest({ port, method: 'GET', path: '/api/tasks?project=mixed-project' });
      expect(getRes.status).toBe(200);

      const readBack = JSON.parse(getRes.body);
      expect(readBack.project.name).toBe('Mixed Filename Root');
      expect(readBack.navigation.rootModule).toBe('src/tasks.json');
      expect(Array.isArray(readBack.navigation.modules)).toBeTruthy();
      expect(readBack.navigation.modules[0].path).toBe('src/apps/PRIVATE/1-STRATEGY/crm/tasks.json');
      expect(readBack.navigation.modules[0].taskIds).toEqual(['STRAT-001']);
      expect(readBack.navigation.modules[0].startTasks).toContain('STRAT-001: crm foundation');
      expect(readBack.navigation.modules[0].endTasks).toContain('STRAT-001: crm foundation');

      const updatedPayload = {
        ...readBack,
        tasks: [
          ...readBack.tasks,
          {
            task_name: 'STRAT-002: crm delivery',
            description: 'Second root task',
            priority: 'Medium',
            status: 'In Progress',
            estimated_hours: 3,
            category_name: '1-Strategy',
            dependencies: [
              {
                predecessor_task_name: 'STRAT-001: crm foundation',
                type: 'FS',
                lag_days: 0
              }
            ]
          }
        ]
      };

      const putRes = await httpRequest({
        port,
        method: 'PUT',
        path: '/api/tasks?project=mixed-project',
        body: JSON.stringify(updatedPayload),
        headers: { 'Content-Type': 'application/json' }
      });
      expect(putRes.status).toBe(200);

      const syncedTasksIndex = JSON.parse(fs.readFileSync(path.join(projectDir, 'tasks.json'), 'utf8'));
      const syncedRootTasks = JSON.parse(fs.readFileSync(path.join(srcDir, 'tasks.json'), 'utf8'));
      expect(syncedTasksIndex.navigation.rootModule).toBe('src/tasks.json');
      expect(syncedTasksIndex.tasks.length).toBe(2);
      expect(syncedRootTasks.tasks.length).toBe(2);
      expect(syncedRootTasks.navigation.modules[0].path).toBe('apps/PRIVATE/1-STRATEGY/crm/tasks.json');
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
