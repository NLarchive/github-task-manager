import { defineConfig, devices } from '@playwright/test';
import path from 'path';
const serverCwd = path.join(process.cwd(), 'tests', 'graph-display');

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  timeout: 45000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${Number(process.env.PW_PORT || 3201)}/`,
    headless: process.env.PLAYWRIGHT_HEADFUL === '1' ? false : true,
    serviceWorkers: 'block',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'node server.js',
        cwd: serverCwd,
        port: Number(process.env.PW_PORT || 3201),
        timeout: 120 * 1000,
        reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === '1'
      },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
