#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { createInferenceManager } = require('../../main');

const DEFAULT_SUITE_PATH = path.join(__dirname, 'validation_cases.json');
const DEFAULT_RESULTS_DIR = path.join(__dirname, '..', 'results');
const DEFAULT_ENDPOINT = (process.env.LLM_ENDPOINT || 'http://127.0.0.1:8080').replace(/\/$/, '');
const REQUIRE_LIVE_INFERENCE = String(process.env.INFERENCE_REQUIRE_LIVE || '1') !== '0';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sanitizeText(value) {
  return String(value || '')
    .replace(/<\|channel\>thought\s*/gi, '')
    .replace(/<channel\|>\s*/gi, '')
    .replace(/<think>[\s\S]*?<\/think>\s*/gi, '')
    .replace(/^thought\s*\n+/i, '')
    .replace(/\r/g, '')
    .trim();
}

function canonicalize(value) {
  return sanitizeText(value)
    .toLowerCase()
    .replace(/^['"`\s]+|['"`\s]+$/g, '')
    .replace(/[.!?,;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function csvEscape(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows, headers) {
  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  });
  return `${lines.join('\n')}\n`;
}

function buildPrompt(caseEntry, suite) {
  const systemPrompt = suite.input_schema && suite.input_schema.system_prompt
    ? String(suite.input_schema.system_prompt)
    : 'Return only the final canonical answer.';
  return {
    prompt: String(caseEntry.input || ''),
    systemPrompt,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: String(caseEntry.input || '') },
    ],
    max_tokens: Number((suite.input_schema && suite.input_schema.max_tokens) || 32),
    temperature: 0,
    top_p: 0.95,
    top_k: 64,
  };
}

function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function computePromptTokenOverlap(prompt, answer) {
  const promptTokens = new Set(
    canonicalize(prompt)
      .split(/\s+/)
      .filter((token) => token.length >= 2)
  );
  const answerTokens = canonicalize(answer)
    .split(/\s+/)
    .filter((token) => token.length >= 2);
  if (!answerTokens.length) return 0;
  const shared = answerTokens.filter((token) => promptTokens.has(token)).length;
  return Number((shared / answerTokens.length).toFixed(4));
}

async function runCase(manager, engineId, context, suite, caseEntry) {
  const startedAt = Date.now();
  try {
    const raw = await manager.complete(buildPrompt(caseEntry, suite), { engineId, context });
    const text = sanitizeText(raw && (raw.content || raw.text || raw.generated_text || ''));
    const expectedCanonical = canonicalize(caseEntry.expected);
    const actualCanonical = canonicalize(text);
    const outputWords = countWords(text);
    const promptTokenOverlap = computePromptTokenOverlap(caseEntry.input, text);
    const offTopic = text.length >= 120 && promptTokenOverlap < 0.03;
    const qualityScore = Number((
      (actualCanonical === expectedCanonical ? 0.8 : 0) +
      Math.min(0.2, promptTokenOverlap)
    ).toFixed(4));

    return {
      engineId,
      caseId: caseEntry.id,
      prompt: caseEntry.input,
      expected: caseEntry.expected,
      answer: text,
      expectedCanonical,
      actualCanonical,
      passed: actualCanonical === expectedCanonical,
      outputCharacters: text.length,
      outputWords,
      promptTokenOverlap,
      qualityScore,
      offTopic,
      elapsedMs: Date.now() - startedAt,
      error: null,
      raw,
    };
  } catch (error) {
    return {
      engineId,
      caseId: caseEntry.id,
      prompt: caseEntry.input,
      expected: caseEntry.expected,
      answer: '',
      expectedCanonical: canonicalize(caseEntry.expected),
      actualCanonical: '',
      passed: false,
      outputCharacters: 0,
      outputWords: 0,
      promptTokenOverlap: 0,
      qualityScore: 0,
      offTopic: false,
      elapsedMs: Date.now() - startedAt,
      error: error && error.message ? error.message : String(error),
      raw: null,
    };
  }
}

function summarizeEngine(run) {
  const completed = run.caseResults.filter((entry) => !entry.error);
  const skipped = run.caseResults.filter((entry) => entry.skipped);
  const passed = run.caseResults.filter((entry) => entry.passed);
  const elapsedValues = completed.map((entry) => entry.elapsedMs);
  const charValues = completed.map((entry) => entry.outputCharacters);
  const wordValues = completed.map((entry) => entry.outputWords || 0);
  const qualityValues = completed.map((entry) => entry.qualityScore || 0);
  const offTopicCount = completed.filter((entry) => entry.offTopic).length;
  const accuracyBase = Math.max(1, completed.length);

  return {
    engineId: run.engineId,
    label: run.label,
    available: run.available,
    canInfer: run.canInfer,
    status: run.available && run.canInfer ? 'executed' : 'unavailable',
    reason: run.reason || '',
    casesTotal: run.caseResults.length,
    casesCompleted: completed.length,
    casesSkipped: skipped.length,
    passed: passed.length,
    failed: completed.length - passed.length,
    accuracy: completed.length ? Number((passed.length / accuracyBase).toFixed(4)) : 0,
    avgElapsedMs: elapsedValues.length ? Math.round(elapsedValues.reduce((sum, n) => sum + n, 0) / elapsedValues.length) : 0,
    avgOutputCharacters: charValues.length ? Math.round(charValues.reduce((sum, n) => sum + n, 0) / charValues.length) : 0,
    avgOutputWords: wordValues.length ? Number((wordValues.reduce((sum, n) => sum + n, 0) / wordValues.length).toFixed(2)) : 0,
    avgQualityScore: qualityValues.length ? Number((qualityValues.reduce((sum, n) => sum + n, 0) / qualityValues.length).toFixed(4)) : 0,
    offTopicCount,
  };
}

function buildTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function buildCaseLeaderboardRows(detailRows) {
  const byCase = new Map();
  detailRows.forEach((row) => {
    if (!row.caseId) return;
    if (!byCase.has(row.caseId)) byCase.set(row.caseId, []);
    byCase.get(row.caseId).push(row);
  });

  const rows = [];
  [...byCase.entries()]
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .forEach(([caseId, entries]) => {
      const ranked = [...entries].sort((a, b) => {
        if (Number(Boolean(a.skipped)) !== Number(Boolean(b.skipped))) {
          return Number(Boolean(a.skipped)) - Number(Boolean(b.skipped));
        }
        if (Number(b.passed) !== Number(a.passed)) return Number(b.passed) - Number(a.passed);
        if (a.elapsedMs !== b.elapsedMs) return a.elapsedMs - b.elapsedMs;
        if (a.outputCharacters !== b.outputCharacters) return a.outputCharacters - b.outputCharacters;
        return String(a.engineId).localeCompare(String(b.engineId));
      });
      ranked.forEach((entry, index) => {
        rows.push({
          caseId,
          rank: index + 1,
          engineId: entry.engineId,
          engineLabel: entry.engineLabel,
          passed: entry.passed,
          skipped: Boolean(entry.skipped),
          elapsedMs: entry.elapsedMs,
          outputCharacters: entry.outputCharacters,
          error: entry.error || '',
        });
      });
    });
  return rows;
}

async function runSuite(options = {}) {
  const suitePath = options.suitePath || DEFAULT_SUITE_PATH;
  const resultsDir = options.resultsDir || DEFAULT_RESULTS_DIR;
  const suite = readJson(suitePath);
  const manager = createInferenceManager();
  const context = manager.normalizeContext({
    runtime: 'node',
    modelPath: suite.model && suite.model.model_path ? suite.model.model_path : undefined,
    llmEndpoint: options.llmEndpoint || DEFAULT_ENDPOINT,
  });

  const checks = await manager.evaluateEngines(context);
  const liveChecks = checks.filter((check) => Boolean(check.probe && check.probe.available && check.probe.canInfer));
  if (REQUIRE_LIVE_INFERENCE && !liveChecks.length) {
    throw new Error(`No live inference engines available at ${context.llmEndpoint}. Start llama.cpp runtime or set INFERENCE_REQUIRE_LIVE=0 for diagnostic-only mode.`);
  }
  const engineRuns = [];

  for (const check of checks) {
    const run = {
      engineId: check.engineId,
      label: check.descriptor && check.descriptor.label ? check.descriptor.label : check.engineId,
      available: Boolean(check.probe && check.probe.available),
      canInfer: Boolean(check.probe && check.probe.canInfer),
      reason: check.probe && check.probe.reason ? check.probe.reason : '',
      compatibilityScore: check.compatibilityScore,
      caseResults: [],
    };

    if (run.available && run.canInfer) {
      for (const caseEntry of suite.cases || []) {
        run.caseResults.push(await runCase(manager, check.engineId, context, suite, caseEntry));
      }
    } else {
      run.caseResults = (suite.cases || []).map((caseEntry) => ({
        engineId: check.engineId,
        caseId: caseEntry.id,
        prompt: caseEntry.input,
        expected: caseEntry.expected,
        answer: '',
        expectedCanonical: canonicalize(caseEntry.expected),
        actualCanonical: '',
        passed: false,
        skipped: true,
        outputCharacters: 0,
        outputWords: 0,
        promptTokenOverlap: 0,
        qualityScore: 0,
        offTopic: false,
        elapsedMs: 0,
        error: run.reason || 'Engine unavailable',
        raw: null,
      }));
    }

    engineRuns.push(run);
  }

  const summary = engineRuns.map(summarizeEngine).sort((a, b) => {
    if (b.passed !== a.passed) return b.passed - a.passed;
    if (a.avgElapsedMs !== b.avgElapsedMs) return a.avgElapsedMs - b.avgElapsedMs;
    return a.avgOutputCharacters - b.avgOutputCharacters;
  });

  const winner = summary.find((entry) => entry.status === 'executed') || null;
  const detailRows = engineRuns.flatMap((run) => run.caseResults.map((entry) => ({
    engineId: run.engineId,
    engineLabel: run.label,
    engineAvailable: run.available,
    engineCanInfer: run.canInfer,
    compatibilityScore: run.compatibilityScore,
    caseId: entry.caseId,
    prompt: entry.prompt,
    expected: entry.expected,
    answer: entry.answer,
    expectedCanonical: entry.expectedCanonical,
    actualCanonical: entry.actualCanonical,
    passed: entry.passed,
    outputCharacters: entry.outputCharacters,
    outputWords: entry.outputWords,
    promptTokenOverlap: entry.promptTokenOverlap,
    qualityScore: entry.qualityScore,
    offTopic: entry.offTopic,
    skipped: Boolean(entry.skipped),
    elapsedMs: entry.elapsedMs,
    error: entry.error || '',
  })));

  const report = {
    suiteId: suite.suite_id || path.basename(suitePath, '.json'),
    timestamp: new Date().toISOString(),
    suitePath,
    context,
    liveInferenceRequired: REQUIRE_LIVE_INFERENCE,
    model: suite.model || null,
    winner,
    engineSummary: summary,
    detailRows,
    caseLeaderboardRows: buildCaseLeaderboardRows(detailRows),
  };

  fs.mkdirSync(resultsDir, { recursive: true });
  const stamp = buildTimestamp();
  const stem = `${report.suiteId}-${stamp}`;
  const summaryPath = path.join(resultsDir, `${stem}-summary.csv`);
  const detailsPath = path.join(resultsDir, `${stem}-details.csv`);
  const caseLeaderboardPath = path.join(resultsDir, `${stem}-case-leaderboard.csv`);
  const jsonPath = path.join(resultsDir, `${stem}-report.json`);
  const latestSummaryPath = path.join(resultsDir, `${report.suiteId}-latest-summary.csv`);
  const latestDetailsPath = path.join(resultsDir, `${report.suiteId}-latest-details.csv`);
  const latestCaseLeaderboardPath = path.join(resultsDir, `${report.suiteId}-latest-case-leaderboard.csv`);
  const latestJsonPath = path.join(resultsDir, `${report.suiteId}-latest-report.json`);

  const summaryCsv = toCsv(summary, [
    'engineId',
    'label',
    'available',
    'canInfer',
    'status',
    'reason',
    'casesTotal',
    'casesCompleted',
    'casesSkipped',
    'passed',
    'failed',
    'accuracy',
    'avgElapsedMs',
    'avgOutputCharacters',
    'avgOutputWords',
    'avgQualityScore',
    'offTopicCount',
  ]);
  const detailsCsv = toCsv(detailRows, [
    'engineId',
    'engineLabel',
    'engineAvailable',
    'engineCanInfer',
    'compatibilityScore',
    'caseId',
    'prompt',
    'expected',
    'answer',
    'expectedCanonical',
    'actualCanonical',
    'passed',
    'outputCharacters',
    'outputWords',
    'promptTokenOverlap',
    'qualityScore',
    'offTopic',
    'skipped',
    'elapsedMs',
    'error',
  ]);
  const caseLeaderboardCsv = toCsv(report.caseLeaderboardRows, [
    'caseId',
    'rank',
    'engineId',
    'engineLabel',
    'passed',
    'skipped',
    'elapsedMs',
    'outputCharacters',
    'error',
  ]);

  fs.writeFileSync(summaryPath, summaryCsv, 'utf8');
  fs.writeFileSync(detailsPath, detailsCsv, 'utf8');
  fs.writeFileSync(caseLeaderboardPath, caseLeaderboardCsv, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(latestSummaryPath, summaryCsv, 'utf8');
  fs.writeFileSync(latestDetailsPath, detailsCsv, 'utf8');
  fs.writeFileSync(latestCaseLeaderboardPath, caseLeaderboardCsv, 'utf8');
  fs.writeFileSync(latestJsonPath, JSON.stringify(report, null, 2), 'utf8');

  return {
    report,
    paths: {
      summaryPath,
      detailsPath,
      caseLeaderboardPath,
      jsonPath,
      latestSummaryPath,
      latestDetailsPath,
      latestCaseLeaderboardPath,
      latestJsonPath,
    },
  };
}

async function main() {
  const suitePath = process.argv[2] || DEFAULT_SUITE_PATH;
  const resultsDir = process.argv[3] || DEFAULT_RESULTS_DIR;
  const { report, paths } = await runSuite({ suitePath, resultsDir });

  console.log(`Suite: ${report.suiteId}`);
  console.log(`Winner: ${report.winner ? report.winner.engineId : 'none'}`);
  console.log(`Summary CSV: ${paths.summaryPath}`);
  console.log(`Details CSV: ${paths.detailsPath}`);
  console.log(`Case leaderboard CSV: ${paths.caseLeaderboardPath}`);
  console.log(`JSON report: ${paths.jsonPath}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error && error.message ? error.message : String(error));
    process.exit(1);
  });
}

module.exports = {
  runSuite,
};