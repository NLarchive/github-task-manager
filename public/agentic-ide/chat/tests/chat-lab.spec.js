import { test, expect } from '@playwright/test';

test.describe('agentic-ide chat lab', () => {
  test('loads clean defaults, enforces backend policy, and validates response quality checks', async ({ page }) => {
    await page.route('**/api/registry', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': '*' } });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ models: [{ id: 'qwen2.5-coder:7b', label: 'Qwen 2.5 Coder 7B', type: 'model' }] })
      });
    });
    await page.route('**/api/model', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': '*' } });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({
          models: [],
          inference: {
            activeEngine: 'llama-server-openai',
            engineOptions: [
              { id: 'llama-server-openai', label: 'llama-server OpenAI API', environment: 'node', canInfer: true, benchmarkActive: true }
            ]
          }
        })
      });
    });
    await page.route('**/api/llm/complete', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': '*' } });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ output: 'Here is a clear response with actionable guidance for your JavaScript client integration.' })
      });
    });

    await page.goto('/agentic-ide/chat/index.html');

    await expect(page.locator('h1')).toContainText('Chat Lab');
    await expect(page.locator('text=8. Memory Evaluation')).toBeVisible();

    await expect(page.locator('#cfg-include-history')).not.toBeChecked();
    await expect(page.locator('#cfg-system-prompt')).toHaveValue('');
    await expect(page.locator('#cfg-backend option')).toHaveCount(1);
    await expect(page.locator('#cfg-backend')).toHaveValue('llama-server-openai');

    await page.fill('#chat-input', 'test prompt for copy');
    await page.click('#btn-send');
    await expect(page.locator('.msg.user .msg-body').last()).toContainText('test prompt for copy');
    await expect(page.locator('.msg.assistant .msg-body').last()).toContainText('clear response with actionable guidance');

    await page.click('#btn-run-chat-self-tests');
    await expect(page.locator('#toast')).toContainText('Self-tests:');

    await page.click('#btn-export-test-results');
    await page.click('#btn-export-logs');

    const qualityCheck = await page.evaluate(() => {
      const raw = localStorage.getItem('agentic-chat-lab-v2');
      const parsed = raw ? JSON.parse(raw) : null;
      const tests = Array.isArray(parsed?.testResults) ? parsed.testResults : [];
      return tests.find((item) => item.name === 'last assistant response looks meaningful') || null;
    });

    expect(qualityCheck).not.toBeNull();
    expect(qualityCheck.passed).toBeTruthy();

    await expect(page.locator('#btn-send')).toBeVisible();
    await expect(page.locator('#thread')).toBeVisible();
  });

  test('self-tests flag gibberish assistant responses', async ({ page }) => {
    await page.addInitScript(() => {
      const payload = {
        config: { backend: 'llama_cpp' },
        history: [
          { role: 'assistant', content: '//// ???? //// ???? //// ???? //// ????', createdAt: new Date().toISOString() }
        ]
      };
      localStorage.setItem('agentic-chat-lab-v2', JSON.stringify(payload));
    });

    await page.goto('/agentic-ide/chat/index.html');
    await page.click('#btn-run-chat-self-tests');

    const qualityCheck = await page.evaluate(() => {
      const raw = localStorage.getItem('agentic-chat-lab-v2');
      const parsed = raw ? JSON.parse(raw) : null;
      const tests = Array.isArray(parsed?.testResults) ? parsed.testResults : [];
      return tests.find((item) => item.name === 'last assistant response looks meaningful') || null;
    });

    expect(qualityCheck).not.toBeNull();
    expect(qualityCheck.passed).toBeFalsy();
  });
});
