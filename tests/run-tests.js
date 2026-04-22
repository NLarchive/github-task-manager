/**
 * Test Runner for GitHub Task Manager
 * Runs all component tests and reports results
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Minimal async-capable test framework (queue tests, then execute sequentially)
const queuedTests = [];
const suiteStack = [];

global.describe = (name, fn) => {
  suiteStack.push(name);
  try {
    fn();
  } finally {
    suiteStack.pop();
  }
};

global.it = (name, fn) => {
  queuedTests.push({
    suite: [...suiteStack],
    name,
    fn
  });
};

global.expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  },
  toEqual: (expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`);
    }
  },
  toBeFalsy: () => {
    if (actual) {
      throw new Error(`Expected falsy value but got ${JSON.stringify(actual)}`);
    }
  },
  toContain: (expected) => {
    if (!actual.includes(expected)) {
      throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
    }
  },
  toMatch: (expected) => {
    if (expected instanceof RegExp) {
      if (!expected.test(String(actual))) {
        throw new Error(`Expected ${JSON.stringify(actual)} to match ${expected.toString()}`);
      }
      return;
    }
    if (!String(actual).includes(String(expected))) {
      throw new Error(`Expected ${JSON.stringify(actual)} to match ${JSON.stringify(expected)}`);
    }
  },
  toHaveLength: (expected) => {
    if (actual.length !== expected) {
      throw new Error(`Expected length ${expected} but got ${actual.length}`);
    }
  },
  toBeGreaterThan: (expected) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toBeInstanceOf: (expected) => {
    if (!(actual instanceof expected)) {
      throw new Error(`Expected instance of ${expected.name}`);
    }
  },
  toThrow: () => {
    try {
      actual();
      throw new Error('Expected function to throw');
    } catch (e) {
      if (e.message === 'Expected function to throw') throw e;
    }
  },
  not: {
    toBe: (expected) => {
      if (actual === expected) {
        throw new Error(`Expected ${JSON.stringify(actual)} not to be ${JSON.stringify(expected)}`);
      }
    },
    toContain: (expected) => {
      if (actual.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} not to contain ${JSON.stringify(expected)}`);
      }
    }
  }
});

// Run tests
console.log(`${colors.blue}🧪 GitHub Task Manager - Test Suite${colors.reset}`);
console.log('='.repeat(50));

async function main() {
  // Load test files (they register tests into the queue)
  const testFiles = [
    'graph-data.test.js',
    'folder-project-service.test.js',
    'calendar-parser.test.js',
    ['tasks-template-config.test.js', 'template-config.test.js'],
    'template-validator.test.js',
    'template-automation.test.js',
    'task-database.test.js',
    'server-api.test.js',
    'tasks-json-format.test.js'
  ];

  testFiles.forEach((fileEntry) => {
    const candidates = Array.isArray(fileEntry) ? fileEntry : [fileEntry];
    const resolvedFile = candidates.find((candidate) => fs.existsSync(path.join(__dirname, 'unit', candidate)));

    if (resolvedFile) {
      require(path.join(__dirname, 'unit', resolvedFile));
    } else {
      console.log(`${colors.yellow}⚠ Test file not found: ${candidates[0]}${colors.reset}`);
    }
  });

  // Execute tests
  let lastSuite = null;
  for (const t of queuedTests) {
    const suiteName = (t.suite || []).join(' / ') || 'Root';
    if (suiteName !== lastSuite) {
      console.log(`\n${colors.cyan}📦 ${suiteName}${colors.reset}`);
      lastSuite = suiteName;
    }

    try {
      const ret = t.fn();
      if (ret && typeof ret.then === 'function') {
        await ret;
      }
      results.passed++;
      results.tests.push({ name: `${suiteName} :: ${t.name}`, passed: true });
      console.log(`  ${colors.green}✓${colors.reset} ${t.name}`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name: `${suiteName} :: ${t.name}`, passed: false, error: error && error.message ? error.message : String(error) });
      console.log(`  ${colors.red}✗${colors.reset} ${t.name}`);
      console.log(`    ${colors.red}${error && error.message ? error.message : String(error)}${colors.reset}`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.blue}📊 Test Summary${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`  Total: ${results.passed + results.failed}`);

  if (results.failed > 0) {
    console.log(`\n${colors.red}❌ Some tests failed!${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}✅ All tests passed!${colors.reset}`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(`${colors.red}Fatal test runner error:${colors.reset}`, err);
  process.exit(1);
});
