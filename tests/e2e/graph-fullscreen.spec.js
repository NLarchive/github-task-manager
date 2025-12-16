import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000/';
const TIMEOUT = 30000;

async function waitForAppReady(page) {
  await page.waitForSelector('[id="totalTasks"]', { timeout: TIMEOUT });
  await page.waitForFunction(() => {
    const list = document.getElementById('tasksList');
    const empty = document.getElementById('emptyState');
    if (!list || !empty) return false;
    const hasTasks = (list.children && list.children.length > 0);
    const emptyVisible = (empty.style && empty.style.display !== 'none');
    return hasTasks || emptyVisible;
  }, { timeout: 30000 });
}

test.describe('Graph Fullscreen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);
  });

  test('toggles fullscreen graph view and exit button', async ({ page }) => {
    // Click Graph view toggle
    await page.click('button[data-testid="view-graph"]', { timeout: TIMEOUT }).catch(() => {});
    // Some environments may not use data-testid on button; fallback to text
    if (!(await page.locator('#graphView').isVisible())) {
      await page.click('button:has-text("🕸️ Graph")');
    }

    // Wait for graphView to be visible
    await page.waitForSelector('#graphView', { timeout: TIMEOUT });

    // Ensure class 'fullscreen' is present on #graphView
    await page.waitForFunction(() => {
      const gv = document.getElementById('graphView');
      return gv && gv.classList && gv.classList.contains('fullscreen');
    }, { timeout: TIMEOUT });

    // Open the menu inside the graph iframe to access the exit button (we moved it into the menu panel)
    const frame = page.frameLocator('#graphFrame');
    await frame.locator('#profile-legend-button').click();
    await frame.locator('#menu-panel.menu-open').waitFor({ timeout: TIMEOUT });

    const exitBtn = frame.locator('#exitGraphViewBtn');
    await expect(exitBtn).toBeVisible();

    // Click the exit button inside the iframe menu
    await exitBtn.click();

    // Graph view should exit fullscreen
    await page.waitForFunction(() => {
      const gv = document.getElementById('graphView');
      return gv && (!gv.classList || !gv.classList.contains('fullscreen'));
    }, { timeout: TIMEOUT });
  });
});
