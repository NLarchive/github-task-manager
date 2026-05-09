/**
 * Graph-display regression coverage for inline subtask drill-down behavior.
 */

import { test, expect } from '@playwright/test';

const PHASE_TWO_TITLE = 'Phase 2 – Core Task Management';
const DEPENDENCIES_TASK_TITLE = 'Implement Task Dependencies & Critical Path';

/** Wait until the graph contains more than the requested number of nodes. */
async function waitForNodeCount(page, minimum) {
  const nodes = page.locator('#graph-container g.node');
  await expect.poll(async () => nodes.count(), { timeout: 20000 }).toBeGreaterThan(minimum);
  return nodes;
}

/** Open the grouped Phase 2 subgraph that now contains the dependency task. */
async function openPhaseTwoSubgraph(page) {
  const phaseNode = page.locator('#graph-container g.node').filter({ hasText: PHASE_TWO_TITLE }).first();
  await expect(phaseNode).toBeVisible();
  await phaseNode.click();

  const popup = page.locator('#taskNodeModal');
  await expect(popup).toHaveClass(/visible/);
  await popup.locator('.task-node-btn[data-subtasks-path]', { hasText: 'View Subtasks' }).click();

  const breadcrumb = page.locator('#subtask-breadcrumb');
  await expect(breadcrumb).toBeVisible({ timeout: 15000 });
  await expect(breadcrumb).toContainText(PHASE_TWO_TITLE);

  return { popup, breadcrumb };
}

/** Validate inline task-subgraph drill-down and parent navigation behavior. */
test.describe('inline subtask navigation', () => {
  test('subtask task-node button opens the matching node inside the subtask graph', async ({ page }) => {
    await page.goto('/graph-display/index.html?template=github-task-manager-tasks&skipTour=true', {
      waitUntil: 'domcontentloaded'
    });

    await waitForNodeCount(page, 10);

    const { popup, breadcrumb } = await openPhaseTwoSubgraph(page);

    const rootTask = page.locator('#graph-container g.node').filter({ hasText: DEPENDENCIES_TASK_TITLE }).first();
    await expect(rootTask).toBeVisible();
    await rootTask.click();
    await expect(popup).toHaveClass(/visible/);

    const subtaskDropdown = popup.locator('.popup-dropdown').filter({ hasText: 'Sub-tasks' }).first();
    await expect(subtaskDropdown).toBeVisible();
    await subtaskDropdown.locator('summary').click();

    const subtaskBtn = subtaskDropdown.locator('.task-node-btn').filter({ hasText: 'Implement circular dependency validator' }).first();
    await expect(subtaskBtn).toBeVisible();
    await subtaskBtn.click();

    await expect(breadcrumb).toBeVisible({ timeout: 15000 });
    await expect(breadcrumb).toContainText(DEPENDENCIES_TASK_TITLE);

    await expect(popup).toHaveClass(/visible/, { timeout: 15000 });
    await expect(popup.locator('h2')).toContainText('Implement circular dependency validator');
    await expect(popup).toContainText('Build task dependency graph traversal');

    const selectedNode = page.locator('#graph-container g.node.details-shown-for').filter({ hasText: 'Implement circular dependency validator' }).first();
    await expect(selectedNode).toBeVisible();
  });

  test('drills recursively through nested inline subtasks', async ({ page }) => {
    await page.goto('/graph-display/index.html?template=github-task-manager-tasks&skipTour=true', {
      waitUntil: 'domcontentloaded'
    });

    await waitForNodeCount(page, 10);

    const { popup, breadcrumb } = await openPhaseTwoSubgraph(page);

    const rootTask = page.locator('#graph-container g.node').filter({ hasText: DEPENDENCIES_TASK_TITLE }).first();
    await expect(rootTask).toBeVisible();
    await rootTask.click();
    await expect(popup).toHaveClass(/visible/);
    await expect(popup).toContainText('Build dependency type UI (FS/SS/FF/SF)');

    const firstDiveButton = popup.locator('.task-node-btn[data-subtasks-path]', { hasText: 'View Subtasks' });
    await expect(firstDiveButton).toBeVisible();
    await firstDiveButton.click();

    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText(DEPENDENCIES_TASK_TITLE);
    await expect(page.locator('#graph-container g.node').filter({ hasText: 'Implement circular dependency validator' }).first()).toBeVisible();

    const nestedTask = page.locator('#graph-container g.node').filter({ hasText: 'Implement circular dependency validator' }).first();
    await nestedTask.click();

    await expect(popup).toHaveClass(/visible/);
    await expect(popup).toContainText('Build task dependency graph traversal');

    const secondDiveButton = popup.locator('.task-node-btn[data-subtasks-path]', { hasText: 'View Subtasks' });
    await expect(secondDiveButton).toBeVisible();
    await secondDiveButton.click();

    await expect(breadcrumb).toContainText('Implement circular dependency validator');
    await expect(page.locator('#graph-container g.node').filter({ hasText: 'Build task dependency graph traversal' }).first()).toBeVisible();
    await expect(page.locator('#graph-container g.node').filter({ hasText: 'Add cycle detection algorithm' }).first()).toBeVisible();
  });

  test('start node shows parent nav button that navigates back to parent', async ({ page }) => {
    await page.goto('/graph-display/index.html?template=github-task-manager-tasks&skipTour=true', {
      waitUntil: 'domcontentloaded'
    });

    await waitForNodeCount(page, 10);

    await openPhaseTwoSubgraph(page);

    // Drill into a task with subtasks
    const task = page.locator('#graph-container g.node').filter({ hasText: DEPENDENCIES_TASK_TITLE }).first();
    await expect(task).toBeVisible();
    await task.click();

    const popup = page.locator('#taskNodeModal');
    await expect(popup).toHaveClass(/visible/);
    const diveBtn = popup.locator('.task-node-btn[data-subtasks-path]', { hasText: 'View Subtasks' });
    await diveBtn.click();

    // Wait for subgraph to load
    await expect(page.locator('#subtask-breadcrumb')).toBeVisible({ timeout: 10000 });

    // Now inside subgraph — click the start node
    const startNode = page.locator('#graph-container g.node').filter({ hasText: /^Start:/ }).first();
    await expect(startNode).toBeVisible({ timeout: 10000 });
    await startNode.click();

    await expect(popup).toHaveClass(/visible/);
    // Start node should show a parent-nav-btn with the parent task name
    const parentBtn = popup.locator('.task-node-btn.parent-nav-btn');
    await expect(parentBtn).toBeVisible();
    await expect(parentBtn).toContainText(DEPENDENCIES_TASK_TITLE);

    // Click it — should navigate back to parent graph
    await parentBtn.click();

    // Wait for the immediate parent graph to render again.
    const breadcrumb = page.locator('#subtask-breadcrumb');
    await expect(breadcrumb).toBeVisible({ timeout: 15000 });
    await expect(breadcrumb).toContainText(PHASE_TWO_TITLE);
    await expect(breadcrumb).not.toContainText(DEPENDENCIES_TASK_TITLE);

    // After navigation back, the parent graph should load with the Phase 2 task nodes.
    await expect(page.locator('#graph-container g.node').filter({ hasText: DEPENDENCIES_TASK_TITLE }).first()).toBeVisible({ timeout: 15000 });

    // The parent task modal should auto-open after stabilization (allow generous timeout).
    await expect(popup).toHaveClass(/visible/, { timeout: 25000 });
    await expect(popup.locator('h2')).toContainText(DEPENDENCIES_TASK_TITLE);
  });

  test('no Task Sub-graphs folder appears in sidebar', async ({ page }) => {
    await page.goto('/graph-display/index.html?template=github-task-manager-tasks&skipTour=true', {
      waitUntil: 'domcontentloaded'
    });

    await waitForNodeCount(page, 10);

    // Check sidebar does not contain Task Sub-graphs
    const sidebar = page.locator('#modules-sidebar');
    if (await sidebar.isVisible()) {
      await expect(sidebar).not.toContainText('Task Sub-graphs');
    }
  });
});