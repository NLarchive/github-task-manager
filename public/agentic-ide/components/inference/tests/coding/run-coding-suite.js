#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const vm = require('vm');
const { createInferenceManager } = require('../../main');

const DEFAULT_SUITE_PATH = path.join(__dirname, 'coding_cases.json');
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

function trimToExecutablePrefix(candidate) {
  const lines = String(candidate || '').split('\n');
  for (let end = lines.length; end >= 1; end -= 1) {
    const snippet = lines.slice(0, end).join('\n').trim();
    if (!snippet) continue;
    try {
      new vm.Script(`${snippet}\n;void 0;`);
      return snippet;
    } catch {
      // Keep shrinking until the prefix is valid JavaScript.
    }
  }
  return String(candidate || '').trim();
}

function extractCode(text, functionName) {
  const sanitized = sanitizeText(text);
  const fencedMatch = sanitized.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
  const unfenced = fencedMatch ? fencedMatch[1] : sanitized;
  const normalized = unfenced
    .replace(/^javascript\s*/i, '')
    .replace(/^js\s*/i, '')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+/gm, '')
    .trim();
  const patterns = [
    new RegExp(`\\bfunction\\s+${functionName}\\b`),
    new RegExp(`\\bconst\\s+${functionName}\\b`),
    new RegExp(`\\blet\\s+${functionName}\\b`),
    new RegExp(`\\bvar\\s+${functionName}\\b`),
    /\bmodule\.exports\b/,
    new RegExp(`\\bexports\\.${functionName}\\b`),
  ];
  let startIndex = -1;
  for (const pattern of patterns) {
    const match = pattern.exec(normalized);
    if (match && (startIndex === -1 || match.index < startIndex)) startIndex = match.index;
  }
  const candidate = startIndex >= 0 ? normalized.slice(startIndex) : normalized;
  return trimToExecutablePrefix(candidate);
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
    : 'Solve the user task with JavaScript code only.';
  const prompt = String(caseEntry.prompt || '');
  return {
    prompt,
    systemPrompt,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    max_tokens: Number((suite.input_schema && suite.input_schema.max_tokens) || 512),
    temperature: Number((suite.input_schema && suite.input_schema.temperature) || 0),
    top_p: 0.95,
    top_k: 64,
  };
}

function deepClone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function createExecutionContext() {
  return vm.createContext({
    module: { exports: {} },
    exports: {},
    console: { log() {}, error() {}, warn() {}, info() {} },
    URLSearchParams,
    Math,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Date,
    RegExp,
    encodeURIComponent,
    decodeURIComponent,
    globalThis: null,
  });
}

function loadCandidateFunction(code, functionName) {
  const context = createExecutionContext();
  context.globalThis = context;
  const bootstrap = `${code}\n;globalThis.__candidate = typeof ${functionName} !== 'undefined' ? ${functionName} : (typeof module !== 'undefined' && module.exports ? (typeof module.exports === 'function' ? module.exports : module.exports['${functionName}']) : undefined) || (typeof exports !== 'undefined' ? (typeof exports === 'function' ? exports : exports['${functionName}']) : undefined) || globalThis['${functionName}'];`;
  const script = new vm.Script(bootstrap, { filename: `${functionName}.generated.js` });
  script.runInContext(context, { timeout: 1000 });
  if (typeof context.__candidate !== 'function') {
    throw new Error(`Generated code did not expose function '${functionName}'.`);
  }
  return context;
}

function executeTest(context, test) {
  context.__args = deepClone(test.args || []);
  const script = new vm.Script('globalThis.__result = globalThis.__candidate(...globalThis.__args);');
  script.runInContext(context, { timeout: 1000 });
  return deepClone(context.__result);
}

function compareResult(actual, expect) {
  const assertion = expect && expect.type ? expect.type : 'deepEqual';
  if (assertion === 'approx') {
    const tolerance = Number(expect.tolerance || 0.000001);
    return Math.abs(Number(actual) - Number(expect.value)) <= tolerance;
  }
  return util.isDeepStrictEqual(actual, expect ? expect.value : undefined);
}

function summarizeEngine(run) {
  const completed = run.caseResults.filter((entry) => !entry.skipped);
  const skipped = run.caseResults.filter((entry) => entry.skipped);
  const passed = run.caseResults.filter((entry) => entry.passed);
  const generationValues = completed.map((entry) => entry.generationMs);
  const executionValues = completed.map((entry) => entry.executionMs);
  const codeLengths = completed.map((entry) => entry.codeLength);
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
    accuracy: completed.length ? Number((passed.length / completed.length).toFixed(4)) : 0,
    avgGenerationMs: generationValues.length ? Math.round(generationValues.reduce((sum, n) => sum + n, 0) / generationValues.length) : 0,
    avgExecutionMs: executionValues.length ? Math.round(executionValues.reduce((sum, n) => sum + n, 0) / executionValues.length) : 0,
    avgCodeLength: codeLengths.length ? Math.round(codeLengths.reduce((sum, n) => sum + n, 0) / codeLengths.length) : 0,
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
        const aTotal = Number(a.generationMs || 0) + Number(a.executionMs || 0);
        const bTotal = Number(b.generationMs || 0) + Number(b.executionMs || 0);
        if (aTotal !== bTotal) return aTotal - bTotal;
        if (a.codeLength !== b.codeLength) return a.codeLength - b.codeLength;
        return String(a.engineId).localeCompare(String(b.engineId));
      });
      ranked.forEach((entry, index) => {
        rows.push({
          caseId,
          rank: index + 1,
          engineId: entry.engineId,
          engineLabel: entry.engineLabel,
          passed: entry.passed,
          generationMs: entry.generationMs,
          executionMs: entry.executionMs,
          codeLength: entry.codeLength,
          error: entry.error || '',
        });
      });
    });

  return rows;
}

async function runCase(manager, engineId, context, suite, caseEntry) {
  const promptPayload = buildPrompt(caseEntry, suite);
  const generationStartedAt = Date.now();
  let rawText = '';
  let code = '';
  try {
    const raw = await manager.complete(promptPayload, { engineId, context });
    rawText = raw && (raw.content || raw.text || raw.generated_text || '');
    code = extractCode(rawText, caseEntry.function_name);
    const generationMs = Date.now() - generationStartedAt;
    const executionStartedAt = Date.now();
    const vmContext = loadCandidateFunction(code, caseEntry.function_name);
    const testResults = [];
    for (const test of caseEntry.tests || []) {
      const actual = executeTest(vmContext, test);
      const matched = compareResult(actual, test.expect);
      testResults.push({
        args: test.args,
        expected: test.expect ? test.expect.value : undefined,
        actual,
        passed: matched,
      });
      if (!matched) {
        return {
          engineId,
          caseId: caseEntry.id,
          title: caseEntry.title,
          sourceComponent: caseEntry.source_component,
          functionName: caseEntry.function_name,
          passed: false,
          generationMs,
          executionMs: Date.now() - executionStartedAt,
          codeLength: code.length,
          prompt: caseEntry.prompt,
          code,
          answer: sanitizeText(rawText),
          error: `Assertion failed. Expected ${JSON.stringify(test.expect ? test.expect.value : undefined)}, got ${JSON.stringify(actual)}`,
          testResults,
        };
      }
    }
    return {
      engineId,
      caseId: caseEntry.id,
      title: caseEntry.title,
      sourceComponent: caseEntry.source_component,
      functionName: caseEntry.function_name,
      passed: true,
      generationMs,
      executionMs: Date.now() - executionStartedAt,
      codeLength: code.length,
      prompt: caseEntry.prompt,
      code,
      answer: sanitizeText(rawText),
      error: null,
      testResults,
    };
  } catch (error) {
    return {
      engineId,
      caseId: caseEntry.id,
      title: caseEntry.title,
      sourceComponent: caseEntry.source_component,
      functionName: caseEntry.function_name,
      passed: false,
      generationMs: Date.now() - generationStartedAt,
      executionMs: 0,
      codeLength: code.length,
      prompt: caseEntry.prompt,
      code,
      answer: sanitizeText(rawText),
      error: error && error.message ? error.message : String(error),
      testResults: [],
    };
  }
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
        title: caseEntry.title,
        sourceComponent: caseEntry.source_component,
        functionName: caseEntry.function_name,
        passed: false,
        skipped: true,
        generationMs: 0,
        executionMs: 0,
        codeLength: 0,
        prompt: caseEntry.prompt,
        code: '',
        answer: '',
        error: run.reason || 'Engine unavailable',
        testResults: [],
      }));
    }
    engineRuns.push(run);
  }

  const summary = engineRuns.map(summarizeEngine).sort((a, b) => {
    if (b.passed !== a.passed) return b.passed - a.passed;
    if (a.avgGenerationMs !== b.avgGenerationMs) return a.avgGenerationMs - b.avgGenerationMs;
    return a.avgExecutionMs - b.avgExecutionMs;
  });

  const winner = summary.find((entry) => entry.status === 'executed') || null;
  const detailRows = engineRuns.flatMap((run) => run.caseResults.map((entry) => ({
    engineId: run.engineId,
    engineLabel: run.label,
    engineAvailable: run.available,
    engineCanInfer: run.canInfer,
    compatibilityScore: run.compatibilityScore,
    caseId: entry.caseId,
    title: entry.title,
    sourceComponent: entry.sourceComponent,
    functionName: entry.functionName,
    passed: entry.passed,
    skipped: Boolean(entry.skipped),
    generationMs: entry.generationMs,
    executionMs: entry.executionMs,
    codeLength: entry.codeLength,
    error: entry.error || '',
    prompt: entry.prompt,
    code: entry.code,
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
    engineRuns,
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
    'avgGenerationMs',
    'avgExecutionMs',
    'avgCodeLength',
  ]);
  const detailsCsv = toCsv(detailRows, [
    'engineId',
    'engineLabel',
    'engineAvailable',
    'engineCanInfer',
    'compatibilityScore',
    'caseId',
    'title',
    'sourceComponent',
    'functionName',
    'passed',
    'skipped',
    'generationMs',
    'executionMs',
    'codeLength',
    'error',
    'prompt',
    'code',
  ]);
  const caseLeaderboardCsv = toCsv(report.caseLeaderboardRows, [
    'caseId',
    'rank',
    'engineId',
    'engineLabel',
    'passed',
    'skipped',
    'generationMs',
    'executionMs',
    'codeLength',
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
  extractCode,
};