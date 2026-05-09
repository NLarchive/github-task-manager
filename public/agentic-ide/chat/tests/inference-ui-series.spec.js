import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const CHAT_PATH = '/agentic-ide/chat/index.html';
const INFERENCE_DASHBOARD_PATH = '/agentic-ide/components/inference/tests/index.html';
const TEXT_CASES_PATH = path.join(process.cwd(), 'public', 'agentic-ide', 'components', 'inference', 'tests', 'text', 'validation_cases.json');
const CODING_CASES_PATH = path.join(process.cwd(), 'public', 'agentic-ide', 'components', 'inference', 'tests', 'coding', 'coding_cases.json');

const TEXT_CASE_LIMIT = Number(process.env.PW_INFERENCE_TEXT_CASES || '6');
const CODING_CASE_LIMIT = Number(process.env.PW_INFERENCE_CODING_CASES || '3');
const ENGINE_LIMIT = Number(process.env.PW_INFERENCE_ENGINES || '3');
const MIN_TEXT_ACCURACY = Number(process.env.PW_INFERENCE_MIN_TEXT_ACCURACY || '0');
const MIN_CODING_CODELIKE = Number(process.env.PW_INFERENCE_MIN_CODING_CODELIKE || '0');
const MIN_LIVE_ENGINES = Number(process.env.PW_INFERENCE_MIN_LIVE_ENGINES || '1');

function loadCases(filePath, key) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed[key]) ? parsed[key] : [];
}

function canonicalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/^['"`\s]+|['"`\s]+$/g, '')
    .replace(/[.!?,;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function waitForBridgeStatus(page) {
  await page.waitForFunction(() => {
    const el = document.getElementById('bridge-status');
    return !!el && !/unknown/i.test(el.textContent || '');
  }, { timeout: 25000 });
}

async function getAssistantCount(page) {
  return page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('.msg.assistant'));
    return all.filter((el) => !!el.querySelector('.msg-actions')).length;
  });
}

async function getLatestAssistantMessage(page) {
  const last = page.locator('.msg.assistant .msg-body').last();
  await expect(last).toBeVisible({ timeout: 10000 });
  return String((await last.textContent()) || '').trim();
}

async function sendPrompt(page, prompt) {
  const prevCount = await getAssistantCount(page);
  await page.fill('#chat-input', prompt);
  await page.click('#btn-send');
  await page.waitForFunction((count) => {
    const all = Array.from(document.querySelectorAll('.msg.assistant'));
    const real = all.filter((el) => !!el.querySelector('.msg-actions')).length;
    return real > count;
  }, prevCount, { timeout: 120000 });
  return getLatestAssistantMessage(page);
}

test.describe('@live inference ui series', () => {
  test('inference dashboard renders latest report tables', async ({ page }) => {
    await page.goto(INFERENCE_DASHBOARD_PATH);

    await expect(page.locator('h1')).toContainText('Inference Text + Coding Benchmark Dashboard');
    await expect(page.locator('#summaryCards .card')).toHaveCount(3);

    await expect.poll(async () => page.locator('#textSummaryTable thead th').count()).toBeGreaterThan(0);
    await expect.poll(async () => page.locator('#codingSummaryTable thead th').count()).toBeGreaterThan(0);
    await expect.poll(async () => page.locator('#engineDecisionTable tbody tr').count()).toBeGreaterThan(0);
  });

  test('chat ui runs text and coding case series across engines', async ({ page }) => {
    test.setTimeout(15 * 60 * 1000);

    const textCases = loadCases(TEXT_CASES_PATH, 'cases').slice(0, TEXT_CASE_LIMIT);
    const codingCases = loadCases(CODING_CASES_PATH, 'cases').slice(0, CODING_CASE_LIMIT);

    expect(textCases.length).toBeGreaterThan(0);
    expect(codingCases.length).toBeGreaterThan(0);

    await page.goto(CHAT_PATH);
    await waitForBridgeStatus(page);

    const bridgeStatus = String((await page.locator('#bridge-status').textContent()) || '').trim();
    if (/offline/i.test(bridgeStatus)) {
      test.skip(true, `Bridge is offline: ${bridgeStatus}`);
      return;
    }

    const engineOptions = await page.$$eval('#cfg-backend option', (options) =>
      options.map((option) => ({ value: option.value, label: option.textContent || option.value }))
    );

    expect(engineOptions.length).toBeGreaterThan(0);

    const selectedEngines = engineOptions.slice(0, Math.max(1, ENGINE_LIMIT));
    const runResults = [];
    const liveEngines = [];
    const skippedEngines = [];

    for (const engine of selectedEngines) {
      await page.selectOption('#cfg-backend', engine.value);

      const probeResponse = await sendPrompt(page, 'What is 1+1? Return only the answer.');
      if (/^⚠/.test(probeResponse)) {
        skippedEngines.push({ engineId: engine.value, reason: probeResponse });
        continue;
      }
      liveEngines.push(engine.value);

      for (const caseEntry of textCases) {
        const response = await sendPrompt(page, String(caseEntry.input || ''));
        const expected = canonicalize(caseEntry.expected);
        const actual = canonicalize(response);
        const hasError = /^⚠/.test(response);
        const passed = !hasError && (actual === expected || actual.includes(expected));

        runResults.push({
          suite: 'text',
          engineId: engine.value,
          caseId: caseEntry.id,
          passed,
          hasError,
          responsePreview: response.slice(0, 140),
        });
      }

      for (const caseEntry of codingCases) {
        const codingPrompt = `${caseEntry.prompt}\nReturn only JavaScript source code.`;
        const response = await sendPrompt(page, codingPrompt);
        const looksLikeCode = /function|=>|const|let|var|class|return|export/.test(response);
        const noError = !/^⚠/.test(response);

        runResults.push({
          suite: 'coding',
          engineId: engine.value,
          caseId: caseEntry.id,
          passed: noError && looksLikeCode,
          hasError: !noError,
          responsePreview: response.slice(0, 140),
        });
      }
    }

    const textResults = runResults.filter((entry) => entry.suite === 'text');
    const codingResults = runResults.filter((entry) => entry.suite === 'coding');
    const textAccuracy = textResults.length
      ? textResults.filter((entry) => entry.passed).length / textResults.length
      : 0;
    const codingCodeLikeRate = codingResults.length
      ? codingResults.filter((entry) => entry.passed).length / codingResults.length
      : 0;

    console.log('[inference-ui-series] run results:', JSON.stringify(runResults, null, 2));
    console.log('[inference-ui-series] summary:', JSON.stringify({
      engines: selectedEngines.map((entry) => entry.value),
      textCases: textResults.length,
      codingCases: codingResults.length,
      textAccuracy,
      codingCodeLikeRate,
      minTextAccuracy: MIN_TEXT_ACCURACY,
      minCodingCodeLikeRate: MIN_CODING_CODELIKE,
      liveEngines,
      skippedEngines,
    }, null, 2));

    expect(liveEngines.length).toBeGreaterThanOrEqual(MIN_LIVE_ENGINES);
    expect(textAccuracy).toBeGreaterThanOrEqual(MIN_TEXT_ACCURACY);
    expect(codingCodeLikeRate).toBeGreaterThanOrEqual(MIN_CODING_CODELIKE);
  });
});
