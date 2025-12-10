/**
 * Template Validator Tests
 * Tests for validation logic
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
});
