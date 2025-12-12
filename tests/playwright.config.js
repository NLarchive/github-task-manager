import { defineConfig, devices } from '@playwright/test';
import os from 'os';

/**
 * Playwright Configuration for GitHub Task Manager
 * 
 * Run tests with:
 * npx playwright test
 * 
 * Run in UI mode:
 * npx playwright test --ui
 * 
 * Run with headed browser:
 * npx playwright test --headed
 * 
 * Run specific test file:
 * npx playwright test tests/playwright/crud-operations.spec.js
 * 
 * Generate HTML report:
 * npx playwright test --reporter=html
 */

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  outputDir: './artifacts',

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
  
  // Fail on console errors
  use: {
    // Base URL for all tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000/',

    // Required for download assertions (CSV export)
    acceptDownloads: true,
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Take screenshots on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    }
  },
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/test-results.xml' }],
    ['list']
  ],
  
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'cd .. && node server.js',
        port: 3000,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
        env: {
          // Prevent E2E from mutating repo data under /public/tasksDB
          TASKS_DB_DIR: 'test-results/tasksDB-e2e'
        },
      },
  
  // Projects - Browser configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablet testing
    {
      name: 'iPad',
      use: { ...devices['iPad Pro 11'] },
    },
  ],
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 0,
  
  // Workers for parallel execution (cap locally to avoid overloading)
  workers: process.env.CI ? 1 : Math.min(4, os.cpus().length),
});
