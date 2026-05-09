/**
 * Realistic local-project regression: context rendering + local CRUD flow.
 */

import { test, expect } from '@playwright/test';

const TIMEOUT = 30000;

async function waitForAppReady(page) {
  await page.waitForSelector('#totalTasks', { timeout: TIMEOUT });
  await page.waitForFunction(() => {
    const overlay = document.getElementById('loadingOverlay');
    return !overlay || overlay.style.display === 'none';
  }, { timeout: TIMEOUT });
}

test.describe('local project editing parity', () => {
  test('supports create/edit/delete on local project', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/?project=test');
    await waitForAppReady(page);

    const projectSelect = page.locator('#projectSelect');
    await projectSelect.selectOption('test');
    await waitForAppReady(page);

    const taskName = `Local CRUD ${Date.now()}`;

    await page.getByRole('button', { name: '+ Add New Task' }).click();
    await page.locator('#taskEditModal').waitFor({ state: 'visible', timeout: TIMEOUT });
    await page.locator('#taskName').fill(taskName);
    await page.locator('#taskDescription').fill('Created by local project CRUD regression');
    await page.locator('#taskStartDate').fill('2026-04-24');
    await page.locator('#taskEndDate').fill('2026-04-25');
    await page.locator('#taskEstimatedHours').fill('2');
    await page.locator('#taskTags').fill('local,e2e');
    await page.locator('#taskForm button[type="submit"]').click();

    await expect(page.locator('#toast')).toContainText('Tasks saved successfully', { timeout: TIMEOUT });
    await waitForAppReady(page);

    const createdCard = page.locator('.task-card', { hasText: taskName }).first();
    await expect(createdCard).toBeVisible({ timeout: TIMEOUT });

    await createdCard.locator('button:has-text("Edit")').click();
    await page.locator('#taskEditModal').waitFor({ state: 'visible', timeout: TIMEOUT });
    await page.locator('#taskDescription').fill('Edited in local CRUD regression');
    await page.locator('#taskForm button[type="submit"]').click();

    await expect(page.locator('#toast')).toContainText('Tasks saved successfully', { timeout: TIMEOUT });
    await waitForAppReady(page);
    await expect(page.locator('.task-card', { hasText: 'Edited in local CRUD regression' }).first()).toBeVisible({ timeout: TIMEOUT });

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('.task-card', { hasText: taskName }).first().locator('button:has-text("Delete")').click();

    await expect(page.locator('#toast')).toContainText('Tasks saved successfully', { timeout: TIMEOUT });
    await waitForAppReady(page);
    await expect(page.locator('.task-card', { hasText: taskName })).toHaveCount(0);
  });
});
