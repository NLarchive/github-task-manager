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
  }
  
  async getFileContent(path) {
    return { 
      content: this.files[path] || '[]',
      sha: 'mock-sha'
    };
  }
  
  async updateFile(path, content, message, sha) {
    this.files[path] = content;
    return { sha: 'new-mock-sha' };
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

    expect(mockApi.files['public/tasksDB/tasks.json']).toBeTruthy();
    expect(mockApi.files['public/tasksDB/tasks.csv']).toBeTruthy();

    // Restore token
    TEMPLATE_CONFIG.GITHUB.TOKEN = previousToken;
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
