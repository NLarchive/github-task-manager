'use strict';

const fs = require('fs');
const path = require('path');
const { runSuite: runTextSuite } = require('./text/run-validation-suite');
const { runSuite: runCodingSuite } = require('./coding/run-coding-suite');
const { runSelection } = require('./select-best');

async function runInferenceBenchmark(options = {}) {
  const suitePathText = options.suitePathText;
  const suitePathCoding = options.suitePathCoding;
  const resultsDir = options.resultsDir || path.join(__dirname, 'results');

  const previousPruneFlag = process.env.INFERENCE_PRUNE_FAILING_ENGINES;
  process.env.INFERENCE_PRUNE_FAILING_ENGINES = '0';

  let textRun;
  let codingRun;
  let selection;

  try {
    textRun = await runTextSuite({
      suitePath: suitePathText,
      resultsDir,
      llmEndpoint: options.llmEndpoint,
    });

    codingRun = await runCodingSuite({
      suitePath: suitePathCoding,
      resultsDir,
      llmEndpoint: options.llmEndpoint,
    });

    selection = runSelection();
  } finally {
    if (typeof previousPruneFlag === 'undefined') delete process.env.INFERENCE_PRUNE_FAILING_ENGINES;
    else process.env.INFERENCE_PRUNE_FAILING_ENGINES = previousPruneFlag;
  }

  return {
    timestamp: new Date().toISOString(),
    text: {
      winner: textRun.report.winner,
      summary: textRun.report.engineSummary,
      paths: textRun.paths,
    },
    coding: {
      winner: codingRun.report.winner,
      summary: codingRun.report.engineSummary,
      paths: codingRun.paths,
    },
    activeEngines: selection.manifest.activeEngines,
    removedEngines: selection.manifest.removedEngines,
    selectionPaths: {
      manifest: selection.outJsonPath,
      caseLeaderboardCsv: selection.outCsvPath,
    },
  };
}

function writeBenchmarkReport(report, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
}

module.exports = {
  runInferenceBenchmark,
  writeBenchmarkReport,
};
