/**
 * Template Validator Tests
 * Tests for validation logic
 */

const fs = require('fs');
const path = require('path');

// Load config
// Load config
let configContent = fs.readFileSync(path.join(__dirname, '../../public/config/tasks-template-config.js'), 'utf8');
configContent = configContent.replace(
  /TOKEN: \(typeof GH_TOKEN !== 'undefined' \? GH_TOKEN : ''\)/,
  "TOKEN: ''"
);
const getConfig = new Function(configContent + '\nreturn TEMPLATE_CONFIG;');
const TEMPLATE_CONFIG = getConfig();

// Load validator
const validatorContent = fs.readFileSync(path.join(__dirname, '../../public/task-engine/js/task-schema-validator.js'), 'utf8');
const getValidator = new Function('TEMPLATE_CONFIG', validatorContent + '\nreturn TemplateValidator;');
const TemplateValidator = getValidator(TEMPLATE_CONFIG);

describe('TemplateValidator Initialization', () => {
  it('should create validator instance with default config', () => {
    const validator = new TemplateValidator(TEMPLATE_CONFIG);
    expect(validator).toBeTruthy();
  });

  it('should have config property', () => {
    const validator = new TemplateValidator(TEMPLATE_CONFIG);
    expect(validator.config).toBeTruthy();
  });
});

describe('Date Validation', () => {
  const validator = new TemplateValidator(TEMPLATE_CONFIG);

  it('should validate correct date format YYYY-MM-DD', () => {
    expect(validator.isValidDate('2025-12-10')).toBeTruthy();
  });

  it('should reject invalid date format MM/DD/YYYY', () => {
    expect(validator.isValidDate('12/10/2025')).toBeFalsy();
  });

  it('should reject invalid date format with text', () => {
    expect(validator.isValidDate('December 10, 2025')).toBeFalsy();
  });
});

describe('Email Validation', () => {
  const validator = new TemplateValidator(TEMPLATE_CONFIG);

  it('should validate correct email format', () => {
    expect(validator.isValidEmail('user@example.com')).toBeTruthy();
  });

  it('should reject email without @', () => {
    expect(validator.isValidEmail('userexample.com')).toBeFalsy();
  });

  it('should reject email without domain', () => {
    expect(validator.isValidEmail('user@')).toBeFalsy();
  });
});

describe('Status Normalization', () => {
  const validator = new TemplateValidator(TEMPLATE_CONFIG);

  it('should normalize "completed" to "Completed"', () => {
    expect(validator.normalizeStatus('completed')).toBe('Completed');
  });

  it('should normalize "in progress" to "In Progress"', () => {
    expect(validator.normalizeStatus('in progress')).toBe('In Progress');
  });

  it('should normalize "in_progress" to "In Progress"', () => {
    expect(validator.normalizeStatus('in_progress')).toBe('In Progress');
  });

  it('should normalize "blocked" to "Blocked"', () => {
    expect(validator.normalizeStatus('blocked')).toBe('Blocked');
  });
});

describe('Task Validation', () => {
  const validator = new TemplateValidator(TEMPLATE_CONFIG);

  it('should validate a complete valid task', () => {
    const task = {
      task_id: 1,
      task_name: 'Test Task',
      description: 'Test description',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'High',
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    };
    const result = validator.validate(task, 'task');
    expect(result.isValid).toBeTruthy();
  });

  it('should reject task with missing required field', () => {
    const task = {
      task_id: 1,
      task_name: 'Test Task',
      // missing description
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'High',
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    };
    const result = validator.validate(task, 'task');
    expect(result.isValid).toBeFalsy();
  });

  it('should reject task with invalid priority', () => {
    const task = {
      task_id: 1,
      task_name: 'Test Task',
      description: 'Test',
      start_date: '2025-12-10',
      end_date: '2025-12-15',
      priority: 'SuperHigh', // Invalid
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    };
    const result = validator.validate(task, 'task');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject task with end_date before start_date', () => {
    const task = {
      task_id: 1,
      task_name: 'Test Task',
      description: 'Test',
      start_date: '2025-12-15',
      end_date: '2025-12-10', // Before start
      priority: 'High',
      status: 'Not Started',
      estimated_hours: 8,
      category_name: 'Testing'
    };
    const result = validator.validate(task, 'task');
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('Project Validation', () => {
  const validator = new TemplateValidator(TEMPLATE_CONFIG);

  it('should validate a complete valid project', () => {
    const project = {
      name: 'Test Project',
      start_date: '2025-12-01',
      end_date: '2025-12-31',
      status: 'In Progress'
    };
    const result = validator.validateProject(project);
    expect(result.errors.length).toBe(0);
  });

  it('should reject project with invalid status', () => {
    const project = {
      name: 'Test Project',
      start_date: '2025-12-01',
      end_date: '2025-12-31',
      status: 'Working' // Invalid
    };
    const result = validator.validateProject(project);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should accept project with "Planning" status (v3)', () => {
    const project = {
      name: 'Test Project',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      status: 'Planning'
    };
    const result = validator.validateProject(project);
    expect(result.errors.filter(e => e.includes('status')).length).toBe(0);
  });

  it('should validate project_manager object', () => {
    const project = {
      name: 'Test Project',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      status: 'Not Started',
      project_manager: { name: 'Alice', email: 'alice@example.com' }
    };
    const result = validator.validateProject(project);
    expect(result.errors.filter(e => e.includes('project_manager')).length).toBe(0);
  });

  it('should reject project_manager with invalid email', () => {
    const project = {
      name: 'Test Project',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      status: 'Not Started',
      project_manager: { name: 'Alice', email: 'not-an-email' }
    };
    const result = validator.validateProject(project);
    expect(result.errors.some(e => e.includes('project_manager') && e.includes('email'))).toBeTruthy();
  });

  it('should validate milestones array', () => {
    const project = {
      name: 'Test Project',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      status: 'Not Started',
      milestones: [{ name: 'Kickoff', due_date: '2026-04-01', status: 'Not Started' }]
    };
    const result = validator.validateProject(project);
    expect(result.errors.filter(e => e.includes('milestone')).length).toBe(0);
  });

  it('should reject milestone with invalid status', () => {
    const project = {
      name: 'Test Project',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      status: 'Not Started',
      milestones: [{ name: 'Kickoff', due_date: '2026-04-01', status: 'BadStatus' }]
    };
    const result = validator.validateProject(project);
    expect(result.errors.some(e => e.includes('milestone') && e.includes('status'))).toBeTruthy();
  });

  it('should validate sprints array', () => {
    const project = {
      name: 'Test Project',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      status: 'Not Started',
      sprints: [{ name: 'Sprint 1', start_date: '2026-04-01', end_date: '2026-04-14', status: 'Not Started' }]
    };
    const result = validator.validateProject(project);
    expect(result.errors.filter(e => e.includes('sprint')).length).toBe(0);
  });

  it('should validate risks array', () => {
    const project = {
      name: 'Test Project',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      status: 'Not Started',
      risks: [{ name: 'Risk A', probability: 'Low', impact: 'High', status: 'Open' }]
    };
    const result = validator.validateProject(project);
    expect(result.errors.filter(e => e.includes('risk')).length).toBe(0);
  });
});

describe('v3 Task Field Validation', () => {
  const validator = new TemplateValidator(TEMPLATE_CONFIG);

  const baseTask = {
    task_id: 1,
    task_name: 'Test Task',
    description: 'Test description',
    start_date: '2026-04-01',
    end_date: '2026-04-07',
    priority: 'High',
    status: 'Not Started',
    estimated_hours: 8,
    category_name: 'Testing'
  };

  it('should accept "In Review" as valid task status (v3)', () => {
    const task = { ...baseTask, status: 'In Review' };
    const result = validator.validateTask(task);
    expect(result.errors.filter(e => e.includes('Invalid task status')).length).toBe(0);
  });

  it('should accept "Done" as valid task status (v3)', () => {
    const task = { ...baseTask, status: 'Done' };
    const result = validator.validateTask(task);
    expect(result.errors.filter(e => e.includes('Invalid task status')).length).toBe(0);
  });

  it('should normalize "in review" to "In Review"', () => {
    expect(validator.normalizeStatus('in review')).toBe('In Review');
  });

  it('should normalize "done" to "Done"', () => {
    expect(validator.normalizeStatus('done')).toBe('Done');
  });

  it('should normalize "in_review" to "In Review"', () => {
    expect(validator.normalizeStatus('in_review')).toBe('In Review');
  });

  it('should validate valid due_date', () => {
    const task = { ...baseTask, due_date: '2026-04-07' };
    const result = validator.validateTask(task);
    expect(result.errors.filter(e => e.includes('due_date')).length).toBe(0);
  });

  it('should reject due_date before start_date', () => {
    const task = { ...baseTask, due_date: '2026-03-31' };
    const result = validator.validateTask(task);
    expect(result.errors.some(e => e.includes('due_date') && e.includes('before start_date'))).toBeTruthy();
  });

  it('should reject invalid due_date format', () => {
    const task = { ...baseTask, due_date: '07/04/2026' };
    const result = validator.validateTask(task);
    expect(result.errors.some(e => e.includes('due_date'))).toBeTruthy();
  });

  it('should accept valid complexity value', () => {
    const task = { ...baseTask, complexity: 'Medium' };
    const result = validator.validateTask(task);
    expect(result.errors.filter(e => e.includes('complexity')).length).toBe(0);
  });

  it('should reject invalid complexity value', () => {
    const task = { ...baseTask, complexity: 'Extreme' };
    const result = validator.validateTask(task);
    expect(result.errors.some(e => e.includes('complexity'))).toBeTruthy();
  });

  it('should validate reviewer object', () => {
    const task = { ...baseTask, reviewer: { name: 'Bob', email: 'bob@example.com' } };
    const result = validator.validateTask(task);
    expect(result.errors.filter(e => e.includes('reviewer')).length).toBe(0);
  });

  it('should reject reviewer with invalid email', () => {
    const task = { ...baseTask, reviewer: { name: 'Bob', email: 'not-valid' } };
    const result = validator.validateTask(task);
    expect(result.errors.some(e => e.includes('reviewer') && e.includes('email'))).toBeTruthy();
  });

  it('should validate acceptance_criteria as string array', () => {
    const task = { ...baseTask, acceptance_criteria: ['Criterion A', 'Criterion B'] };
    const result = validator.validateTask(task);
    expect(result.errors.filter(e => e.includes('acceptance_criteria')).length).toBe(0);
  });

  it('should reject acceptance_criteria with non-string items', () => {
    const task = { ...baseTask, acceptance_criteria: ['Valid', 42] };
    const result = validator.validateTask(task);
    expect(result.errors.some(e => e.includes('acceptance_criteria'))).toBeTruthy();
  });

  it('should validate subtasks array', () => {
    const task = {
      ...baseTask,
      subtasks: [{ name: 'Sub A', status: 'Not Started', estimated_hours: 2, due_date: '2026-04-03' }]
    };
    const result = validator.validateTask(task);
    expect(result.errors.filter(e => e.includes('subtask')).length).toBe(0);
  });

  it('should reject subtask missing name', () => {
    const task = { ...baseTask, subtasks: [{ status: 'Not Started' }] };
    const result = validator.validateTask(task);
    expect(result.errors.some(e => e.includes('subtask') && e.includes('name'))).toBeTruthy();
  });

  it('should validate links array', () => {
    const task = { ...baseTask, links: [{ label: 'GitHub', url: 'https://github.com' }] };
    const result = validator.validateTask(task);
    expect(result.errors.filter(e => e.includes('link')).length).toBe(0);
  });

  it('should reject link missing url', () => {
    const task = { ...baseTask, links: [{ label: 'No URL' }] };
    const result = validator.validateTask(task);
    expect(result.errors.some(e => e.includes('link') && e.includes('url'))).toBeTruthy();
  });

  it('should validate blocker_reason as string', () => {
    const task = { ...baseTask, status: 'Blocked', blocker_reason: 'Waiting for API keys' };
    const result = validator.validateTask(task);
    expect(result.errors.filter(e => e.includes('blocker_reason')).length).toBe(0);
  });

  it('should reject blocker_reason as non-string', () => {
    const task = { ...baseTask, blocker_reason: 42 };
    const result = validator.validateTask(task);
    expect(result.errors.some(e => e.includes('blocker_reason'))).toBeTruthy();
  });
});
