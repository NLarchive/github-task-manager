/**
 * tests/agentic-ide/playwright.config.js
 *
 * Playwright config scoped to the Agentic IDE chat integration tests.
 * Starts server.js (static file server) on an isolated port.
 * Bridge server (:3131) and llama-server (:8080) must already be running
 * for the inference tests to produce real results.
 */
import { defineConfig, devices } from '@playwright/test';

const repoRoot = process.cwd();
const PORT = Number(process.env.PW_PORT || 3202);

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',

  // LLM inference can take 30–90 seconds per turn
  timeout: 120_000,
  fullyParallel: false,
  retries: 0,

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}/`,
    headless: process.env.PLAYWRIGHT_HEADFUL !== '1',
    serviceWorkers: 'block',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'node server.js',
        cwd: repoRoot,
        port: PORT,
        timeout: 30_000,
        reuseExistingServer: true,
        env: { PORT: String(PORT) },
      },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
