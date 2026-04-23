/**
 * Template Automation Tests
 * Tests for automated field population
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
/** Evaluated TEMPLATE_CONFIG loaded directly from the production config file. */
const TEMPLATE_CONFIG = getConfig();

// Load validator
const validatorContent = fs.readFileSync(path.join(__dirname, '../../public/task-engine/js/task-schema-validator.js'), 'utf8');
const getValidator = new Function('TEMPLATE_CONFIG', validatorContent + '\nreturn TemplateValidator;');
/** TemplateValidator class evaluated from the browser module in a Node test harness. */
const TemplateValidator = getValidator(TEMPLATE_CONFIG);

// Load automation
const automationContent = fs.readFileSync(path.join(__dirname, '../../public/task-engine/js/task-field-automation.js'), 'utf8');
const getAutomation = new Function('TEMPLATE_CONFIG', 'TemplateValidator', automationContent + '\nreturn TemplateAutomation;');
/** TemplateAutomation class evaluated from the browser module in a Node test harness. */
const TemplateAutomation = getAutomation(TEMPLATE_CONFIG, TemplateValidator);

/** Verify that TemplateAutomation can be instantiated with a TEMPLATE_CONFIG. */
describe('TemplateAutomation Initialization', () => {
  it('should create automation instance', () => {
    const automation = new TemplateAutomation(TEMPLATE_CONFIG);
    expect(automation).toBeTruthy();
  });

  it('should have config property', () => {
    const automation = new TemplateAutomation(TEMPLATE_CONFIG);
    expect(automation.config).toBeTruthy();
  });
});

/** Validate sequential task ID generation and gap-filling logic. */
describe('Task ID Generation', () => {
  const automation = new TemplateAutomation(TEMPLATE_CONFIG);

  it('should generate task ID starting from 1 for empty array', () => {
    const id = automation.generateTaskId([]);
    expect(id).toBe(1);
  });

  it('should generate next sequential ID', () => {
    const existingTasks = [
      { task_id: 1 },
      { task_id: 2 },
      { task_id: 3 }
    ];
    const id = automation.generateTaskId(existingTasks);
    expect(id).toBe(4);
  });

  it('should fill gaps in task IDs', () => {
    const existingTasks = [
      { task_id: 1 },
      { task_id: 3 }, // Gap at 2
      { task_id: 4 }
    ];
    const id = automation.generateTaskId(existingTasks);
    expect(id).toBe(2);
  });
});

/** Validate auto-population of individual task fields from TEMPLATE_CONFIG defaults and rules. */
describe('Auto-populate Task', () => {
  const automation = new TemplateAutomation(TEMPLATE_CONFIG);

  it('should auto-generate task_id if not provided', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test'
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.task_id).toBeTruthy();
  });

  it('should set default status to "Not Started"', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test'
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.status).toBe('Not Started');
  });

  it('should set default priority to "Medium"', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test'
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.priority).toBe('Medium');
  });

  it('should set default progress_percentage to 0', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test'
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.progress_percentage).toBe(0);
  });

  it('should auto-set created_date', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test'
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.created_date).toBeTruthy();
  });

  it('should default start_date to today and end_date to a week later', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test'
    };
    const populated = automation.autoPopulateTask(task);
    expect(typeof populated.start_date).toBe('string');
    expect(typeof populated.end_date).toBe('string');
    const start = new Date(`${populated.start_date}T00:00:00`);
    const end = new Date(`${populated.end_date}T00:00:00`);
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((end.getTime() - start.getTime()) / msPerDay);
    expect(diffDays).toBe(7);
  });

  it('should preserve provided values', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test',
      status: 'In Progress',
      priority: 'Critical'
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.status).toBe('In Progress');
    expect(populated.priority).toBe('Critical');
  });

  it('should set progress to 100 for Completed status', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test',
      status: 'Completed',
      progress_percentage: 0
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.progress_percentage).toBe(100);
  });
});

/** Validate auto-population of project-level fields. */
describe('Auto-populate Project', () => {
  const automation = new TemplateAutomation(TEMPLATE_CONFIG);

  it('should set default status for project', () => {
    const project = {
      name: 'Test Project'
    };
    const populated = automation.autoPopulateProject(project);
    expect(populated.status).toBe('Not Started');
  });

  it('should set default budget to 0', () => {
    const project = {
      name: 'Test Project'
    };
    const populated = automation.autoPopulateProject(project);
    expect(populated.budget).toBe(0);
  });
});

/** Validate worker skill matching score calculation against task requirements. */
describe('Skill Match Calculation', () => {
  const automation = new TemplateAutomation(TEMPLATE_CONFIG);

  it('should return 0 for no matching skills', () => {
    const taskTags = ['frontend', 'react'];
    const workerSkills = ['python', 'django'];
    const score = automation.calculateSkillMatch(taskTags, workerSkills);
    expect(score).toBe(0);
  });

  it('should return positive score for matching skills', () => {
    const taskTags = ['frontend', 'react'];
    const workerSkills = ['React', 'JavaScript'];
    const score = automation.calculateSkillMatch(taskTags, workerSkills);
    expect(score).toBeGreaterThan(0);
  });
});

/** Validate v3 agentic field auto-population including effort, complexity, and risk fields. */
describe('v3 Agentic Field Auto-Population', () => {
  const automation = new TemplateAutomation(TEMPLATE_CONFIG);

  it('should auto-set due_date from end_date when not provided', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test',
      end_date: '2026-04-07'
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.due_date).toBe('2026-04-07');
  });

  it('should preserve explicitly provided due_date', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test',
      start_date: '2026-04-01',
      end_date: '2026-04-07',
      due_date: '2026-04-05'
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.due_date).toBe('2026-04-05');
  });

  it('should set progress to 100 for "Done" status (v3)', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test',
      status: 'Done',
      progress_percentage: 0
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.progress_percentage).toBe(100);
  });

  it('should set completed_date for "Done" status (v3)', () => {
    const task = {
      task_name: 'Test Task',
      description: 'Test',
      status: 'Done'
    };
    const populated = automation.autoPopulateTask(task);
    expect(populated.completed_date).toBeTruthy();
  });

  it('should default subtasks to empty array', () => {
    const task = { task_name: 'Test', description: 'Test' };
    const populated = automation.autoPopulateTask(task);
    expect(Array.isArray(populated.subtasks)).toBeTruthy();
    expect(populated.subtasks.length).toBe(0);
  });

  it('should default links to empty array', () => {
    const task = { task_name: 'Test', description: 'Test' };
    const populated = automation.autoPopulateTask(task);
    expect(Array.isArray(populated.links)).toBeTruthy();
    expect(populated.links.length).toBe(0);
  });

  it('should default acceptance_criteria to empty array', () => {
    const task = { task_name: 'Test', description: 'Test' };
    const populated = automation.autoPopulateTask(task);
    expect(Array.isArray(populated.acceptance_criteria)).toBeTruthy();
    expect(populated.acceptance_criteria.length).toBe(0);
  });

  it('should default complexity to null', () => {
    const task = { task_name: 'Test', description: 'Test' };
    const populated = automation.autoPopulateTask(task);
    expect(populated.complexity).toBe(null);
  });

  it('should default reviewer to null', () => {
    const task = { task_name: 'Test', description: 'Test' };
    const populated = automation.autoPopulateTask(task);
    expect(populated.reviewer).toBe(null);
  });

  it('should default blocker_reason to null', () => {
    const task = { task_name: 'Test', description: 'Test' };
    const populated = automation.autoPopulateTask(task);
    expect(populated.blocker_reason).toBe(null);
  });

  it('should default sprint_name to null', () => {
    const task = { task_name: 'Test', description: 'Test' };
    const populated = automation.autoPopulateTask(task);
    expect(populated.sprint_name).toBe(null);
  });
});

/** Validate v3 project-level field auto-population including budget and health scores. */
describe('v3 Project Auto-Population', () => {
  const automation = new TemplateAutomation(TEMPLATE_CONFIG);

  it('should default timezone to UTC', () => {
    const project = { name: 'Test Project' };
    const populated = automation.autoPopulateProject(project);
    expect(populated.timezone).toBe('UTC');
  });

  it('should default currency to USD', () => {
    const project = { name: 'Test Project' };
    const populated = automation.autoPopulateProject(project);
    expect(populated.currency).toBe('USD');
  });

  it('should default budget_spent to 0', () => {
    const project = { name: 'Test Project' };
    const populated = automation.autoPopulateProject(project);
    expect(populated.budget_spent).toBe(0);
  });

  it('should preserve provided timezone', () => {
    const project = { name: 'Test Project', timezone: 'America/New_York' };
    const populated = automation.autoPopulateProject(project);
    expect(populated.timezone).toBe('America/New_York');
  });
});

/** Validate that validateAndFix correctly handles v3 schema fields. */
describe('validateAndFix v3 Support', () => {
  const automation = new TemplateAutomation(TEMPLATE_CONFIG);

  it('should auto-set due_date from end_date when fixing', () => {
    const task = {
      task_id: 1,
      task_name: 'Test',
      description: 'Test',
      start_date: '2026-04-01',
      end_date: '2026-04-07',
      priority: 'Medium',
      status: 'Not Started',
      estimated_hours: 4,
      category_name: 'General'
    };
    const { task: fixed, issues } = automation.validateAndFix(task);
    expect(fixed.due_date).toBe('2026-04-07');
    expect(issues.some(i => i.includes('due_date'))).toBeTruthy();
  });
});
