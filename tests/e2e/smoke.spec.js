/**
 * Smoke tests: app boot and basic create task flow.
 *
 * Verifies the app loads, initializes config, and can create a task locally.
 * Steps:
 *  - Wait for app ready signals and loading overlay to hide
 *  - Unlock access if the repo is locked
 *  - Open the "Add New Task" modal and submit a new task
 *  - Assert success toast and that total task count increases
 *
 * Tagged with '@smoke' and intended to be quick and resilient.
 */
import { test, expect } from '@playwright/test';

const TIMEOUT = 30000;

async function waitForAppReady(page) {
  await page.waitForSelector('#totalTasks', { timeout: TIMEOUT });

  // loadTasks() always ends by hiding the overlay; wait for that as the primary signal.
  await page.waitForFunction(() => {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return true;
    return overlay.style.display === 'none';
  }, { timeout: TIMEOUT });

  // Ensure the app has initialized config and populated the debug info.
  await page.waitForFunction(() => {
    const repoInfo = document.getElementById('repoInfo');
    const tasksInfo = document.getElementById('tasksInfo');
    const repoText = (repoInfo?.textContent || '').trim();
    const tasksText = (tasksInfo?.textContent || '').trim();
    return repoText.startsWith('Repository:') && !repoText.includes('Loading')
      && tasksText.startsWith('TasksFile:') && !tasksText.includes('Loading');
  }, { timeout: TIMEOUT });
}

async function unlockIfNeeded(page) {
  const lockedIndicator = page.locator('.auth-indicator.locked');
  const isLocked = await lockedIndicator.isVisible().catch(() => false);
  if (!isLocked) return;

  await lockedIndicator.click();
  await page.waitForSelector('#passwordModal', { state: 'visible', timeout: TIMEOUT });
  await page.locator('#accessPassword').fill(process.env.E2E_PASSWORD || '1324');
  await page.locator('#passwordModal button[type="submit"]').click();
  await page.waitForSelector('#passwordModal', { state: 'hidden', timeout: TIMEOUT });
  await page.locator('.auth-indicator.unlocked').waitFor({ timeout: TIMEOUT });
}

test.describe('@smoke app boot + create task', () => {
  test('loads and can create a task locally', async ({ page }) => {
    if (process.env.E2E_DEBUG === '1') {
      page.on('pageerror', (err) => {
        // eslint-disable-next-line no-console
        console.log('[pageerror]', err && err.message ? err.message : String(err));
      });
      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          // eslint-disable-next-line no-console
          console.log(`[console:${msg.type()}]`, msg.text());
        }
      });
      page.on('requestfailed', (request) => {
        // eslint-disable-next-line no-console
        console.log('[requestfailed]', request.url(), request.failure()?.errorText || '');
      });
      page.on('response', (response) => {
        const status = response.status();
        if (status >= 400) {
          // eslint-disable-next-line no-console
          console.log('[response]', status, response.url());
        }
      });
    }

    await page.goto('/');
    await waitForAppReady(page);

    await unlockIfNeeded(page);

    const totalBefore = await page.locator('#totalTasks').innerText();

    await page.getByRole('button', { name: '+ Add New Task' }).click();
    await page.locator('#taskModal').waitFor({ state: 'visible', timeout: TIMEOUT });

    const name = `Smoke Task ` + Math.random().toString(36).slice(2,8);
    await page.locator('#taskName').fill(name);
    await page.locator('#taskDescription').fill('Smoke test task');
    await page.locator('#taskStartDate').fill('2025-12-14');
    await page.locator('#taskEndDate').fill('2025-12-15');
    await page.locator('#taskEstimatedHours').fill('1');
    await page.locator('#taskTags').fill('e2e-test');
    await page.locator('#taskForm button[type="submit"]').click();

    const toast = page.locator('#toast');
    await toast.waitFor({ state: 'visible', timeout: TIMEOUT });
    await expect(toast).toContainText('Tasks saved successfully');

    await waitForAppReady(page);
    const totalAfter = await page.locator('#totalTasks').innerText();
    expect(Number(totalAfter)).toBeGreaterThan(Number(totalBefore));
  });
});
