/**
 * End-to-end checks for graph fullscreen behavior launched from list-display.
 */

import { test, expect } from '@playwright/test';

// Use the Playwright config baseURL so tests follow the configured server port.
/** Base route for the list-display app under the local Playwright server. */
const BASE_URL = '/list-display/';
/** Default timeout budget for fullscreen flow assertions in this suite. */
const TIMEOUT = 30000;

/**
 * Wait until the list-display app has rendered either tasks or the empty state.
 */
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

/** Validate entering and exiting fullscreen graph mode from list-display. */
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
    const menuToggle = frame.locator('#profile-legend-button');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false', { timeout: TIMEOUT });

    const skipTourBtn = frame.getByRole('button', { name: 'Skip Tour' });
    if (await skipTourBtn.isVisible().catch(() => false)) {
      await skipTourBtn.click();
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      if ((await menuToggle.getAttribute('aria-expanded')) === 'true') {
        break;
      }

      await menuToggle.click({ force: attempt > 0 });
    }

    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true', { timeout: TIMEOUT });

    const exitBtn = frame.locator('#exitGraphViewBtn');
    await expect(exitBtn).toBeVisible({ timeout: TIMEOUT });

    // Click the exit button inside the iframe menu
    await exitBtn.click();

    // Graph view should exit fullscreen
    await page.waitForFunction(() => {
      const gv = document.getElementById('graphView');
      return gv && (!gv.classList || !gv.classList.contains('fullscreen'));
    }, { timeout: TIMEOUT });
  });
});
