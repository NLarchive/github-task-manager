/**
 * tests/playwright.config.js — web-github-task-manager
 *
 * Root Playwright configuration for all e2e and integration test suites.
 * Declares shared browser projects, timeouts, reporters, and base URL.
 */
import { defineConfig, devices } from '@playwright/test';
import os from 'os';

/**
 * Playwright Configuration for GitHub Task Manager
 * 
 * Run tests with:
 * npm run test:playwright
 * 
 * Run in UI mode:
 * npm run test:playwright:ui
 * 
 * Run with headed browser:
 * npm run test:playwright:headed
 * 
 * Run specific test file:
 * npx playwright test tests/e2e/crud-operations.spec.js --config=tests/playwright.config.js
 * 
 * Generate HTML report:
 * npm run test:playwright:report
 */

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  outputDir: './artifacts',

  // Test modes
  // - PW_FAST=1: fastest local runs (no heavy artifacts/reporters)
  // - PW_FULL=1: full browser/device matrix
  // - PLAYWRIGHT_RUN_LIVE=1: enable @live tests explicitly
  metadata: {
    PW_FAST: process.env.PW_FAST || process.env.FAST || '0',
    PW_FULL: process.env.PW_FULL || process.env.FULL || '0'
  },

  // Allow tests within a file to run in parallel when safe
  fullyParallel: true,
  
  // Test timeout
  timeout: 30000,
  
  // Global timeout
  globalTimeout: 600000,
  
  // Expect timeout
  expect: {
    timeout: 5000
  },
  
  use: {
    // Base URL for all tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${Number(process.env.PW_PORT || 3100)}/`,

    // Required for download assertions (CSV export)
    acceptDownloads: true,

    // Keep runs non-interactive by default (no popups)
    headless: process.env.PLAYWRIGHT_HEADFUL === '1' ? false : true,
    
    // Collect trace on failure (disable in fast mode)
    trace: (process.env.PW_FAST === '1' || process.env.FAST === '1') ? 'off' : 'on-first-retry',
    
    // Take screenshots on failure
    screenshot: 'only-on-failure',
    
    // Video on failure (disable in fast mode)
    video: (process.env.PW_FAST === '1' || process.env.FAST === '1') ? 'off' : 'retain-on-failure',
    
    // HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    }
  },
  
  // Reporter configuration
  // Default: no blocking report server; HTML report is generated but never auto-opened.
  reporter: (process.env.PW_FAST === '1' || process.env.FAST === '1')
    ? [['line']]
    : [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ...(process.env.CI
          ? [
              ['json', { outputFile: 'test-results/test-results.json' }],
              ['junit', { outputFile: 'test-results/test-results.xml' }]
            ]
          : [])
      ],
  
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
      command: 'node ../server.js',
        port: Number(process.env.PW_PORT || 3100),
        timeout: 120 * 1000,
        // Avoid accidentally reusing a stale dev server with different static routing.
        reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === '1',
        env: {
          PORT: String(Number(process.env.PW_PORT || 3100)),
          // Prevent E2E from mutating repo data under /public/tasksDB
          TASKS_DB_DIR: 'test-results/tasksDB-e2e'
        },
      },
  
  // Projects - Browser configurations
  // Default local/dev runs use Chromium only for speed and stability.
  // Enable full matrix with PW_FULL=1.
  projects: (process.env.PW_FULL === '1' || process.env.FULL === '1' || process.env.CI)
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
        { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
        { name: 'iPad', use: { ...devices['iPad Pro 11'] } }
      ]
    : [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 1,
  
  // Workers for parallel execution (cap locally to avoid overloading)
  workers: process.env.CI ? 1 : Math.min(4, os.cpus().length),
});
