#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, 'results');
const KNOWN_ENGINE_IDS = [
  'llama-server-openai',
  'node-llama-cpp',
  'duck4i-llama',
  'llama3pure',
  'llmjs',
  'webllm',
  'hyllama',
];

function pickBestReportPath(resultsDir, suitePrefix) {
  const latestAliasPath = path.join(resultsDir, `${suitePrefix}-latest-report.json`);
  const candidates = [];

  if (fs.existsSync(latestAliasPath)) {
    candidates.push(latestAliasPath);
  }

  fs.readdirSync(resultsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.startsWith(`${suitePrefix}-`) && entry.name.endsWith('-report.json') && !entry.name.includes('-latest-'))
    .forEach((entry) => {
      candidates.push(path.join(resultsDir, entry.name));
    });

  if (!candidates.length) {
    throw new Error(`No report files found for suite prefix: ${suitePrefix}`);
  }

  const scored = candidates
    .map((reportPath) => {
      try {
        const report = readJson(reportPath);
        const engineCount = Array.isArray(report && report.engineSummary) ? report.engineSummary.length : 0;
        const mtimeMs = fs.statSync(reportPath).mtimeMs;
        return { reportPath, report, engineCount, mtimeMs };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (!scored.length) {
    throw new Error(`No readable report files found for suite prefix: ${suitePrefix}`);
  }

  scored.sort((a, b) => {
    if (b.engineCount !== a.engineCount) return b.engineCount - a.engineCount;
    return b.mtimeMs - a.mtimeMs;
  });

  return {
    path: scored[0].reportPath,
    report: scored[0].report,
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

function getEngineStatsMap(report) {
  const map = new Map();
  const summary = report && Array.isArray(report.engineSummary) ? report.engineSummary : [];
  summary.forEach((entry) => {
    if (!entry || !entry.engineId) return;
    map.set(entry.engineId, {
      status: entry.status,
      available: Boolean(entry.available),
      canInfer: Boolean(entry.canInfer),
      accuracy: Number(entry.accuracy || 0),
      passed: Number(entry.passed || 0),
      failed: Number(entry.failed || 0),
      reason: entry.reason || '',
    });
  });
  return map;
}

function buildCombinedCaseLeaderboard(textReport, codingReport) {
  const rows = [];
  const textRows = Array.isArray(textReport.caseLeaderboardRows)
    ? textReport.caseLeaderboardRows
    : [];
  const codingRows = Array.isArray(codingReport.caseLeaderboardRows)
    ? codingReport.caseLeaderboardRows
    : [];

  textRows.forEach((row) => {
    rows.push({
      suite: textReport.suiteId || 'text',
      caseId: row.caseId,
      rank: row.rank,
      engineId: row.engineId,
      engineLabel: row.engineLabel,
      passed: row.passed,
      primaryMs: row.elapsedMs,
      secondaryMetric: row.outputCharacters,
      secondaryMetricName: 'outputCharacters',
      error: row.error || '',
    });
  });

  codingRows.forEach((row) => {
    rows.push({
      suite: codingReport.suiteId || 'coding',
      caseId: row.caseId,
      rank: row.rank,
      engineId: row.engineId,
      engineLabel: row.engineLabel,
      passed: row.passed,
      primaryMs: Number(row.generationMs || 0) + Number(row.executionMs || 0),
      secondaryMetric: row.codeLength,
      secondaryMetricName: 'codeLength',
      error: row.error || '',
    });
  });

  return rows;
}

function selectEngines(textReport, codingReport) {
  const textMap = getEngineStatsMap(textReport);
  const codingMap = getEngineStatsMap(codingReport);

  const allIds = [...new Set([...KNOWN_ENGINE_IDS, ...textMap.keys(), ...codingMap.keys()])];
  const active = [];
  const removed = [];

  allIds.forEach((engineId) => {
    const text = textMap.get(engineId);
    const coding = codingMap.get(engineId);
    const passedText = Boolean(text && text.status === 'executed' && text.accuracy > 0);
    const passedCoding = Boolean(coding && coding.status === 'executed' && coding.accuracy > 0);
    const record = {
      engineId,
      textStatus: text ? text.status : 'missing',
      codingStatus: coding ? coding.status : 'missing',
      textAccuracy: text ? text.accuracy : 0,
      codingAccuracy: coding ? coding.accuracy : 0,
      textReason: text ? text.reason : 'No text benchmark entry.',
      codingReason: coding ? coding.reason : 'No coding benchmark entry.',
    };
    if (passedText && passedCoding) active.push(record);
    else removed.push(record);
  });

  active.sort((a, b) => {
    const scoreA = (a.textAccuracy + a.codingAccuracy) / 2;
    const scoreB = (b.textAccuracy + b.codingAccuracy) / 2;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return String(a.engineId).localeCompare(String(b.engineId));
  });

  return {
    active,
    removed,
  };
}

function runSelection() {
  const textSelection = pickBestReportPath(RESULTS_DIR, 'llm_unit_parseable_validation_v1');
  const codingSelection = pickBestReportPath(RESULTS_DIR, 'llm_js_coding_execution_v1');
  const textReport = textSelection.report;
  const codingReport = codingSelection.report;

  const selection = selectEngines(textReport, codingReport);
  const now = new Date().toISOString();
  const activeEngineIds = selection.active.map((entry) => entry.engineId);

  const manifest = {
    generatedAt: now,
    strategy: 'keep engines that execute and score accuracy > 0 in both text and coding suites',
    sourceReports: {
      text: textSelection.path,
      coding: codingSelection.path,
    },
    textSuiteId: textReport.suiteId,
    codingSuiteId: codingReport.suiteId,
    activeEngines: activeEngineIds,
    removedEngines: selection.removed,
  };

  const combinedCaseLeaderboard = buildCombinedCaseLeaderboard(textReport, codingReport);
  const leaderboardCsv = toCsv(combinedCaseLeaderboard, [
    'suite',
    'caseId',
    'rank',
    'engineId',
    'engineLabel',
    'passed',
    'primaryMs',
    'secondaryMetric',
    'secondaryMetricName',
    'error',
  ]);

  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const outJsonPath = path.join(RESULTS_DIR, 'active-engines.json');
  const outCsvPath = path.join(RESULTS_DIR, 'combined-case-leaderboard-latest.csv');
  fs.writeFileSync(outJsonPath, JSON.stringify(manifest, null, 2), 'utf8');
  fs.writeFileSync(outCsvPath, leaderboardCsv, 'utf8');

  return {
    manifest,
    outJsonPath,
    outCsvPath,
  };
}

if (require.main === module) {
  try {
    const result = runSelection();
    console.log('Active engine manifest generated.');
    console.log(`Active engines: ${result.manifest.activeEngines.join(', ') || 'none'}`);
    console.log(`Manifest: ${result.outJsonPath}`);
    console.log(`Combined case leaderboard CSV: ${result.outCsvPath}`);
  } catch (error) {
    console.error(error && error.message ? error.message : String(error));
    process.exit(1);
  }
}

module.exports = {
  runSelection,
};
