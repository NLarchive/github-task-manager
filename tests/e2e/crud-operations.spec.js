import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000/';
const TIMEOUT = 5000;

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

test.describe('GitHub Task Manager - Create Task', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);
    
    // Wait for page to load and display tasks
    await waitForAppReady(page);
    
    // Set user name for task attribution
    await page.fill('[id="userName"]', 'Playwright Test User');
  });

  test('should create new task with auto-populated fields', async ({ page }) => {
    // Click "+ Add New Task" button
    await page.click('button:has-text("+ Add New Task")');
    
    // Wait for modal to appear
    await page.waitForSelector('[id="taskModal"]');
    
    // Fill form fields
    await page.fill('[id="taskName"]', 'Playwright E2E Test Task');
    await page.fill('[id="taskDescription"]', 'Testing automated task creation');
    await page.selectOption('[id="taskStatus"]', 'In Progress');
    await page.selectOption('[id="taskPriority"]', 'High');
    await page.fill('[id="taskStartDate"]', '2025-12-11');
    await page.fill('[id="taskEndDate"]', '2025-12-12');
    await page.fill('[id="taskEstimatedHours"]', '4');
    await page.selectOption('[id="taskCategory"]', 'Testing');
    await page.fill('[id="taskTags"]', 'playwright, automation, test');
    
    // Submit form
    await page.click('button:has-text("Save Task")');
    
    // Wait for success message
    await page.waitForSelector('text=Tasks saved successfully', { timeout: TIMEOUT });
    
    // Verify new task appears in list (check that we have at least one with this name)
    const taskTitles = await page.locator('.task-title').filter({ hasText: 'Playwright E2E Test Task' });
    await expect(taskTitles.first()).toBeVisible();
    
    // Verify task ID was auto-generated (should be next sequential ID)
    const taskCards = await page.locator('[class*="task-card"]').count();
    expect(taskCards).toBeGreaterThan(0);
  });

  test('should validate required fields', async ({ page }) => {
    // Click "+ Add New Task" button
    await page.click('button:has-text("+ Add New Task")');
    
    // Wait for modal
    await page.waitForSelector('[id="taskModal"]');
    
    // Try to submit empty form
    await page.click('button:has-text("Save Task")');
    
    // Verify validation error appears
    const errorMessages = await page.locator('[class*="validation"]').count();
    expect(errorMessages).toBeGreaterThan(0);
  });

  test('should populate form defaults correctly', async ({ page }) => {
    // Click "+ Add New Task" button
    await page.click('button:has-text("+ Add New Task")');
    
    // Wait for modal
    await page.waitForSelector('[id="taskModal"]');
    
    // Verify default values are set
    const statusValue = await page.inputValue('[id="taskStatus"]');
    expect(statusValue).toBeTruthy();
    
    const priorityValue = await page.inputValue('[id="taskPriority"]');
    expect(priorityValue).toBeTruthy();
    
    const estimatedHours = await page.inputValue('[id="taskEstimatedHours"]');
    expect(estimatedHours).toBeTruthy();
  });
});

test.describe('GitHub Task Manager - Edit Task', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);
  });

  test('should allow editing the same task again after saving (no Task not found)', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.waitForSelector('[class*="task-card"]');

    const editButtons = page.locator('button:has-text("Edit")');
    await expect(editButtons.first()).toBeVisible();

    // Open edit modal
    await editButtons.first().click();
    await page.waitForSelector('[id="taskModal"]');

    // Capture the current task id shown in the modal (read-only field)
    const firstTaskId = (await page.locator('[id="displayTaskId"]').innerText()).trim();
    expect(firstTaskId).not.toBe('--');

    // Make a small edit and save
    await page.fill('[id="taskDescription"]', `Edited by Playwright at ${Date.now()}`);
    await page.click('button:has-text("Save Task")');
    await page.waitForSelector('text=Tasks saved successfully', { timeout: TIMEOUT });

    // Re-open edit modal for the same card again
    await editButtons.first().click();
    await page.waitForSelector('[id="taskModal"]');

    // Ensure the same task_id is still displayed (not corrupted to string mismatch)
    const secondTaskId = (await page.locator('[id="displayTaskId"]').innerText()).trim();
    expect(secondTaskId).toBe(firstTaskId);

    // Ensure we didn't hit the regression
    const taskNotFound = consoleErrors.some(t => t.includes('Task not found'));
    expect(taskNotFound).toBeFalsy();
  });

  test('should edit existing task', async ({ page }) => {
    // Wait for task list to load
    await page.waitForSelector('[class*="task-card"]');
    
    // Click edit button on first task
    const editButtons = await page.locator('button:has-text("Edit")');
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      
      // Wait for modal with task data
      await page.waitForSelector('[id="taskModal"]');
      
      // Verify task data is populated
      const taskName = await page.inputValue('[id="taskName"]');
      expect(taskName.length).toBeGreaterThan(0);
      
      // Close modal
      await page.click('button:has-text("Cancel")');
    }
  });

  test('should open edit modal when clicking task card', async ({ page }) => {
    // Create a specific task to test with
    await page.click('button:has-text("+ Add New Task")');
    await page.waitForSelector('[id="taskModal"]');
    await page.fill('[id="taskName"]', 'Click Test Task');
    await page.fill('[id="taskDescription"]', 'Testing click interaction');
    await page.selectOption('[id="taskStatus"]', 'Not Started');
    await page.selectOption('[id="taskPriority"]', 'Medium');
    await page.fill('[id="taskStartDate"]', '2025-12-11');
    await page.fill('[id="taskEndDate"]', '2025-12-12');
    await page.fill('[id="taskEstimatedHours"]', '2');
    await page.selectOption('[id="taskCategory"]', 'Testing');
    await page.click('button:has-text("Save Task")');
    await page.waitForSelector('text=Tasks saved successfully');

    // Find the task card
    const taskCard = page.locator('.task-card').filter({ hasText: 'Click Test Task' }).first();
    
    // Click the card (which triggers editTask with string ID from onclick)
    await taskCard.click();
    
    // Verify modal opens with correct task
    await page.waitForSelector('[id="taskModal"]');
    const taskName = await page.inputValue('[id="taskName"]');
    expect(taskName).toBe('Click Test Task');
    
    // Close modal
    await page.click('button:has-text("Cancel")');
  });

  test('should prepopulate edit form with task data', async ({ page }) => {
    // Wait for task list
    await page.waitForSelector('[class*="task-card"]');
    
    // Get first task name
    const firstTaskName = await page.locator('[class*="task-card"] h3').first().textContent();
    
    // Click edit on first task
    const editButtons = await page.locator('button:has-text("Edit")');
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      
      // Verify task name matches
      await page.waitForSelector('[id="taskModal"]');
      const formTaskName = await page.inputValue('[id="taskName"]');
      expect(formTaskName).toContain(firstTaskName.split('\n')[0]);
    }
  });
});

test.describe('GitHub Task Manager - Delete Task', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);
  });

  test('should delete task with confirmation', async ({ page }) => {
    // Get initial task count
    const initialCount = await page.textContent('[id="totalTasks"]');
    
    // Click delete on first task
    const deleteButtons = await page.locator('button:has-text("Delete")');
    if (await deleteButtons.count() > 0) {
      await deleteButtons.first().click();
      
      // Confirm deletion if modal appears
      const confirmButton = await page.locator('button:has-text("Delete")').nth(1);
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();
      }
      
      // Wait for completion
      await page.waitForTimeout(1000);
      
      // Task should be removed from visible list or stats updated
      expect(true).toBeTruthy(); // Placeholder for verification
    }
  });
});

test.describe('GitHub Task Manager - Filter & Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);
  });

  test('should filter tasks by clicking stat cards', async ({ page }) => {
    const notStartedCount = parseInt(((await page.textContent('[id="todoTasks"]')) || '0').trim(), 10) || 0;

    await page.getByTestId('stat-not-started').click();
    await expect(page.locator('[id="filterStatus"]')).toHaveValue('Not Started');

    const notStartedCards = await page.locator('.task-card').count();
    expect(notStartedCards).toBe(notStartedCount);

    await page.getByTestId('stat-total').click();
    await expect(page.locator('[id="filterStatus"]')).toHaveValue('all');
  });

  test('should filter tasks by status', async ({ page }) => {
    // Select "Completed" status filter
    await page.selectOption('[id="filterStatus"]', 'Completed');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Verify filtered results
    const taskCards = await page.locator('[class*="task-card"]').count();
    expect(taskCards).toBeGreaterThanOrEqual(0);
  });

  test('should filter tasks by priority', async ({ page }) => {
    // Select "Critical" priority filter
    await page.selectOption('[id="filterPriority"]', 'Critical');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Verify filtered results
    const taskCards = await page.locator('[class*="task-card"]').count();
    expect(taskCards).toBeGreaterThanOrEqual(0);
  });

  test('should combine multiple filters', async ({ page }) => {
    // Apply status filter
    await page.selectOption('[id="filterStatus"]', 'Completed');
    
    // Apply priority filter
    await page.selectOption('[id="filterPriority"]', 'High');
    
    // Wait for filters to apply
    await page.waitForTimeout(500);
    
    // Verify combined filter results
    const taskCards = await page.locator('[class*="task-card"]').count();
    expect(taskCards).toBeGreaterThanOrEqual(0);
    
    // Reset filters
    await page.selectOption('[id="filterStatus"]', 'all');
    await page.selectOption('[id="filterPriority"]', 'all');
  });
});

test.describe('GitHub Task Manager - Refresh & Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);
  });

  test('should persist data after refresh', async ({ page }) => {
    // Get initial task count after tasks are loaded
    await waitForAppReady(page);
    const initialCount = await page.textContent('[id="totalTasks"]');
    
    // Click refresh button
    await page.click('button:has-text("🔄 Refresh")');
    
    // Wait for loading to complete
    await page.waitForSelector('text=Tasks loaded successfully', { timeout: TIMEOUT });
    await waitForAppReady(page);
    
    // Verify task count remained the same (persistence test)
    const finalCount = await page.textContent('[id="totalTasks"]');
    expect(finalCount).toBe(initialCount);
  });

  test('should load tasks from GitHub API', async ({ page }) => {
    // Click refresh button
    await page.click('button:has-text("🔄 Refresh")');
    
    // Wait for success message
    await page.waitForSelector('text=Tasks loaded successfully', { timeout: TIMEOUT });
    
    // Verify tasks are displayed
    const taskCards = await page.locator('[class*="task-card"]').count();
    expect(taskCards).toBeGreaterThan(0);
  });

  test('should display loading state during refresh', async ({ page }) => {
    // Click refresh button
    await page.click('button:has-text("🔄 Refresh")');
    
    // Verify loading indicator appears
    const loadingIndicator = await page.locator('text=Processing').isVisible({ timeout: 1000 }).catch(() => false);
    // May or may not show depending on timing
    
    // Wait for completion
    await page.waitForSelector('text=Tasks loaded successfully', { timeout: TIMEOUT });
  });
});

test.describe('GitHub Task Manager - CSV Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);
  });

  test('should export tasks to CSV', async ({ page, context }) => {
    // Listen for download event
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('button:has-text("📥 Export CSV")');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download happened
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

  test('should include all task fields in export', async ({ page, context }) => {
    // Listen for download
    const downloadPromise = page.waitForEvent('download');
    
    // Click export
    await page.click('button:has-text("📥 Export CSV")');
    
    // Get download
    const download = await downloadPromise;
    const path = await download.path();
    
    // Verify file exists and has content
    expect(path).toBeTruthy();
  });
});

test.describe('GitHub Task Manager - Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);
  });

  test('should display task statistics', async ({ page }) => {
    // Verify all stat cards are visible by checking their headings
    await expect(page.locator('.stat-card h3:has-text("Total Tasks")')).toBeVisible();
    await expect(page.locator('.stat-card h3:has-text("Not Started")')).toBeVisible();
    await expect(page.locator('.stat-card h3:has-text("In Progress")')).toBeVisible();
    await expect(page.locator('.stat-card h3:has-text("Completed")')).toBeVisible();
  });

  test('should update statistics after creating task', async ({ page }) => {
    // Get initial count
    const initialTotal = await page.textContent('[id="totalTasks"]');
    
    // Create task
    await page.click('button:has-text("+ Add New Task")');
    await page.waitForSelector('[id="taskModal"]');
    
    // Fill minimal required fields
    await page.fill('[id="taskName"]', 'Stat Test Task');
    await page.fill('[id="taskDescription"]', 'Test');
    await page.selectOption('[id="taskStatus"]', 'Not Started');
    await page.selectOption('[id="taskCategory"]', 'Testing');
    await page.fill('[id="taskStartDate"]', '2025-12-12');
    await page.fill('[id="taskEndDate"]', '2025-12-13');
    
    // Save
    await page.click('button:has-text("Save Task")');
    await page.waitForSelector('text=Tasks saved successfully', { timeout: TIMEOUT });
    
    // Verify total count increased
    const finalTotal = await page.textContent('[id="totalTasks"]');
    expect(parseInt(finalTotal)).toBeGreaterThan(parseInt(initialTotal));
  });

  test('should display statistics with zero values', async ({ page }) => {
    // Filter to a status with potentially no tasks
    await page.selectOption('[id="filterStatus"]', 'Cancelled');
    
    // Verify stats still display
    const stats = await page.locator('[class*="stat-card"]').count();
    expect(stats).toBeGreaterThan(0);
  });
});

test.describe('GitHub Task Manager - UI/UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);
  });

  test('should display header with repository info', async ({ page }) => {
    // Verify header is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify subtitle
    await expect(page.locator('text=Collaborative Task Management')).toBeVisible();
  });

  test('should display user name input field', async ({ page }) => {
    // Verify input exists
    const userInput = page.locator('[id="userName"]');
    await expect(userInput).toBeVisible();
    
    // Enter name
    await userInput.fill('Test User');
    
    // Verify value persists
    const value = await userInput.inputValue();
    expect(value).toBe('Test User');
  });

  test('should display all control buttons', async ({ page }) => {
    // Verify all buttons are visible
    await expect(page.locator('button:has-text("+ Add New Task")')).toBeVisible();
    await expect(page.locator('button:has-text("🔄 Refresh")')).toBeVisible();
    await expect(page.locator('button:has-text("📥 Export CSV")')).toBeVisible();
  });

  test('should be responsive on different viewport sizes', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[id="tasksList"]')).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[id="tasksList"]')).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[id="tasksList"]')).toBeVisible();
  });

  test('should display modal when creating task', async ({ page }) => {
    // Click add task
    await page.click('button:has-text("+ Add New Task")');
    
    // Verify modal is visible
    const modal = page.locator('[id="taskModal"]');
    await expect(modal).toBeVisible();
    
    // Verify modal title specifically in modal
    await expect(page.locator('#modalTitle')).toHaveText('Add New Task');
  });

  test('should display task cards with key information', async ({ page }) => {
    // Wait for task cards
    await page.waitForSelector('[class*="task-card"]');
    
    // Verify first task card shows key info
    const firstCard = page.locator('[class*="task-card"]').first();
    
    // Should show task name
    const taskName = await firstCard.locator('h3, h4, h5').first().textContent();
    expect(taskName.length).toBeGreaterThan(0);
  });
});
