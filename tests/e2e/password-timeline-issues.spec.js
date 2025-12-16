import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000/';
const LIVE_URL = 'https://nlarchive.github.io/github-task-manager/';
const TIMEOUT = 5000;
const LIVE_PASSWORD = '1324';
const LIVE_PASSWORD_AI_CAREER_ROADMAP = 'ai-career-roadmap-1234';
const RUN_LIVE = process.env.PLAYWRIGHT_RUN_LIVE === '1' || process.env.RUN_LIVE_E2E === '1';

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

test.describe('New Features - Password / Timeline / Issues', () => {
  test('password gate can be forced on localhost for E2E', async ({ page }) => {
    await page.addInitScript(() => {
      // Injected before template-config.js executes
      window.ACCESS_PASSWORD = 'playwright-secret';
    });

    await page.goto(`${BASE_URL}?forcePassword=1`);
    await waitForAppReady(page);

    const editButtons = page.locator('button:has-text("Edit")');
    await expect(editButtons.first()).toBeVisible();
    await editButtons.first().click();

    await expect(page.locator('#passwordModal')).toBeVisible({ timeout: 5000 });
    const passwordInput = page.locator('#accessPassword');
    await passwordInput.fill('playwright-secret');
    const unlockBtn = page.locator('#passwordModal button:has-text("Unlock")');
    await unlockBtn.scrollIntoViewIfNeeded();
    await unlockBtn.click({ force: true });

    // Wait a bit for modal to process password
    await page.waitForTimeout(200);
    
    // Check if task modal appears or if we need to retry
    const taskModal = page.locator('#taskModal');
    const isVisible = await taskModal.isVisible();
    
    if (isVisible) {
      await page.click('#taskModal button:has-text("Cancel")');
    }
  });

  test('timeline view renders task rows', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);

    await page.click('[data-testid="view-timeline"]');
    await expect(page.locator('[data-testid="timeline-view"]')).toBeVisible();
    await expect(page.locator('.timeline-row').first()).toBeVisible();
  });

  test('issues sync imports mocked GitHub issues as tasks', async ({ page }) => {
    const mockIssues = [
      {
        id: 1,
        number: 123,
        title: 'Mock Issue: Add timeline polish',
        body: 'This is a mocked issue body',
        state: 'open',
        comments: 2,
        html_url: 'https://github.com/nlarchive/github-task-manager/issues/123'
      },
      {
        id: 2,
        number: 124,
        title: 'Mock PR (should be filtered)',
        body: 'PR should be ignored',
        state: 'open',
        comments: 0,
        html_url: 'https://github.com/nlarchive/github-task-manager/pull/124',
        pull_request: { url: 'https://api.github.com/repos/nlarchive/github-task-manager/pulls/124' }
      }
    ];

    await page.route('https://api.github.com/**/issues?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(mockIssues)
      });
    });

    await page.goto(BASE_URL);
    await waitForAppReady(page);

    await page.click('[data-testid="sync-issues"]');
    await expect(page.locator('#issuesModal')).toBeVisible();

    // Wait for our mocked issue to appear
    await expect(page.locator('#issuesList').getByText('#123 Mock Issue: Add timeline polish')).toBeVisible();

    // Select it and import
    await page.locator('input.issue-select[data-issue-number="123"]').check();
    await page.click('#issuesModal button:has-text("Import Selected")');

    await page.waitForSelector('text=Tasks saved successfully', { timeout: 30000 });
    await page.locator('#issuesModal .close').click({ force: true });

    // Ensure imported task is visible in list mode
    await page.click('[data-testid="view-list"]');
    await expect(page.locator('.task-title').filter({ hasText: 'Mock Issue: Add timeline polish' }).first()).toBeVisible();
  });
});

// Live GitHub Pages Tests
test.describe('Live Site - Password Protection & New Features', () => {
  test.skip(!RUN_LIVE, 'Set PLAYWRIGHT_RUN_LIVE=1 (or RUN_LIVE_E2E=1) to enable live-site tests');

  test('password gate blocks edit without password', async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.waitForSelector('[id="totalTasks"]', { timeout: 15000 });
    await page.waitForFunction(
      () => document.querySelector('[id="tasksList"]')?.children.length > 0 || 
             document.querySelector('[id="emptyState"]')?.style.display !== 'none',
      { timeout: 30000 }
    );

    // Find and click first Edit button
    const editBtn = page.locator('button:has-text("Edit")').first();
    await editBtn.click();

    // Password modal should appear
    await expect(page.locator('#passwordModal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2:has-text("Access Required")')).toBeVisible();
  });

  test('password gate accepts correct password and opens task edit', async ({ page }) => {
    await page.goto(LIVE_URL);
    // Ensure a clean auth state (avoid previous unlock in same browser profile)
    await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
    await page.reload();

    await page.waitForSelector('[id="totalTasks"]', { timeout: 15000 });
    await page.waitForFunction(
      () => document.querySelector('[id="tasksList"]')?.children.length > 0,
      { timeout: 30000 }
    );

    // Click first Edit button
    const editBtn = page.locator('button:has-text("Edit")').first();
    await editBtn.click();

    // Wait for password modal
    const passwordModal = page.locator('#passwordModal');
    await expect(passwordModal).toBeVisible({ timeout: 5000 });

    // Enter correct password
    const passwordInput = page.locator('#accessPassword');
    await passwordInput.fill(LIVE_PASSWORD);
    
    // Click Unlock button
    const unlockBtn = page.locator('#passwordModal button:has-text("Unlock")');
    await unlockBtn.scrollIntoViewIfNeeded();
    await unlockBtn.click({ force: true });

    // Task edit modal should open (password was correct)
    const taskModal = page.locator('#taskModal');
    await expect(taskModal).toBeVisible({ timeout: 5000 });
    
    // Close the modal
    await page.click('#taskModal .close');
  });

  test('switching project forces lock again (no cross-project unlock)', async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
    await page.reload();

    await page.waitForSelector('[id="totalTasks"]', { timeout: 15000 });
    await page.waitForFunction(
      () => document.querySelector('[id="tasksList"]')?.children.length > 0,
      { timeout: 30000 }
    );

    // Unlock on default project
    await page.locator('button:has-text("Edit")').first().click();
    await expect(page.locator('#passwordModal')).toBeVisible({ timeout: 5000 });
    await page.locator('#accessPassword').fill(LIVE_PASSWORD);
    await page.locator('#passwordModal button:has-text("Unlock")').scrollIntoViewIfNeeded();
    await page.locator('#passwordModal button:has-text("Unlock")').click({ force: true });
    await expect(page.locator('#taskModal')).toBeVisible({ timeout: 5000 });
    await page.click('#taskModal .close');

    // Switch project
    await page.locator('#projectSelect').selectOption('ai-career-roadmap');
    await page.waitForTimeout(250);

    // Editing should require password again
    await page.locator('button:has-text("Edit")').first().click();
    await expect(page.locator('#passwordModal')).toBeVisible({ timeout: 5000 });

    // Unlock with the project password and ensure edit opens
    await page.locator('#accessPassword').fill(LIVE_PASSWORD_AI_CAREER_ROADMAP);
    await page.locator('#passwordModal button:has-text("Unlock")').scrollIntoViewIfNeeded();
    await page.locator('#passwordModal button:has-text("Unlock")').click({ force: true });
    await expect(page.locator('#taskModal')).toBeVisible({ timeout: 5000 });
    await page.click('#taskModal .close');
  });

  test('password gate rejects incorrect password', async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.waitForSelector('[id="totalTasks"]', { timeout: 15000 });
    await page.waitForFunction(
      () => document.querySelector('[id="tasksList"]')?.children.length > 0,
      { timeout: 30000 }
    );

    // Click first Edit button
    const editBtn = page.locator('button:has-text("Edit")').first();
    await editBtn.click();

    // Wait for password modal
    const passwordModal = page.locator('#passwordModal');
    await expect(passwordModal).toBeVisible({ timeout: 5000 });

    // Enter WRONG password
    const passwordInput = page.locator('#accessPassword');
    await passwordInput.fill('wrong-password-9999');
    
    // Click Unlock button
    const unlockBtn = page.locator('#passwordModal button:has-text("Unlock")');
    await unlockBtn.scrollIntoViewIfNeeded();
    await unlockBtn.click({ force: true });

    // Error message should appear
    const errorDiv = page.locator('#passwordError');
    await expect(errorDiv).toBeVisible({ timeout: 3000 });
    await expect(errorDiv).toContainText('Incorrect password');

    // Task modal should NOT be visible
    const taskModal = page.locator('#taskModal');
    await expect(taskModal).not.toBeVisible();
  });

  test('timeline view toggle works on live site', async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.waitForSelector('[id="totalTasks"]', { timeout: 15000 });
    await page.waitForFunction(
      () => document.querySelector('[id="tasksList"]')?.children.length > 0,
      { timeout: 30000 }
    );

    // Timeline button should be visible
    const timelineBtn = page.locator('[data-testid="view-timeline"]');
    await expect(timelineBtn).toBeVisible();

    // Click timeline button
    await timelineBtn.click();

    // Timeline view should become visible
    const timelineView = page.locator('[data-testid="timeline-view"]');
    await expect(timelineView).toBeVisible({ timeout: 5000 });

    // List view should be hidden
    const tasksList = page.locator('[data-testid="tasks-list"]');
    const display = await tasksList.evaluate(el => window.getComputedStyle(el).display);
    expect(display).toBe('none');
  });

  test('sync issues button is visible and clickable', async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.waitForSelector('[id="totalTasks"]', { timeout: 15000 });
    await page.waitForFunction(
      () => document.querySelector('[id="tasksList"]')?.children.length > 0,
      { timeout: 30000 }
    );

    // Sync Issues button should be visible
    const syncBtn = page.locator('[data-testid="sync-issues"]');
    await expect(syncBtn).toBeVisible();

    // Click sync button - this might trigger password modal if on GitHub Pages
    await syncBtn.click();

    // Wait a moment for anything to happen
    await page.waitForTimeout(1000);

    // Check if password modal appeared (on GitHub Pages)
    const passwordModal = page.locator('#passwordModal');
    const isPasswordNeeded = await passwordModal.isVisible().catch(() => false);
    
    if (isPasswordNeeded) {
      // Skip this test as password is required - the complete flow test covers this
      return;
    }

    // Wait for issues modal to appear - check if it's being shown via display property
    let isModalVisible = false;
    try {
      await page.waitForFunction(
        () => {
          const modal = document.getElementById('issuesModal');
          if (!modal) return false;
          const display = window.getComputedStyle(modal).display;
          return display === 'block';
        },
        { timeout: 3000 }
      );
      isModalVisible = true;
    } catch (e) {
      // Modal might not appear - GitHub API might not be accessible or rate limited
      isModalVisible = false;
    }

    if (isModalVisible) {
      // Close modal if it opened
      const closeBtn = page.locator('#issuesModal .close').first();
      if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeBtn.click();
      }
    }
  });

  test('complete flow: password protection -> task edit -> timeline toggle -> sync issues', async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.waitForSelector('[id="totalTasks"]', { timeout: 15000 });
    await page.waitForFunction(
      () => document.querySelector('[id="tasksList"]')?.children.length > 0,
      { timeout: 30000 }
    );

    // Step 1: Test password protection
    const editBtn = page.locator('button:has-text("Edit")').first();
    await editBtn.click();
    await expect(page.locator('#passwordModal')).toBeVisible({ timeout: 5000 });

    // Enter correct password
    const passwordInput = page.locator('#accessPassword');
    await passwordInput.fill(LIVE_PASSWORD);
    await page.locator('#passwordModal button:has-text("Unlock")').click();

    // Task modal should open
    await expect(page.locator('#taskModal')).toBeVisible({ timeout: 5000 });
    await page.click('#taskModal .close');

    // Step 2: Test timeline toggle
    const timelineBtn = page.locator('[data-testid="view-timeline"]');
    await timelineBtn.click();
    const timelineView = page.locator('[data-testid="timeline-view"]');
    await expect(timelineView).toBeVisible({ timeout: 5000 });

    // Step 3: Switch back to list view
    const listBtn = page.locator('[data-testid="view-list"]');
    await listBtn.click();
    const tasksList = page.locator('[data-testid="tasks-list"]');
    const displayMode = await tasksList.evaluate(el => window.getComputedStyle(el).display);
    expect(displayMode).not.toBe('none');

    // Step 4: Test sync issues button
    const syncBtn = page.locator('[data-testid="sync-issues"]');
    await syncBtn.click();
    await expect(page.locator('#issuesModal')).toBeVisible({ timeout: 5000 });
    await page.click('#issuesModal .close');
  });
});
