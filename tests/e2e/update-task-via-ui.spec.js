import { test, expect } from '@playwright/test';

/**
 * Playwright utility for updating tasks through the UI instead of editing JSON files directly.
 * Use this to programmatically update task data via the web interface.
 *
 * Usage example:
 *   npx playwright test tests/e2e/update-task-via-ui.spec.js --headed
 */

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000/';
const TIMEOUT = 5000;

/**
 * Wait for the app to be ready and all tasks loaded
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

/**
 * Update a task by task ID through the UI
 * @param {Page} page - Playwright page object
 * @param {number} taskId - The ID of the task to update
 * @param {Object} taskData - Object containing fields to update
 *   Example: { status: 'In Progress', progress_percentage: 50, comments_text: 'Updated via automation' }
 */
async function updateTaskViaUI(page, taskId, taskData) {
  // Find and click the Edit button for this task
  const taskCard = page.locator(`[data-task-id="${taskId}"]`).first();
  
  if (!await taskCard.isVisible()) {
    throw new Error(`Task with ID ${taskId} not found or not visible`);
  }

  // Click the Edit button within the task card
  const editButton = taskCard.locator('button:has-text("Edit")');
  await editButton.click();

  // Wait for modal to appear
  await page.waitForSelector('[id="taskModal"]', { timeout: TIMEOUT });

  // Update status if provided
  if (taskData.status) {
    await page.selectOption('[id="taskStatus"]', taskData.status);
  }

  // Update progress percentage if provided
  if (taskData.progress_percentage !== undefined) {
    await page.fill('[id="taskProgressPercentage"]', String(taskData.progress_percentage));
  }

  // Update priority if provided
  if (taskData.priority) {
    await page.selectOption('[id="taskPriority"]', taskData.priority);
  }

  // Update dates if provided
  if (taskData.start_date) {
    await page.fill('[id="taskStartDate"]', taskData.start_date);
  }

  if (taskData.end_date) {
    await page.fill('[id="taskEndDate"]', taskData.end_date);
  }

  // Update estimated hours if provided
  if (taskData.estimated_hours !== undefined) {
    await page.fill('[id="taskEstimatedHours"]', String(taskData.estimated_hours));
  }

  // Update actual hours if provided
  if (taskData.actual_hours !== undefined) {
    await page.fill('[id="taskActualHours"]', String(taskData.actual_hours));
  }

  // Update category if provided
  if (taskData.category_name) {
    await page.selectOption('[id="taskCategory"]', taskData.category_name);
  }

  // Update description if provided
  if (taskData.description) {
    await page.fill('[id="taskDescription"]', taskData.description);
  }

  // Update tags if provided
  if (taskData.tags) {
    const tagsString = Array.isArray(taskData.tags) ? taskData.tags.join(', ') : taskData.tags;
    await page.fill('[id="taskTags"]', tagsString);
  }

  // Click Save button
  await page.click('button:has-text("Save Task")');

  // Wait for success message
  await page.waitForSelector('text=Tasks saved successfully', { timeout: TIMEOUT });
}

/**
 * Create a new task with specified data
 * @param {Page} page - Playwright page object
 * @param {Object} taskData - Task fields to set
 *   Required: name, description, status, priority, start_date, end_date, estimated_hours, category_name
 */
async function createTaskViaUI(page, taskData) {
  // Click "+ Add New Task" button
  await page.click('button:has-text("+ Add New Task")');

  // Wait for modal to appear
  await page.waitForSelector('[id="taskModal"]', { timeout: TIMEOUT });

  // Fill required fields
  if (!taskData.name || !taskData.description || !taskData.status || !taskData.priority ||
      !taskData.start_date || !taskData.end_date || !taskData.estimated_hours || !taskData.category_name) {
    throw new Error('Required fields missing: name, description, status, priority, start_date, end_date, estimated_hours, category_name');
  }

  await page.fill('[id="taskName"]', taskData.name);
  await page.fill('[id="taskDescription"]', taskData.description);
  await page.selectOption('[id="taskStatus"]', taskData.status);
  await page.selectOption('[id="taskPriority"]', taskData.priority);
  await page.fill('[id="taskStartDate"]', taskData.start_date);
  await page.fill('[id="taskEndDate"]', taskData.end_date);
  await page.fill('[id="taskEstimatedHours"]', String(taskData.estimated_hours));
  await page.selectOption('[id="taskCategory"]', taskData.category_name);

  // Fill optional fields
  if (taskData.tags) {
    const tagsString = Array.isArray(taskData.tags) ? taskData.tags.join(', ') : taskData.tags;
    await page.fill('[id="taskTags"]', tagsString);
  }

  if (taskData.progress_percentage !== undefined) {
    await page.fill('[id="taskProgressPercentage"]', String(taskData.progress_percentage));
  }

  if (taskData.actual_hours !== undefined) {
    await page.fill('[id="taskActualHours"]', String(taskData.actual_hours));
  }

  // Click Save button
  await page.click('button:has-text("Save Task")');

  // Wait for success message
  await page.waitForSelector('text=Tasks saved successfully', { timeout: TIMEOUT });
}

// ============================================================================
// TEST EXAMPLES - Update task progress programmatically through the UI
// ============================================================================

test.describe('Update Tasks Via UI Automation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);

    // Wait for page to load and display tasks
    await waitForAppReady(page);

    // Set user name for task attribution
    await page.fill('[id="userName"]', 'Playwright Automation');
  });

  test('should update task status and progress via UI', async ({ page }) => {
    // Update task 8 (Documentation) - set to 60% progress
    await updateTaskViaUI(page, 8, {
      status: 'In Progress',
      progress_percentage: 60
    });

    // Verify the update by checking the task card
    const taskCard = page.locator('[data-task-id="8"]').first();
    const progressText = await taskCard.locator('[class*="progress"]').textContent();
    expect(progressText).toContain('60');
  });

  test('should mark task as completed', async ({ page }) => {
    // Mark task 13 (Token Strategy) as Completed
    await updateTaskViaUI(page, 13, {
      status: 'Completed',
      progress_percentage: 100,
      actual_hours: 2
    });

    // Verify the update
    const taskCard = page.locator('[data-task-id="13"]').first();
    const statusText = await taskCard.locator('[class*="status"]').textContent();
    expect(statusText).toContain('Completed');
  });

  test('should update multiple task fields at once', async ({ page }) => {
    // Update task 10 (Retrospective) with multiple fields
    await updateTaskViaUI(page, 10, {
      status: 'In Progress',
      progress_percentage: 25,
      priority: 'Medium',
      actual_hours: 1
    });

    // Verify updates
    const taskCard = page.locator('[data-task-id="10"]').first();
    expect(await taskCard.isVisible()).toBeTruthy();
  });

  test('should create new task with all fields via UI', async ({ page }) => {
    // Create a new task using the automation utility
    await createTaskViaUI(page, {
      name: 'Add CI Step for Derived Files',
      description: 'Add GitHub Actions step to regenerate state and CSV files during deploy',
      status: 'Not Started',
      priority: 'High',
      start_date: '2025-12-13',
      end_date: '2025-12-14',
      estimated_hours: 2,
      category_name: 'Deployment',
      tags: ['ci-cd', 'automation', 'devops'],
      progress_percentage: 0
    });

    // Verify the new task appears in the list
    const newTask = page.locator('text=Add CI Step for Derived Files');
    await expect(newTask).toBeVisible();
  });

  test('should batch update multiple tasks', async ({ page }) => {
    // Update multiple tasks in sequence to reflect progress
    const updates = [
      { id: 8, data: { progress_percentage: 60 } },
      { id: 10, data: { progress_percentage: 25 } },
      { id: 13, data: { status: 'Completed', progress_percentage: 100 } }
    ];

    for (const update of updates) {
      await updateTaskViaUI(page, update.id, update.data);
      // Small delay between updates to ensure UI updates
      await page.waitForTimeout(1000);
    }

    // Verify all updates completed
    expect(await page.locator('[data-task-id="8"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[data-task-id="10"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[data-task-id="13"]').count()).toBeGreaterThan(0);
  });
});

// ============================================================================
// EXPORTED UTILITIES - Use in other test files
// ============================================================================

export { updateTaskViaUI, createTaskViaUI, waitForAppReady };
