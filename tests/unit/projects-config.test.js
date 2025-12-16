/**
 * Projects Config Tests
 * Verify that a centralized PROJECTS_CONFIG is loaded and applied to TEMPLATE_CONFIG
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../public/config/template-config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace browser-specific GH_TOKEN with an empty token for test environment
configContent = configContent.replace(/TOKEN: \(typeof GH_TOKEN !== 'undefined' \? GH_TOKEN : ''\)/, "TOKEN: ''");

// Inject a PROJECTS_CONFIG global before the config executes
const injectedProjects = [
  {
    id: 'test-project',
    label: 'Test Project',
    owner: 'example',
    repo: 'test-repo',
    branch: 'dev',
    tasksRoot: 'test/tasksDB'
  }
];

const prefix = `var PROJECTS_CONFIG = ${JSON.stringify(injectedProjects)};\n`;

const getConfig = new Function(prefix + configContent + '\nreturn TEMPLATE_CONFIG;');
const TEMPLATE_CONFIG = getConfig();

describe('PROJECTS_CONFIG override', () => {
  it('should use PROJECTS_CONFIG to populate GITHUB.PROJECTS', () => {
    expect(Array.isArray(TEMPLATE_CONFIG.GITHUB.PROJECTS)).toBeTruthy();
    const found = TEMPLATE_CONFIG.GITHUB.PROJECTS.find(p => p && p.id === 'test-project');
    expect(found).toBeTruthy();
    expect(found.owner).toBe('example');
    expect(found.repo).toBe('test-repo');
  });

  it('getProjectConfig should resolve the injected project', () => {
    const cfg = TEMPLATE_CONFIG.GITHUB.getProjectConfig('test-project');
    expect(cfg).toBeTruthy();
    expect(cfg.id).toBe('test-project');
    expect(cfg.owner).toBe('example');
    expect(cfg.repo).toBe('test-repo');
    expect(cfg.branch).toBe('dev');
    expect(cfg.tasksRoot).toBe('test/tasksDB');
  });
});
