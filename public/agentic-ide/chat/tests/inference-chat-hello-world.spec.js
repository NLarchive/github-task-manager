/**
 * inference-chat-hello-world.spec.js
 *
 * Playwright end-to-end test — "hello world" inference conformance via the Chat UI.
 *
 * What this tests:
 *   1. Bridge status badge reflects server state.
 *   2. Chat modal opens and the textarea + send button are usable.
 *   3. Sending "Reply with only this exact text and nothing else: hello world"
 *      produces an assistant reply that contains the words "hello world".
 *   4. Verbosity is measured (character count — lower is better).
 *   5. Any bridge / LLM error messages surfaced in the chat thread are captured
 *      and reported in the test output.
 *
 * Prerequisites (must be running before this spec):
 *   • node server.js          (or started by the Playwright webServer config)
 *   • node public/agentic-ide/js/bridge-server.js   → port 3131
 *   • llama-server            → port 8080  (optional — test degrades gracefully)
 *
 * Run:
 *   npx playwright test \
 *     --config=tests/agentic-ide/playwright.config.js \
 *     tests/agentic-ide/inference-chat-hello-world.spec.js
 *
 * Headful mode (for debugging):
 *   PLAYWRIGHT_HEADFUL=1 npx playwright test --config=tests/agentic-ide/playwright.config.js
 */
import { test, expect } from '@playwright/test';

const AGENTIC_IDE_PATH = '/agentic-ide/index.html';
const TEST_PROMPT      = 'Reply with only this exact text and nothing else: hello world';

// How long to wait for the LLM assistant reply (ms)
const REPLY_TIMEOUT = 100_000;

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Wait for the page JS to settle (bridge status + model select populated).
 */
async function waitForPageReady(page) {
  // Wait for the bridge-status-badge to leave the initial "Bridge unknown" state
  await page.waitForFunction(
    () => {
      const badge = document.getElementById('bridge-status-badge');
      return badge && badge.textContent !== 'Bridge unknown';
    },
    { timeout: 20_000 }
  );
}

/**
 * Open the Chat modal by clicking the btn-chat button.
 */
async function openChat(page) {
  const btn = page.locator('#btn-chat');
  await btn.waitFor({ state: 'visible', timeout: 10_000 });
  await btn.click();
  await page.locator('#chat-modal').waitFor({ state: 'visible', timeout: 5_000 });
}

/**
 * Read all messages currently in the chat thread.
 * Returns an array of { role, text } objects.
 */
async function readChatMessages(page) {
  return page.evaluate(() => {
    const msgs = document.querySelectorAll('#chat-thread .chat-msg');
    return [...msgs].map((el) => ({
      role: el.classList.contains('is-assistant') ? 'assistant' : 'user',
      text: (el.querySelector('.chat-msg-body') || el).textContent || '',
    }));
  });
}

/**
 * Wait until at least one new assistant message appears in the chat thread
 * after sending (polls until count increases or timeout).
 */
async function waitForAssistantReply(page, prevCount) {
  await page.waitForFunction(
    (prev) => {
      const msgs = document.querySelectorAll('#chat-thread .chat-msg.is-assistant');
      return msgs.length > prev;
    },
    prevCount,
    { timeout: REPLY_TIMEOUT }
  );
}

// ── test suite ────────────────────────────────────────────────────────────────

test.describe('@live inference chat — hello world conformance', () => {
  let errorLog = [];

  test.beforeEach(async ({ page }) => {
    errorLog = [];

    // Capture all browser-side console errors and page errors
    page.on('pageerror', (err) => {
      errorLog.push({ type: 'pageerror', message: err && err.message ? err.message : String(err) });
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorLog.push({ type: 'console:error', message: msg.text() });
      }
    });
    page.on('requestfailed', (req) => {
      errorLog.push({ type: 'requestfailed', url: req.url(), error: req.failure()?.errorText || '' });
    });
  });

  test('chat modal exists and opens', async ({ page }) => {
    await page.goto(AGENTIC_IDE_PATH);
    await waitForPageReady(page);

    // btn-chat must be present
    const btn = page.locator('#btn-chat');
    await expect(btn).toBeVisible();

    await openChat(page);

    // Modal is open
    await expect(page.locator('#chat-modal')).toBeVisible();
    await expect(page.locator('#chat-input')).toBeVisible();
    await expect(page.locator('#chat-send')).toBeVisible();
  });

  test('bridge status badge reports server state', async ({ page }) => {
    await page.goto(AGENTIC_IDE_PATH);
    await waitForPageReady(page);

    const badgeText = await page.locator('#bridge-status-badge').textContent();
    console.log(`[bridge-status] "${badgeText?.trim()}"`);

    // The badge must not be stuck at the unknown placeholder
    expect(badgeText?.trim()).not.toBe('Bridge unknown');

    // Surface in output so the CI log is informative
    if (!/online/i.test(badgeText || '')) {
      console.warn(`[bridge-status] Not fully online: "${badgeText?.trim()}". Inference test may be skipped.`);
    }
  });

  test('hello world: model replies containing "hello world" with low verbosity', async ({ page }) => {
    await page.goto(AGENTIC_IDE_PATH);
    await waitForPageReady(page);

    // ── check bridge status ────────────────────────────────────────────────
    const badgeText = (await page.locator('#bridge-status-badge').textContent())?.trim() || '';
    console.log(`[bridge-status] "${badgeText}"`);

    const bridgeOnline = /bridge.*online|bridge \+ llm/i.test(badgeText);
    if (!bridgeOnline) {
      console.log(`[skip-reason] Bridge not online ("${badgeText}"). Marking test as skipped.`);
      test.skip(true, `Bridge not online: "${badgeText}"`);
      return;
    }

    // ── open chat ─────────────────────────────────────────────────────────
    await openChat(page);

    // ── optionally clear system prompt for a cleaner test ─────────────────
    const systemPromptEl = page.locator('#chat-system-prompt');
    const isVisible = await systemPromptEl.isVisible().catch(() => false);
    if (isVisible) {
      const detailsEl = page.locator('details');
      if (await detailsEl.isVisible()) {
        // open the details block
        const summaryEl = page.locator('details summary');
        if (!(await detailsEl.evaluate((el) => el.open))) {
          await summaryEl.click();
        }
        await systemPromptEl.fill('You are a simple echo bot. Follow the user instruction exactly.');
      }
    }

    // Count how many assistant messages exist before sending
    const prevAssistantCount = await page.evaluate(
      () => document.querySelectorAll('#chat-thread .chat-msg.is-assistant').length
    );

    // ── send the test prompt ───────────────────────────────────────────────
    const startTime = Date.now();
    await page.locator('#chat-input').fill(TEST_PROMPT);
    await page.locator('#chat-send').click();

    console.log(`[prompt-sent] "${TEST_PROMPT}"`);

    // ── wait for reply ─────────────────────────────────────────────────────
    await waitForAssistantReply(page, prevAssistantCount);
    const latencyMs = Date.now() - startTime;

    // ── collect all messages ───────────────────────────────────────────────
    const allMessages = await readChatMessages(page);
    const assistantMsgs = allMessages.filter((m) => m.role === 'assistant');
    const latestReply = assistantMsgs[assistantMsgs.length - 1]?.text || '';

    console.log(`[latency]       ${latencyMs}ms`);
    console.log(`[reply]         "${latestReply.slice(0, 160).replace(/\n/g, '\\n')}"`);
    console.log(`[chars]         ${latestReply.trim().length}`);

    // ── surface any error messages from the chat thread ────────────────────
    const isErrorMessage = /^⚠/.test(latestReply.trim());
    if (isErrorMessage) {
      console.error(`[ui-error]      The chat thread shows an error: "${latestReply.trim()}"`);
    }
    if (errorLog.length) {
      console.log(`[browser-errors] ${JSON.stringify(errorLog)}`);
    }

    // ── quality-warning check ──────────────────────────────────────────────
    const hasQualityWarning = /\[quality-warning\]/i.test(latestReply);
    if (hasQualityWarning) {
      console.warn(`[quality-warning] Model output triggered the quality inspector: "${latestReply.trim()}"`);
    }

    // ── verbosity metrics ──────────────────────────────────────────────────
    const trimmedReply = latestReply.trim().replace(/\s+/g, ' ');
    const charCount    = trimmedReply.length;
    const wordCount    = trimmedReply.split(/\s+/).filter(Boolean).length;
    const isExact      = trimmedReply.toLowerCase() === 'hello world';

    console.log(`[word-count]    ${wordCount}`);
    console.log(`[exact-match]   ${isExact}`);

    if (charCount > 200) {
      console.warn(`[verbosity]     Reply is verbose (${charCount} chars). Less is better for this task.`);
    }

    // ── core assertion ─────────────────────────────────────────────────────
    // The reply must not be an offline/error placeholder
    expect(latestReply.trim(), 'Expected a real model reply, not an error placeholder').not.toMatch(/^⚠/);

    // The reply must contain "hello world"
    expect(latestReply.toLowerCase(), 'Response must contain "hello world"').toContain('hello world');

    // ── informational output ───────────────────────────────────────────────
    console.log('');
    console.log('=== Conformance Result ===');
    console.log(`  PASS — model echoed "hello world"`);
    console.log(`  Chars     : ${charCount}  (ideal = 11 for exact "hello world")`);
    console.log(`  Words     : ${wordCount}`);
    console.log(`  Exact     : ${isExact}`);
    console.log(`  Latency   : ${latencyMs}ms`);
    console.log('==========================');
  });
});
