/**
 * Template Config Tests
 * Tests for TEMPLATE_CONFIG structure and values
 */

// Load config for Node.js environment
const fs = require('fs');
const path = require('path');

// Read and evaluate the config file, handling browser-specific code
const configPath = path.join(__dirname, '../../public/config/tasks-template-config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace the browser-specific GH_TOKEN check
configContent = configContent.replace(
  /TOKEN: \(typeof GH_TOKEN !== 'undefined' \? GH_TOKEN : ''\)/,
  "TOKEN: ''"
);

// Execute in a function to get TEMPLATE_CONFIG
const getConfig = new Function(configContent + '\nreturn TEMPLATE_CONFIG;');
/** Evaluated TEMPLATE_CONFIG loaded directly from the production config file. */
const TEMPLATE_CONFIG = getConfig();

/** Verify that TEMPLATE_CONFIG exposes all mandatory top-level keys and metadata. */
describe('TEMPLATE_CONFIG Structure', () => {
  it('should have version property', () => {
    expect(TEMPLATE_CONFIG.version).toBeTruthy();
  });

  it('should have template_type property', () => {
    expect(TEMPLATE_CONFIG.template_type).toBe('project_task_template');
  });

  it('should have FIELD_CATEGORIES object', () => {
    expect(TEMPLATE_CONFIG.FIELD_CATEGORIES).toBeTruthy();
  });

  it('should have ENUMS object', () => {
    expect(TEMPLATE_CONFIG.ENUMS).toBeTruthy();
  });

  it('should have REQUIRED_FIELDS object', () => {
    expect(TEMPLATE_CONFIG.REQUIRED_FIELDS).toBeTruthy();
  });

  it('should have GITHUB config object', () => {
    expect(TEMPLATE_CONFIG.GITHUB).toBeTruthy();
  });
});

/** Validate FIELD_CATEGORIES arrays for automatic, required, and optional input fields. */
describe('FIELD_CATEGORIES', () => {
  const { FIELD_CATEGORIES } = TEMPLATE_CONFIG;

  it('should have AUTOMATIC fields array', () => {
    expect(Array.isArray(FIELD_CATEGORIES.AUTOMATIC)).toBeTruthy();
  });

  it('should include task_id in AUTOMATIC fields', () => {
    expect(FIELD_CATEGORIES.AUTOMATIC).toContain('task_id');
  });

  it('should include created_date in AUTOMATIC fields', () => {
    expect(FIELD_CATEGORIES.AUTOMATIC).toContain('created_date');
  });

  it('should have REQUIRED_INPUT fields array', () => {
    expect(Array.isArray(FIELD_CATEGORIES.REQUIRED_INPUT)).toBeTruthy();
  });

  it('should include task_name in REQUIRED_INPUT fields', () => {
    expect(FIELD_CATEGORIES.REQUIRED_INPUT).toContain('task_name');
  });

  it('should include description in REQUIRED_INPUT fields', () => {
    expect(FIELD_CATEGORIES.REQUIRED_INPUT).toContain('description');
  });

  it('should have OPTIONAL_INPUT fields array', () => {
    expect(Array.isArray(FIELD_CATEGORIES.OPTIONAL_INPUT)).toBeTruthy();
  });

  it('should include tags in OPTIONAL_INPUT fields', () => {
    expect(FIELD_CATEGORIES.OPTIONAL_INPUT).toContain('tags');
  });
});

/** Validate that ENUMS covers all required status, priority, and v3 extension values. */
describe('ENUMS Validation', () => {
  const { ENUMS } = TEMPLATE_CONFIG;

  it('should have valid PROJECT_STATUS values', () => {
    expect(ENUMS.PROJECT_STATUS).toContain('Not Started');
    expect(ENUMS.PROJECT_STATUS).toContain('In Progress');
    expect(ENUMS.PROJECT_STATUS).toContain('Completed');
  });

  it('should have valid TASK_STATUS values', () => {
    expect(ENUMS.TASK_STATUS).toContain('Not Started');
    expect(ENUMS.TASK_STATUS).toContain('In Progress');
    expect(ENUMS.TASK_STATUS).toContain('Blocked');
    expect(ENUMS.TASK_STATUS).toContain('Completed');
  });

  it('should have valid TASK_PRIORITY values', () => {
    expect(ENUMS.TASK_PRIORITY).toContain('Low');
    expect(ENUMS.TASK_PRIORITY).toContain('Medium');
    expect(ENUMS.TASK_PRIORITY).toContain('High');
    expect(ENUMS.TASK_PRIORITY).toContain('Critical');
  });

  it('should have valid DEPENDENCY_TYPES', () => {
    expect(ENUMS.DEPENDENCY_TYPES).toContain('FS');
    expect(ENUMS.DEPENDENCY_TYPES).toContain('SS');
    expect(ENUMS.DEPENDENCY_TYPES).toContain('FF');
    expect(ENUMS.DEPENDENCY_TYPES).toContain('SF');
  });

  it('should have "In Review" in TASK_STATUS (v3)', () => {
    expect(ENUMS.TASK_STATUS).toContain('In Review');
  });

  it('should have "Done" in TASK_STATUS (v3)', () => {
    expect(ENUMS.TASK_STATUS).toContain('Done');
  });

  it('should have "Planning" in PROJECT_STATUS (v3)', () => {
    expect(ENUMS.PROJECT_STATUS).toContain('Planning');
  });

  it('should have COMPLEXITY enum (v3)', () => {
    expect(Array.isArray(ENUMS.COMPLEXITY)).toBeTruthy();
    expect(ENUMS.COMPLEXITY).toContain('Low');
    expect(ENUMS.COMPLEXITY).toContain('Medium');
    expect(ENUMS.COMPLEXITY).toContain('High');
    expect(ENUMS.COMPLEXITY).toContain('Very Low');
    expect(ENUMS.COMPLEXITY).toContain('Very High');
  });

  it('should have RISK_STATUS enum (v3)', () => {
    expect(Array.isArray(ENUMS.RISK_STATUS)).toBeTruthy();
    expect(ENUMS.RISK_STATUS).toContain('Open');
    expect(ENUMS.RISK_STATUS).toContain('Mitigated');
    expect(ENUMS.RISK_STATUS).toContain('Closed');
  });

  it('should have MILESTONE_STATUS enum (v3)', () => {
    expect(Array.isArray(ENUMS.MILESTONE_STATUS)).toBeTruthy();
    expect(ENUMS.MILESTONE_STATUS).toContain('Achieved');
    expect(ENUMS.MILESTONE_STATUS).toContain('Missed');
  });

  it('should have SPRINT_STATUS enum (v3)', () => {
    expect(Array.isArray(ENUMS.SPRINT_STATUS)).toBeTruthy();
    expect(ENUMS.SPRINT_STATUS).toContain('Active');
  });

  it('should have WORKER_ROLE enum (v3)', () => {
    expect(Array.isArray(ENUMS.WORKER_ROLE)).toBeTruthy();
    expect(ENUMS.WORKER_ROLE).toContain('Developer');
    expect(ENUMS.WORKER_ROLE).toContain('QA Engineer');
  });
});

/** Validate v3 task and project default values are correct types and initial states. */
describe('v3 Defaults', () => {
  it('should have due_date default as null in TASK defaults', () => {
    expect(TEMPLATE_CONFIG.DEFAULTS.TASK.due_date).toBe(null);
  });

  it('should have subtasks default as empty array in TASK defaults', () => {
    expect(Array.isArray(TEMPLATE_CONFIG.DEFAULTS.TASK.subtasks)).toBeTruthy();
    expect(TEMPLATE_CONFIG.DEFAULTS.TASK.subtasks.length).toBe(0);
  });

  it('should have links default as empty array in TASK defaults', () => {
    expect(Array.isArray(TEMPLATE_CONFIG.DEFAULTS.TASK.links)).toBeTruthy();
  });

  it('should have acceptance_criteria default as empty array in TASK defaults', () => {
    expect(Array.isArray(TEMPLATE_CONFIG.DEFAULTS.TASK.acceptance_criteria)).toBeTruthy();
  });

  it('should have timezone default as UTC in PROJECT defaults', () => {
    expect(TEMPLATE_CONFIG.DEFAULTS.PROJECT.timezone).toBe('UTC');
  });

  it('should have currency default as USD in PROJECT defaults', () => {
    expect(TEMPLATE_CONFIG.DEFAULTS.PROJECT.currency).toBe('USD');
  });

  it('should have budget_spent default as 0 in PROJECT defaults', () => {
    expect(TEMPLATE_CONFIG.DEFAULTS.PROJECT.budget_spent).toBe(0);
  });
});

/** Validate that v3 optional task fields are registered in OPTIONAL_FIELDS and FIELD_CATEGORIES. */
describe('v3 Optional Fields', () => {
  it('should include due_date in OPTIONAL_FIELDS.TASK', () => {
    expect(TEMPLATE_CONFIG.OPTIONAL_FIELDS.TASK).toContain('due_date');
  });

  it('should include subtasks in OPTIONAL_FIELDS.TASK', () => {
    expect(TEMPLATE_CONFIG.OPTIONAL_FIELDS.TASK).toContain('subtasks');
  });

  it('should include links in OPTIONAL_FIELDS.TASK', () => {
    expect(TEMPLATE_CONFIG.OPTIONAL_FIELDS.TASK).toContain('links');
  });

  it('should include acceptance_criteria in OPTIONAL_FIELDS.TASK', () => {
    expect(TEMPLATE_CONFIG.OPTIONAL_FIELDS.TASK).toContain('acceptance_criteria');
  });

  it('should include due_date in OPTIONAL_INPUT field categories', () => {
    expect(TEMPLATE_CONFIG.FIELD_CATEGORIES.OPTIONAL_INPUT).toContain('due_date');
  });
});

/** Validate that STATUS_NORMALIZATION maps lowercase and underscore variants to canonical v3 values. */
describe('STATUS_NORMALIZATION v3', () => {
  it('should have "in review" normalization', () => {
    expect(TEMPLATE_CONFIG.STATUS_NORMALIZATION['in review']).toBe('In Review');
  });

  it('should have "in_review" normalization', () => {
    expect(TEMPLATE_CONFIG.STATUS_NORMALIZATION['in_review']).toBe('In Review');
  });

  it('should have "done" normalization to "Done"', () => {
    expect(TEMPLATE_CONFIG.STATUS_NORMALIZATION['done']).toBe('Done');
  });
});

/** Validate the GITHUB configuration block for owner, repo, branch, and project resolver methods. */
describe('GITHUB Configuration', () => {
  const { GITHUB } = TEMPLATE_CONFIG;

  it('should have OWNER set to nlarchive', () => {
    expect(GITHUB.OWNER).toBe('nlarchive');
  });

  it('should have REPO set to github-task-manager', () => {
    expect(GITHUB.REPO).toBe('github-task-manager');
  });

  it('should have BRANCH set to main', () => {
    expect(GITHUB.BRANCH).toBe('main');
  });

  it('should have TASKS_FILE set to public/tasksDB/external/github-task-manager/node.tasks.json', () => {
    expect(GITHUB.TASKS_FILE).toBe('public/tasksDB/external/github-task-manager/node.tasks.json');
  });

  it('should resolve project config for github-task-manager', () => {
    expect(typeof GITHUB.getProjectConfig).toBe('function');
    const cfg = GITHUB.getProjectConfig('github-task-manager');
    expect(cfg).toBeTruthy();
    expect(cfg.id).toBe('github-task-manager');
    expect(cfg.scope).toBe('external');
    expect(cfg.owner).toBe('nlarchive');
    expect(cfg.repo).toBe('github-task-manager');
    expect(cfg.branch).toBe('main');
    expect(cfg.tasksRoot).toBe('public/tasksDB');
  });

  it('should resolve project config for ai-career-roadmap', () => {
    const cfg = GITHUB.getProjectConfig('ai-career-roadmap');
    expect(cfg).toBeTruthy();
    expect(cfg.id).toBe('ai-career-roadmap');
    expect(cfg.owner).toBe('nlarchive');
    expect(cfg.repo).toBe('github-task-manager');
    expect(cfg.branch).toBe('main');
    expect(cfg.tasksRoot).toBe('public/tasksDB');
  });

  it('should compute tasks file per project root', () => {
    expect(typeof GITHUB.getTasksFile).toBe('function');
    expect(GITHUB.getTasksFile('github-task-manager')).toBe('public/tasksDB/external/github-task-manager/node.tasks.json');
    expect(GITHUB.getTasksFile('ai-career-roadmap')).toBe('public/tasksDB/external/ai-career-roadmap/node.tasks.json');
  });
});

/** Validate that the CATEGORIES list is populated with the expected category names. */
describe('CATEGORIES List', () => {
  it('should have CATEGORIES array', () => {
    expect(Array.isArray(TEMPLATE_CONFIG.CATEGORIES)).toBeTruthy();
  });

  it('should have at least 5 categories', () => {
    expect(TEMPLATE_CONFIG.CATEGORIES.length).toBeGreaterThan(4);
  });

  it('should include common categories', () => {
    expect(TEMPLATE_CONFIG.CATEGORIES).toContain('Frontend Development');
    expect(TEMPLATE_CONFIG.CATEGORIES).toContain('Backend Development');
    expect(TEMPLATE_CONFIG.CATEGORIES).toContain('Testing');
  });
});

