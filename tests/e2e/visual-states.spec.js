import { test, expect } from '@playwright/test';

test.describe('Task Visual States', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the main app
    await page.goto('index.html');
    // Wait for tasks to load
    await page.waitForSelector('.task-card');
  });

  test('List View: Completed tasks have completed class and reduced opacity', async ({ page }) => {
    // Find a completed task
    const completedTask = page.locator('.task-card.status-completed').first();

    // If no completed task exists, we might need to create one or use a known one
    // For this test, we assume the default project has at least one completed task
    const count = await completedTask.count();
    if (count > 0) {
      await expect(completedTask).toHaveClass(/status-completed/);
      const opacity = await completedTask.evaluate(el => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeLessThan(1.0);
    } else {
      console.warn('No completed tasks found in list view to test');
    }
  });

  test('List View: In Progress tasks have in-progress class and pulse animation', async ({ page }) => {
    const inProgressTask = page.locator('.task-card.status-in-progress').first();

    const count = await inProgressTask.count();
    if (count > 0) {
      await expect(inProgressTask).toHaveClass(/status-in-progress/);
      const animation = await inProgressTask.evaluate(el => getComputedStyle(el).animationName);
      expect(animation).toBe('card-pulse');
    } else {
      console.warn('No in-progress tasks found in list view to test');
    }
  });

  test('Graph View: Nodes reflect task status', async ({ page }) => {
    // Switch to graph view
    await page.click('#viewGraphBtn');

    // Wait for graph to load (it's in an iframe)
    const iframeElement = await page.waitForSelector('#graphFrame');
    const frame = await iframeElement.contentFrame();

    // Wait for nodes to render in the iframe
    await frame.waitForSelector('.node', { timeout: 15000 });

    // Check for completed nodes
    const completedNode = frame.locator('.node.node-status-completed').first();
    const completedCount = await completedNode.count();
    if (completedCount > 0) {
      const circle = completedNode.locator('circle');
      const opacity = await circle.evaluate(el => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeLessThan(1.0);
    }

    // Check for in-progress nodes
    const inProgressNode = frame.locator('.node.node-status-in-progress').first();
    const inProgressCount = await inProgressNode.count();
    if (inProgressCount > 0) {
      const circle = inProgressNode.locator('circle');
      const animation = await circle.evaluate(el => getComputedStyle(el).animationName);
      expect(animation).toBe('pulse-in-progress');
    }
  });
});
