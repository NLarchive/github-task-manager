import { test, expect } from '@playwright/test';

const TIMEOUT = 45000;

async function waitForAppReady(page) {
  await page.waitForSelector('#totalTasks', { timeout: TIMEOUT });

  await page.waitForFunction(() => {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return true;
    return overlay.style.display === 'none';
  }, { timeout: TIMEOUT });

  await page.waitForFunction(() => {
    const repoInfo = document.getElementById('repoInfo');
    const tasksInfo = document.getElementById('tasksInfo');
    const repoText = (repoInfo?.textContent || '').trim();
    const tasksText = (tasksInfo?.textContent || '').trim();
    return repoText.startsWith('Repository:') && !repoText.includes('Loading')
      && tasksText.startsWith('TasksFile:') && !tasksText.includes('Loading');
  }, { timeout: TIMEOUT });
}

test.describe('module navigation sync', () => {
  test('keeps ACME list sublists and graph subgraphs synchronized', async ({ page }) => {
    await page.goto('/?project=web-e2e-bussines');
    await waitForAppReady(page);

    await expect(page.locator('[data-testid="project-nav-shell"]')).toBeVisible();
    await expect(page.locator('#projectContextTitle')).toContainText('ACME-OS');

    await page.locator('[data-testid="project-nav-toggle"]').click();
    const navigationPanel = page.locator('[data-testid="project-nav-panel"]');
    await expect(navigationPanel).toBeVisible();
    const panelSurface = await navigationPanel.evaluate((el) => {
      const styles = getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    expect(panelSurface.backgroundColor).toBe('rgb(220, 220, 237)');
    expect(panelSurface.color).toBe('rgb(17, 24, 39)');
    await expect(navigationPanel.locator('.project-modules-summary').filter({ hasText: /^crm$/ })).toHaveCount(0);
    await expect(page.locator('.project-modules-leaf', { hasText: 'crm' }).first()).toBeVisible();

    const crmCard = page.locator('.task-card', { hasText: 'crm app scaffold' }).first();
    await expect(crmCard).toBeVisible();
    await expect(crmCard.getByRole('button', { name: 'View Sublist' })).toBeVisible();

    await crmCard.locator('.task-title').click();
    await expect(page.locator('#taskModal')).toBeVisible();
    await expect(page.locator('#modalTitle')).toHaveText('Task Details');
    await expect(page.locator('#taskName')).toHaveValue(/crm app scaffold/);
    await expect(page.locator('#taskName')).toBeDisabled();
    await expect(page.locator('#taskForm button[type="submit"]')).toBeDisabled();
    await page.locator('#taskModal .form-actions .btn-secondary').click();

    await crmCard.getByRole('button', { name: 'View Sublist' }).click();

    await expect(page.locator('#projectContextTitle')).toContainText('crm');
    await expect(page.locator('#projectContextFlow')).toContainText('strategy-hub');
    await expect(page.locator('#projectContextFlow')).toContainText('gtm-hub');
    await expect(page.locator('[data-testid="tasks-list"]')).toContainText('crm app scaffold');

    await page.getByTestId('view-graph').click();
    const frame = page.frameLocator('#graphFrame');
    await expect(frame.locator('#subtask-breadcrumb')).toBeVisible({ timeout: 20000 });
    await expect(frame.locator('#subtask-breadcrumb')).toContainText('crm');

    await frame.locator('#subtask-breadcrumb .breadcrumb-link[data-depth="-1"]').click();
    await expect(page.locator('#projectContextTitle')).toContainText('ACME-OS', { timeout: 20000 });

    await page.evaluate(() => app.setViewMode('list'));
    await expect(page.locator('#projectContextTitle')).toContainText('ACME-OS');
    await expect(page.locator('#projectContextTitle')).not.toContainText('crm app scaffold');
  });
});