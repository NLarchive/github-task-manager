/**
 * Task Database Tests
 * Tests for task storage and operations
 */

const fs = require('fs');
const path = require('path');

// Load config
let configContent = fs.readFileSync(path.join(__dirname, '../../public/config/template-config.js'), 'utf8');
configContent = configContent.replace(
  /TOKEN: \(typeof GH_TOKEN !== 'undefined' \? GH_TOKEN : ''\)/,
  "TOKEN: ''"
);
const getConfig = new Function(configContent + '\nreturn TEMPLATE_CONFIG;');
const TEMPLATE_CONFIG = getConfig();

// Make available to code evaluated via new Function() (TaskDatabase.resolveTemplateConfig())
globalThis.TEMPLATE_CONFIG = TEMPLATE_CONFIG;

// Load validator
const validatorContent = fs.readFileSync(path.join(__dirname, '../../public/scripts/template-validator.js'), 'utf8');
const getValidator = new Function('TEMPLATE_CONFIG', validatorContent + '\nreturn TemplateValidator;');
const TemplateValidator = getValidator(TEMPLATE_CONFIG);

// Load automation
const automationContent = fs.readFileSync(path.join(__dirname, '../../public/scripts/template-automation.js'), 'utf8');
const getAutomation = new Function('TEMPLATE_CONFIG', 'TemplateValidator', automationContent + '\nreturn TemplateAutomation;');
const TemplateAutomation = getAutomation(TEMPLATE_CONFIG, TemplateValidator);

// Load database
const databaseContent = fs.readFileSync(path.join(__dirname, '../../public/tasksDB/task-database.js'), 'utf8');
const getDatabase = new Function('TemplateValidator', 'TemplateAutomation', 'console', databaseContent + '\nreturn TaskDatabase;');
const TaskDatabase = getDatabase(TemplateValidator, TemplateAutomation, console);

// Mock GitHub API
class MockGitHubAPI {
  constructor() {
    this.files = {};
    this.messages = {};
  }
  
  async getFileContent(path) {
    return { 
      content: this.files[path] || '[]',
      sha: 'mock-sha'
    };
  }
  
  async updateFile(path, content, message, sha) {
    this.files[path] = content;
    this.messages[path] = message;
    return { sha: 'new-mock-sha' };
  }
}

function extractTaskDbCommitPayload(message) {
  const start = '---TASKDB_CHANGE_V1---';
  const end = '---/TASKDB_CHANGE_V1---';
  if (typeof message !== 'string') return null;
  const i = message.indexOf(start);
  const j = message.indexOf(end);
  if (i < 0 || j < 0 || j <= i) return null;
  const jsonText = message.slice(i + start.length, j).trim();
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

describe('TaskDatabase Initialization', () => {
  it('should create database instance with mock API', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    expect(db).toBeTruthy();
  });

  it('should have empty tasks array initially', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    expect(db.tasks).toHaveLength(0);
  });
});

describe('Task CRUD Operations', () => {
  it('should create a task with auto-generated fields', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    
    const result = db.createTask({
      task_name: 'New Task',
      description: 'A test task',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'High',
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    });
    
    expect(result.success).toBeTruthy();
    expect(result.task.task_id).toBeTruthy();
    expect(result.task.created_date).toBeTruthy();
  });

  it('should get task by ID', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    
    db.createTask({
      task_name: 'Task 1',
      description: 'First task',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'High',
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    });
    
    const task = db.getTask(1);
    expect(task).toBeTruthy();
    expect(task.task_name).toBe('Task 1');
  });

  it('should get task by string ID', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    
    db.createTask({
      task_name: 'Task 1',
      description: 'First task',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'High',
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    });
    
    // Verify ID is number
    const task = db.getTask(1);
    expect(typeof task.task_id).toBe('number');

    // Retrieve using string
    const retrieved = db.getTask('1');
    expect(retrieved).toBeTruthy();
    expect(retrieved.task_id).toBe(1);
  });

  it('should update task properties', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    
    db.createTask({
      task_name: 'Original Name',
      description: 'Original',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'Medium',
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    });
    
    const result = db.updateTask(1, { 
      task_name: 'Updated Name',
      status: 'In Progress' 
    });
    
    expect(result.success).toBeTruthy();
    expect(result.task.task_name).toBe('Updated Name');
    expect(result.task.status).toBe('In Progress');
  });

  it('should update task using string ID', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    
    db.createTask({
      task_name: 'Original Name',
      description: 'Original',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'Medium',
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    });
    
    const result = db.updateTask('1', { 
      task_name: 'Updated Name',
      status: 'In Progress' 
    });
    
    expect(result.success).toBeTruthy();
    expect(result.task.task_name).toBe('Updated Name');
  });

  it('should delete task by ID', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    
    db.createTask({
      task_name: 'To Delete',
      description: 'Will be deleted',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'Low',
      status: 'Not Started',
      estimated_hours: 4,
      category_name: 'Testing'
    });
    
    expect(db.tasks).toHaveLength(1);
    
    const result = db.deleteTask(1);
    expect(result.success).toBeTruthy();
    expect(db.tasks).toHaveLength(0);
  });
});

describe('Task Filtering', () => {
  it('should filter tasks by status', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    
    db.createTask({
      task_name: 'Task 1',
      description: 'First',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'High',
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    });
    
    db.createTask({
      task_name: 'Task 2',
      description: 'Second',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'Medium',
      status: 'In Progress',
      estimated_hours: 4,
      category_name: 'Development'
    });
    
    const inProgress = db.getTasks({ status: 'In Progress' });
    expect(inProgress).toHaveLength(1);
    expect(inProgress[0].task_name).toBe('Task 2');
  });

  it('should filter tasks by priority', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    
    db.createTask({
      task_name: 'High Priority',
      description: 'Important',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'High',
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    });
    
    db.createTask({
      task_name: 'Low Priority',
      description: 'Not urgent',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'Low',
      status: 'Not Started',
      estimated_hours: 4,
      category_name: 'Testing'
    });
    
    const highPriority = db.getTasks({ priority: 'High' });
    expect(highPriority).toHaveLength(1);
    expect(highPriority[0].task_name).toBe('High Priority');
  });
});

describe('Statistics Generation', () => {
  it('should generate project summary statistics', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);
    
    db.createTask({
      task_name: 'Task 1',
      description: 'First',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'Critical',
      status: 'In Progress',
      estimated_hours: 10,
      category_name: 'Development',
      is_critical_path: true
    });
    
    db.createTask({
      task_name: 'Task 2',
      description: 'Second',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'Low',
      status: 'Completed',
      estimated_hours: 5,
      actual_hours: 4,
      category_name: 'Testing'
    });
    
    const stats = db.getStatistics();
    expect(stats.total_tasks).toBe(2);
    expect(stats.total_estimated_hours).toBe(15);
  });
});

describe('TaskDatabase Persistence', () => {
  it('should save both tasks.json and tasks.csv', async () => {
    // Force GitHub persistence path for this test
    const previousToken = TEMPLATE_CONFIG.GITHUB.TOKEN;
    TEMPLATE_CONFIG.GITHUB.TOKEN = 'unit-test-token';

    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);

    const created = db.createTask({
      task_name: 'Persist Test Task',
      description: 'Verify JSON+CSV persistence',
      start_date: '2025-12-11',
      end_date: '2025-12-12',
      priority: 'Medium',
      status: 'Not Started',
      estimated_hours: 1,
      category_name: 'Testing'
    }, 'dev@example.com');

    expect(created.success).toBeTruthy();

    const result = await db.saveTasks('Test save');
    expect(result.success).toBeTruthy();

    expect(mockApi.files['public/tasksDB/github-task-manager/tasks.json']).toBeTruthy();
    expect(mockApi.files['public/tasksDB/github-task-manager/tasks.csv']).toBeTruthy();

    // Commit message should include a machine-readable change block
    const msg = mockApi.messages['public/tasksDB/github-task-manager/tasks.json'];
    expect(typeof msg).toBe('string');
    expect(msg).toContain('---TASKDB_CHANGE_V1---');
    expect(msg).toContain('---/TASKDB_CHANGE_V1---');

    const payload = extractTaskDbCommitPayload(msg);
    expect(payload).toBeTruthy();
    expect(payload.spec).toBe('taskdb.commit.v1');
    expect(payload.projectId).toBe('github-task-manager');
    expect(payload.artifact).toBe('tasks.json');
    expect(Array.isArray(payload.events)).toBeTruthy();
    expect(payload.events.length).toBeGreaterThan(0);
    expect(payload.events[0].action).toBe('create');
    expect(payload.events[0].task).toBeTruthy();
    expect(payload.events[0].task.task_name).toBe('Persist Test Task');

    // Restore token
    TEMPLATE_CONFIG.GITHUB.TOKEN = previousToken;
  });

  it('should include field-level changes for updates in a stable schema order', async () => {
    const previousToken = TEMPLATE_CONFIG.GITHUB.TOKEN;
    TEMPLATE_CONFIG.GITHUB.TOKEN = 'unit-test-token';

    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);

    const created = db.createTask({
      task_name: 'Commit Order Task',
      description: 'Original',
      start_date: '2025-12-11',
      end_date: '2025-12-12',
      priority: 'Medium',
      status: 'Not Started',
      estimated_hours: 1,
      category_name: 'Testing'
    }, 'dev@example.com');
    expect(created.success).toBeTruthy();

    // First save establishes snapshot
    const first = await db.saveTasks('Initial save');
    expect(first.success).toBeTruthy();

    // Update a couple of fields (as the UI taskForm would)
    const updated = db.updateTask(created.task.task_id, {
      status: 'In Progress',
      progress_percentage: 50,
      description: 'Updated desc'
    });
    expect(updated.success).toBeTruthy();

    const second = await db.saveTasks('Second save');
    expect(second.success).toBeTruthy();

    const msg = mockApi.messages['public/tasksDB/github-task-manager/tasks.json'];
    const payload = extractTaskDbCommitPayload(msg);
    expect(payload).toBeTruthy();
    expect(payload.artifact).toBe('tasks.json');

    // Subject line should be machine-friendly and include action, id, task_name, and change summary (fully pipe-separated)
    const subjectLine = String(msg || '').split('\n')[0] || '';
    expect(subjectLine).toContain(`TaskDB|update|${created.task.task_id}|`);
    expect(subjectLine).toContain(created.task.task_name);
    expect(subjectLine).toContain('progress_percentage');

    // Structured subject should parse into pipe-separated fields: TaskDB|action|id|task_name|summary
    const parts = subjectLine.split('|');
    expect(parts.length).toBeGreaterThan(4);
    expect(String(parts[2])).toBe(String(created.task.task_id));
    expect(String(parts[3])).toContain('Commit Order Task');
    expect(String(parts[4])).toContain('progress_percentage');

    // Find the update event
    const updateEv = (payload.events || []).find(e => e && e.action === 'update' && String(e.taskId) === String(created.task.task_id));
    expect(updateEv).toBeTruthy();
    expect(Array.isArray(updateEv.changes)).toBeTruthy();

    const fields = updateEv.changes.map(c => c.field);
    expect(fields).toContain('description');
    expect(fields).toContain('status');
    expect(fields).toContain('progress_percentage');

    // Schema-order sanity: status should appear before progress_percentage in the template config
    const idxStatus = fields.indexOf('status');
    const idxProgress = fields.indexOf('progress_percentage');
    expect(idxStatus).toBeGreaterThan(-1);
    expect(idxProgress).toBeGreaterThan(-1);
    expect(idxStatus < idxProgress).toBeTruthy();

    TEMPLATE_CONFIG.GITHUB.TOKEN = previousToken;
  });

  it('should parse and validate TaskDB commit subject format', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);

    // Test valid create subject
    const createSubject = 'TaskDB|create|5|Sample Task|Brief description of task';
    const createParsed = db.parseTaskDbCommitSubject(createSubject);
    expect(createParsed.valid).toBeTruthy();
    expect(createParsed.action).toBe('create');
    expect(createParsed.id).toBe(5);
    expect(createParsed.taskName).toBe('Sample Task');
    expect(createParsed.summary).toBe('Brief description of task');

    // Test valid update subject
    const updateSubject = 'TaskDB|update|7|Fix bug|status, progress_percentage';
    const updateParsed = db.parseTaskDbCommitSubject(updateSubject);
    expect(updateParsed.valid).toBeTruthy();
    expect(updateParsed.action).toBe('update');
    expect(updateParsed.id).toBe(7);
    expect(updateParsed.taskName).toBe('Fix bug');

    // Test invalid (missing fields)
    const invalidSubject = 'TaskDB|create|9|Only Two Fields';
    const invalidParsed = db.parseTaskDbCommitSubject(invalidSubject);
    expect(invalidParsed.valid).toBeFalsy();
    expect(invalidParsed.error).toContain('Expected at least 5');

    // Test invalid action
    const badActionSubject = 'TaskDB|modify|10|Task|desc';
    const badActionParsed = db.parseTaskDbCommitSubject(badActionSubject);
    expect(badActionParsed.valid).toBeFalsy();
    expect(badActionParsed.error).toContain('not in');
  });

  it('should refuse saving when duplicate task_id exists', async () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);

    db.tasks = [
      {
        task_id: 1,
        task_name: 'Dup A',
        description: 'A',
        start_date: '2025-12-11',
        end_date: '2025-12-12',
        priority: 'Medium',
        status: 'Not Started',
        progress_percentage: 0,
        estimated_hours: 1,
        actual_hours: 0,
        is_critical_path: false,
        category_name: 'Testing',
        parent_task_id: null,
        creator_id: 'dev@example.com',
        created_date: '2025-12-11T00:00:00Z',
        completed_date: null,
        tags: [],
        assigned_workers: [],
        dependencies: [],
        comments: [],
        attachments: []
      },
      {
        task_id: 1,
        task_name: 'Dup B',
        description: 'B',
        start_date: '2025-12-11',
        end_date: '2025-12-12',
        priority: 'Medium',
        status: 'Not Started',
        progress_percentage: 0,
        estimated_hours: 1,
        actual_hours: 0,
        is_critical_path: false,
        category_name: 'Testing',
        parent_task_id: null,
        creator_id: 'dev@example.com',
        created_date: '2025-12-11T00:00:00Z',
        completed_date: null,
        tags: [],
        assigned_workers: [],
        dependencies: [],
        comments: [],
        attachments: []
      }
    ];

    const result = await db.saveTasks('Should fail');
    expect(result.success).toBeFalsy();
    expect(result.error).toContain('Duplicate task_id');
  });

  it('should not allow updateTask to change task_id type/value', () => {
    const mockApi = new MockGitHubAPI();
    const db = new TaskDatabase(mockApi);

    const created = db.createTask({
      task_name: 'Task A',
      description: 'A',
      start_date: '2025-12-10',
      end_date: '2025-12-11',
      priority: 'Medium',
      status: 'Not Started',
      estimated_hours: 1,
      category_name: 'Testing'
    });

    expect(created.success).toBeTruthy();
    expect(typeof created.task.task_id).toBe('number');

    const updated = db.updateTask(created.task.task_id, {
      task_id: String(created.task.task_id),
      description: 'Updated'
    });

    expect(updated.success).toBeTruthy();
    expect(typeof updated.task.task_id).toBe('number');
    expect(updated.task.task_id).toBe(created.task.task_id);
  });
});
