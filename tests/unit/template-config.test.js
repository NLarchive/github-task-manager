/**
 * Template Config Tests
 * Tests for TEMPLATE_CONFIG structure and values
 */

// Load config for Node.js environment
const fs = require('fs');
const path = require('path');

// Read and evaluate the config file, handling browser-specific code
const configPath = path.join(__dirname, '../../public/config/template-config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace the browser-specific GH_TOKEN check
configContent = configContent.replace(
  /TOKEN: \(typeof GH_TOKEN !== 'undefined' \? GH_TOKEN : ''\)/,
  "TOKEN: ''"
);

// Execute in a function to get TEMPLATE_CONFIG
const getConfig = new Function(configContent + '\nreturn TEMPLATE_CONFIG;');
const TEMPLATE_CONFIG = getConfig();

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
});

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

  it('should have TASKS_FILE set to public/tasksDB/github-task-manager/tasks.json', () => {
    expect(GITHUB.TASKS_FILE).toBe('public/tasksDB/github-task-manager/tasks.json');
  });

  it('should resolve project config for github-task-manager', () => {
    expect(typeof GITHUB.getProjectConfig).toBe('function');
    const cfg = GITHUB.getProjectConfig('github-task-manager');
    expect(cfg).toBeTruthy();
    expect(cfg.id).toBe('github-task-manager');
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
    expect(GITHUB.getTasksFile('github-task-manager')).toBe('public/tasksDB/github-task-manager/tasks.json');
    expect(GITHUB.getTasksFile('ai-career-roadmap')).toBe('public/tasksDB/ai-career-roadmap/tasks.json');
  });
});

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
