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
});
