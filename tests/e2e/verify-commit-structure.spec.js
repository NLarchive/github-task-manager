import { test, expect } from '@playwright/test';

// Live E2E: Verify compact commit subject structure and TASKDB_CHANGE_V1 payload
const LIVE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://nlarchive.github.io/github-task-manager/';
const TIMEOUT = 90000; // allow longer for commits to appear
const RUN_LIVE = process.env.PLAYWRIGHT_RUN_LIVE === '1' || process.env.RUN_LIVE_E2E === '1';
const LIVE_PASSWORD_AI_CAREER_ROADMAP = process.env.LIVE_PASSWORD_AI_CAREER_ROADMAP || 'ai-career-roadmap-1234';

async function waitForSaveToast(page, expectedText, timeout = 15000) {
  const toast = page.locator('#toast');
  await toast.waitFor({ state: 'visible', timeout });
  const toastText = await toast.textContent();
  if (!toastText.includes(expectedText)) throw new Error(`Expected toast to contain "${expectedText}", got: ${toastText}`);
  await toast.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

async function pollForCommitWithMessageContaining(page, repoOwner, repoName, needle, timeout = TIMEOUT) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const commits = await page.evaluate(async ({ owner, repo }) => {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`);
      if (!res.ok) return [];
      return await res.json();
    }, { owner: repoOwner, repo: repoName });

    if (Array.isArray(commits) && commits.length) {
      const found = commits.find(c => (c && c.commit && String(c.commit.message || '').includes(needle)));
      if (found) return found;
    }
    await page.waitForTimeout(3000);
  }
  return null;
}

function extractTaskDbCommitPayload(message) {
  const start = '---TASKDB_CHANGE_V1---';
  const end = '---/TASKDB_CHANGE_V1---';
  if (typeof message !== 'string') return null;
  const i = message.indexOf(start);
  const j = message.indexOf(end);
  if (i < 0 || j < 0 || j <= i) return null;
  const jsonText = message.slice(i + start.length, j).trim();
  try { return JSON.parse(jsonText); } catch { return null; }
}

test.describe('@live Verify commit subject + payload structure', () => {
  test.skip(!RUN_LIVE, 'Set PLAYWRIGHT_RUN_LIVE=1 to enable live-site tests');

  test('creates a task on ai-career-roadmap and verifies commit subject and payload', async ({ page }) => {
    await page.goto(LIVE_URL);
    // select project
    await page.locator('#projectSelect').selectOption('ai-career-roadmap');

    // wait for tasks list
    await page.waitForSelector('#totalTasks', { timeout: 30000 });

    // unlock
    await page.locator('.auth-indicator.locked').click();
    await page.waitForSelector('#passwordModal', { state: 'visible', timeout: 10000 });
    await page.locator('#accessPassword').fill(LIVE_PASSWORD_AI_CAREER_ROADMAP);
    await page.locator('#passwordModal button[type="submit"]').click();
    await page.waitForSelector('#passwordModal', { state: 'hidden', timeout: 10000 });
    await page.waitForSelector('.auth-indicator.unlocked', { timeout: 10000 });

    // create a new unique task
    const taskName = 'E2E Commit Verify';
    await page.locator('button:has-text("Add New Task")').click();
    await page.waitForSelector('#taskModal', { state: 'visible', timeout: 10000 });
    await page.locator('#taskName').fill(taskName + ' ' + Date.now()); // unique name for searching
    await page.locator('#taskDescription').fill('Verify commit message and payload structure');
    await page.locator('#taskStartDate').fill('2025-12-20');
    await page.locator('#taskEndDate').fill('2025-12-21');
    await page.locator('#taskEstimatedHours').fill('2');
    await page.locator('#taskForm button[type="submit"]').click();
    await page.waitForSelector('#taskModal', { state: 'hidden', timeout: 15000 });

    // wait for Worker save success
    await waitForSaveToast(page, 'to GitHub (via Worker)', 20000);

    // Poll GitHub commits for a commit containing our task name (with timestamp)
    const owner = 'NLarchive', repo = 'ai-career-roadmap';
    const found = await pollForCommitWithMessageContaining(page, owner, repo, taskName, TIMEOUT);
    expect(found).toBeTruthy();

    // Fetch full commit and inspect message + payload
    const commitDetail = await page.evaluate(async ({ owner, repo, sha }) => {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`);
      return res.ok ? await res.json() : null;
    }, { owner, repo, sha: found.sha });
    expect(commitDetail).toBeTruthy();

    const subjectLine = (commitDetail.commit.message || '').split('\n')[0] || '';
    expect(subjectLine.startsWith('TaskDB:')).toBeTruthy();

    // Subject should be compact and pipe-separated: TaskDB: <action> <id>|<name>|<description>
    const subjectBody = subjectLine.replace(/^TaskDB:\s*\w+\s+/, ''); // remove prefix
    const parts = subjectBody.split('|');
    expect(parts.length).toBeGreaterThanOrEqual(3);
    // first part is id
    expect(String(Number(parts[0]))).toMatch(/\d+/);
    // second part should contain our taskName (without timestamp in the middle)
    expect(String(parts[1])).toContain('E2E Commit Verify');
    // third part should contain the description
    expect(String(parts[2])).toContain('Verify commit message');

    // Commit payload should include the TASKDB_CHANGE_V1 block
    expect(commitDetail.commit.message.includes('---TASKDB_CHANGE_V1---')).toBeTruthy();
    const payload = extractTaskDbCommitPayload(commitDetail.commit.message);
    expect(payload).toBeTruthy();
    expect(Array.isArray(payload.events)).toBeTruthy();

    // find create event matching our task name
    const createEv = (payload.events || []).find(e => e && e.action === 'create' && e.task && String(e.task.task_name || '').includes('E2E Commit Verify'));
    expect(createEv).toBeTruthy();
  });
});
