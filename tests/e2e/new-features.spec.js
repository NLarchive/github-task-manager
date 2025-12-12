import { test, expect } from '@playwright/test';

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

    await expect(page.locator('#passwordModal')).toBeVisible();
    await page.fill('#accessPassword', 'playwright-secret');
    await page.click('#passwordModal button:has-text("Unlock")');

    await expect(page.locator('#taskModal')).toBeVisible();
    await page.click('button:has-text("Cancel")');
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
    await page.click('#issuesModal .close');

    // Ensure imported task is visible in list mode
    await page.click('[data-testid="view-list"]');
    await expect(page.locator('.task-title').filter({ hasText: 'Mock Issue: Add timeline polish' }).first()).toBeVisible();
  });
});
