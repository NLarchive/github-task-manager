/**
 * Task Database Tests
 * Tests for task storage and operations
 */

const fs = require('fs');
const path = require('path');

// Load config
let configContent = fs.readFileSync(path.join(__dirname, '../public/config/template-config.js'), 'utf8');
configContent = configContent.replace(
  /TOKEN: \(typeof GITHUB_TOKEN !== 'undefined' \? GITHUB_TOKEN : ''\)/,
  "TOKEN: ''"
);
const getConfig = new Function(configContent + '\nreturn TEMPLATE_CONFIG;');
const TEMPLATE_CONFIG = getConfig();

// Load validator
const validatorContent = fs.readFileSync(path.join(__dirname, '../public/scripts/template-validator.js'), 'utf8');
const getValidator = new Function('TEMPLATE_CONFIG', validatorContent + '\nreturn TemplateValidator;');
const TemplateValidator = getValidator(TEMPLATE_CONFIG);

// Load automation
const automationContent = fs.readFileSync(path.join(__dirname, '../public/scripts/template-automation.js'), 'utf8');
const getAutomation = new Function('TEMPLATE_CONFIG', 'TemplateValidator', automationContent + '\nreturn TemplateAutomation;');
const TemplateAutomation = getAutomation(TEMPLATE_CONFIG, TemplateValidator);

// Load database
const databaseContent = fs.readFileSync(path.join(__dirname, '../public/tasksDB/task-database.js'), 'utf8');
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
