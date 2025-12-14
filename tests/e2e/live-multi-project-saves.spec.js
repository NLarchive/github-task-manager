import { test, expect } from '@playwright/test';

/**
 * Live Site Multi-Project Save Tests
 * Tests that saves persist to the correct GitHub repo when switching projects
 * on the deployed GitHub Pages site.
 */

const LIVE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://nlarchive.github.io/github-task-manager/';
const TIMEOUT = 60000;
const LIVE_PASSWORD_GITHUB_TASK_MANAGER = process.env.LIVE_PASSWORD_GITHUB_TASK_MANAGER || 'github-task-manager-1234';
const LIVE_PASSWORD_AI_CAREER_ROADMAP = process.env.LIVE_PASSWORD_AI_CAREER_ROADMAP || 'ai-career-roadmap-1234';
const RUN_LIVE = process.env.PLAYWRIGHT_RUN_LIVE === '1' || process.env.RUN_LIVE_E2E === '1';

async function selectProjectAndWait(page, projectId, { expectTaskText, minTotalTasks, maxTotalTasks } = {}) {
  const projectSelect = page.locator('#projectSelect');
  await projectSelect.selectOption(projectId);

  // NOTE: The deployed GitHub Pages build does not currently update header info (repo/tasks file)
  // when switching projects. Validate the switch by checking task list content + total count.
  if (typeof minTotalTasks === 'number' || typeof maxTotalTasks === 'number') {
    await page.waitForFunction(
      ({ minTotalTasks, maxTotalTasks }) => {
        const el = document.getElementById('totalTasks');
        const n = Number((el?.textContent || '').trim());
        if (!Number.isFinite(n)) return false;
        if (typeof minTotalTasks === 'number' && n < minTotalTasks) return false;
        if (typeof maxTotalTasks === 'number' && n > maxTotalTasks) return false;
        return true;
      },
      { minTotalTasks, maxTotalTasks },
      { timeout: TIMEOUT }
    );
  }

  if (expectTaskText) {
    await page.getByText(expectTaskText, { exact: false }).first().waitFor({ timeout: TIMEOUT });
  }
}

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

async function getWorkerUrl(page) {
  return await page.evaluate(() => {
    const workerInfo = document.getElementById('workerInfo');
    return workerInfo ? workerInfo.textContent.replace('Worker: ', '') : '';
  });
}

async function getTasksFile(page) {
  return await page.evaluate(() => {
    const tasksInfo = document.getElementById('tasksInfo');
    return tasksInfo ? tasksInfo.textContent.replace('TasksFile: ', '') : '';
  });
}

async function getRepoInfo(page) {
  return await page.evaluate(() => {
    const repoInfo = document.getElementById('repoInfo');
    return repoInfo ? repoInfo.textContent.replace('Repository: ', '') : '';
  });
}

async function unlockProject(page, password) {
  // Click the lock indicator to open password modal
  const lockIndicator = page.locator('.auth-indicator.locked');
  await lockIndicator.click();

  // Wait for password modal
  await page.waitForSelector('#passwordModal', { state: 'visible', timeout: TIMEOUT });

  // Enter password
  const passwordInput = page.locator('#accessPassword');
  await passwordInput.fill(password);

  // Submit
  const submitButton = page.locator('#passwordModal button[type="submit"]');
  await submitButton.click();

  // Wait for modal to close and lock to become unlocked
  await page.waitForSelector('#passwordModal', { state: 'hidden', timeout: TIMEOUT });
  await page.waitForSelector('.auth-indicator.unlocked', { timeout: TIMEOUT });
}

async function createTestTask(page, taskName = 'Test Task - ' + Date.now()) {
  // Click Add New Task
  await page.locator('button:has-text("Add New Task")').click();

  // Wait for modal
  await page.waitForSelector('#taskModal', { state: 'visible', timeout: TIMEOUT });

  // Fill required fields
  await page.locator('#taskName').fill(taskName);
  await page.locator('#taskDescription').fill('Test description for automated testing');
  await page.locator('#taskStartDate').fill('2025-12-15');
  await page.locator('#taskEndDate').fill('2025-12-20');
  await page.locator('#taskEstimatedHours').fill('8');

  // Submit
  await page.locator('#taskForm button[type="submit"]').click();

  // Wait for modal to close
  await page.waitForSelector('#taskModal', { state: 'hidden', timeout: 10000 });

  return taskName;
}

async function editFirstTask(page, newName = 'Edited Task - ' + Date.now()) {
  // Find and click the first Edit button
  const editButtons = page.locator('button:has-text("Edit")');
  await editButtons.first().click();

  // Wait for modal
  await page.waitForSelector('#taskModal', { state: 'visible', timeout: TIMEOUT });

  // Update task name
  const nameInput = page.locator('#taskName');
  await nameInput.clear();
  await nameInput.fill(newName);

  // Submit
  await page.locator('#taskForm button[type="submit"]').click();

  // Wait for modal to close
  await page.waitForSelector('#taskModal', { state: 'hidden', timeout: 10000 });

  return newName;
}

async function waitForSaveToast(page, expectedText, timeout = 10000) {
  const toast = page.locator('#toast');
  await toast.waitFor({ state: 'visible', timeout });

  const toastText = await toast.textContent();
  if (!toastText.includes(expectedText)) {
    throw new Error(`Expected toast to contain "${expectedText}", but got: "${toastText}"`);
  }

  // Wait for toast to disappear
  await toast.waitFor({ state: 'hidden', timeout: 5000 });
}

test.describe('@live Live Site - Multi-Project GitHub Saves', () => {
  test.skip(!RUN_LIVE, 'Set PLAYWRIGHT_RUN_LIVE=1 to enable live-site tests');

  test.beforeEach(async ({ page }) => {
    await page.goto(LIVE_URL);
    await waitForAppReady(page);
  });

  test('should display Worker URL and correct repo info', async ({ page }) => {
    // Check that Worker URL is configured
    const workerUrl = await getWorkerUrl(page);
    console.log('Worker URL:', workerUrl);
    expect(workerUrl).not.toBe('');
    expect(workerUrl).not.toBe('Not configured');
    expect(workerUrl).toMatch(/^https:\/\/.*\.workers\.dev\/?$/);

    // Check repo info
    const repoInfo = await getRepoInfo(page);
    console.log('Repo info:', repoInfo);
    expect(repoInfo).toContain('nlarchive/github-task-manager');
    expect(repoInfo).toContain('main');

    // Check tasks file
    const tasksFile = await getTasksFile(page);
    console.log('Tasks file:', tasksFile);
    expect(tasksFile).toBe('public/tasksDB/github-task-manager/tasks.json');
  });

  test('should save to github-task-manager repo', async ({ page }) => {
    await selectProjectAndWait(page, 'github-task-manager', {
      // github-task-manager has a higher task count and contains prior E2E "Test Task" entries
      minTotalTasks: 20,
      expectTaskText: 'Test Task -'
    });

    // Unlock with project password
    await unlockProject(page, LIVE_PASSWORD_GITHUB_TASK_MANAGER);

    // Create a test task
    const taskName = await createTestTask(page);

    // Wait for success toast
    await waitForSaveToast(page, 'to GitHub (via Worker)');

    // Verify task appears in list
    await page.waitForSelector(`text=${taskName}`, { timeout: 5000 });

    // Edit the task
    const editedName = await editFirstTask(page);

    // Wait for success toast
    await waitForSaveToast(page, 'to GitHub (via Worker)');

    // Verify edited task appears
    await page.waitForSelector(`text=${editedName}`, { timeout: 5000 });
  });

  test('should save to ai-career-roadmap repo', async ({ page }) => {
    await selectProjectAndWait(page, 'ai-career-roadmap', {
      // ai-career-roadmap currently has fewer tasks and includes this distinct title
      maxTotalTasks: 20,
      expectTaskText: 'Define target role, timeline, and success criteria'
    });

    // Unlock with project password
    await unlockProject(page, LIVE_PASSWORD_AI_CAREER_ROADMAP);

    // Create a test task
    const taskName = await createTestTask(page);

    // Wait for success toast
    await waitForSaveToast(page, 'to GitHub (via Worker)');

    // Verify task appears in list
    await page.waitForSelector(`text=${taskName}`, { timeout: 5000 });

    // Edit the task
    const editedName = await editFirstTask(page);

    // Wait for success toast
    await waitForSaveToast(page, 'to GitHub (via Worker)');

    // Verify edited task appears
    await page.waitForSelector(`text=${editedName}`, { timeout: 5000 });
  });

  test('should prevent saves without password', async ({ page }) => {
    await selectProjectAndWait(page, 'ai-career-roadmap', {
      maxTotalTasks: 20,
      expectTaskText: 'Define target role, timeline, and success criteria'
    });

    // Try to create task without unlocking
    await page.locator('button:has-text("Add New Task")').click();

    // Should show password modal instead of task modal
    await page.waitForSelector('#passwordModal', { state: 'visible', timeout: TIMEOUT });

    // Close modal
    await page.locator('#passwordModal .close').click();
  });

  test('should show local-only warning when Worker not configured', async ({ page }) => {
    // This test would need to run against a version without GH_WORKER_URL
    // For now, we'll skip it as the live site should have Worker configured
    test.skip(true, 'Worker is configured on live site');
  });
});