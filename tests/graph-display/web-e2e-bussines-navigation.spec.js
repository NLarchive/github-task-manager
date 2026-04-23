/**
 * Graph-display navigation coverage for the web-e2e-bussines project template.
 */

import { test, expect } from '@playwright/test';

/** Wait until the graph contains more than the requested number of nodes. */
async function waitForNodeCount(page, minimum) {
  const nodes = page.locator('#graph-container g.node');
  await expect.poll(async () => nodes.count(), { timeout: 20000 }).toBeGreaterThan(minimum);
  return nodes;
}

/** Validate graph navigation and sidebar drilling for the web-e2e-bussines template. */
test.describe('web-e2e-bussines graph navigation', () => {
  test('loads root project, shows global tree navigation, and drills into inline subtasks from a task node', async ({ page }) => {
    await page.goto('/graph-display/index.html?template=web-e2e-bussines-tasks&skipTour=true', {
      waitUntil: 'domcontentloaded'
    });

    await waitForNodeCount(page, 20);

    const sidebarToggle = page.locator('#modules-sidebar-toggle');
    await expect(sidebarToggle).toBeVisible();
    await sidebarToggle.click();

    const sidebar = page.locator('#modules-sidebar');
    await expect(sidebar).toHaveClass(/sidebar-open/);
    const sidebarSurface = await sidebar.evaluate((el) => {
      const styles = getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    expect(sidebarSurface.backgroundColor).toBe('rgb(220, 220, 237)');
    expect(sidebarSurface.color).toBe('rgb(51, 51, 51)');
    await expect(sidebar.locator('.modules-tree-summary', { hasText: 'src' })).toBeVisible();
    await expect(sidebar.locator('.modules-tree-summary', { hasText: 'apps' })).toBeVisible();
    await expect(sidebar.locator('.modules-tree-summary', { hasText: 'PRIVATE' })).toBeVisible();
    await expect(sidebar.locator('.modules-tree-summary').filter({ hasText: /^crm$/ })).toHaveCount(0);
    await expect(sidebar.locator('.modules-item[title="src/apps/PRIVATE/1-STRATEGY/crm/node.tasks.json"]')).toBeVisible();
    await sidebar.locator('.modules-sidebar-close').click();

    // Drill down from the graph itself using the root task node popup.
    const crmRootTask = page.locator('#graph-container g.node').filter({ hasText: 'crm app scaffold' }).first();
    await expect(crmRootTask).toBeVisible();
    await crmRootTask.click();

    const popup = page.locator('#popup');
    await expect(popup).toHaveClass(/visible/);
    const subtaskButton = popup.locator('.task-node-btn.task-node-nav-btn[data-subtasks-path]', { hasText: 'View Subtasks' });
    await expect(subtaskButton).toBeVisible();
    await subtaskButton.click();

    const breadcrumb = page.locator('#subtask-breadcrumb');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('crm app scaffold');

    await expect(page.locator('#graph-container g.node').filter({ hasText: 'Create repo + submodule' }).first()).toBeVisible();
    await expect(page.locator('#graph-container g.node').filter({ hasText: 'Create BPM + docs + tests' }).first()).toBeVisible();

    // Use the global navigation tree to jump back to the project root.
    await sidebarToggle.click();
    const rootButton = page.locator('#modules-sidebar-content .modules-root-link');
    await expect(rootButton).toBeVisible();
    await rootButton.click();

    await page.waitForLoadState('domcontentloaded');
    await waitForNodeCount(page, 20);
    await expect(page.locator('#subtask-breadcrumb')).toBeHidden();
  });
});

