'use strict';

const fs = require('fs');
const path = require('path');
const { createNodeLlamaCppEngine } = require('./engines/node-llama-cpp/adapter');
const { createLlamaServerOpenAiEngine } = require('./engines/llama-server-openai/adapter');
const { createDuck4iLlamaEngine } = require('./engines/duck4i-llama/adapter');
const { createLlmJsEngine } = require('./engines/llmjs/adapter');
const { createWebLlmEngine } = require('./engines/webllm/adapter');
const { createLlama3PureEngine } = require('./engines/llama3pure/adapter');
const { createHyllamaEngine } = require('./engines/hyllama/adapter');

const DEFAULT_MODEL_PATH = path.join(
  process.cwd(),
  'public',
  'agentic-ide',
  'components',
  'models',
  'gemma',
  'gemma4-26b-a4b-q4kxl',
  'gemma-4-26B-A4B-it-UD-Q4_K_XL.gguf'
);

const DEFAULT_TEST_RESULTS_DIR = path.join(process.cwd(), 'public', 'agentic-ide', 'components', 'inference', 'tests', 'results');

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function getPassingEngineSet(report) {
  const summary = report && Array.isArray(report.engineSummary) ? report.engineSummary : [];
  return new Set(
    summary
      .filter((entry) => entry && entry.status === 'executed' && Number(entry.accuracy || 0) > 0)
      .map((entry) => entry.engineId)
      .filter(Boolean)
  );
}

function resolvePrunedEngineIds() {
  if (String(process.env.INFERENCE_PRUNE_FAILING_ENGINES || '1') === '0') return null;

  const resultsDir = process.env.INFERENCE_RESULTS_DIR || DEFAULT_TEST_RESULTS_DIR;
  const activeListPath = path.join(resultsDir, 'active-engines.json');
  const activeList = readJsonIfExists(activeListPath);
  const explicit = activeList && Array.isArray(activeList.activeEngines)
    ? activeList.activeEngines.filter(Boolean)
    : null;
  if (explicit && explicit.length) return new Set(explicit);

  const textReport = readJsonIfExists(path.join(resultsDir, 'llm_unit_parseable_validation_v1-latest-report.json'));
  const codingReport = readJsonIfExists(path.join(resultsDir, 'llm_js_coding_execution_v1-latest-report.json'));
  if (!textReport || !codingReport) return null;

  const textPassing = getPassingEngineSet(textReport);
  const codingPassing = getPassingEngineSet(codingReport);
  const intersection = [...textPassing].filter((engineId) => codingPassing.has(engineId));
  return intersection.length ? new Set(intersection) : null;
}

function normalizeContext(context = {}) {
  return {
    runtime: context.runtime || 'node',
    modelPath: context.modelPath || DEFAULT_MODEL_PATH,
    llmEndpoint: context.llmEndpoint || 'http://127.0.0.1:8080',
    openAiModel: context.openAiModel || 'gemma-4',
  };
}

function buildStaticCompatibilityScore(engineId, context) {
  const isNode = context.runtime === 'node';
  const isGguf = String(context.modelPath || '').toLowerCase().endsWith('.gguf');

  if (engineId === 'node-llama-cpp') {
    return isNode && isGguf ? 95 : 70;
  }
  if (engineId === 'llama-server-openai') {
    return isNode && isGguf ? 93 : 68;
  }
  if (engineId === 'duck4i-llama') {
    return isNode && isGguf ? 78 : 55;
  }
  if (engineId === 'llmjs') {
    return isNode ? 45 : 82;
  }
  if (engineId === 'webllm') {
    return isNode ? 35 : 76;
  }
  if (engineId === 'llama3pure') {
    return isNode ? 62 : 30;
  }
  if (engineId === 'hyllama') {
    return 25;
  }
  return 0;
}

function createInferenceManager() {
  const allEngines = [
    createNodeLlamaCppEngine(),
    createLlamaServerOpenAiEngine(),
    createDuck4iLlamaEngine(),
    createLlmJsEngine(),
    createWebLlmEngine(),
    createLlama3PureEngine(),
    createHyllamaEngine(),
  ];
  const allowedIds = resolvePrunedEngineIds();
  const engines = allowedIds
    ? allEngines.filter((engine) => allowedIds.has(engine.getDescriptor().id))
    : allEngines;

  async function evaluateEngines(rawContext = {}) {
    const context = normalizeContext(rawContext);
    const checks = [];

    for (const engine of engines) {
      const descriptor = engine.getDescriptor();
      let probeResult;
      try {
        probeResult = await engine.probe(context);
      } catch (error) {
        probeResult = {
          available: false,
          canInfer: Boolean(descriptor.canInfer),
          reason: error && error.message ? error.message : String(error),
          details: null,
        };
      }

      checks.push({
        engineId: descriptor.id,
        descriptor,
        compatibilityScore: buildStaticCompatibilityScore(descriptor.id, context),
        probe: probeResult,
      });
    }

    return checks.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  async function chooseBestEngine(rawContext = {}) {
    const context = normalizeContext(rawContext);
    const checks = await evaluateEngines(context);
    const availableLive = checks
      .filter((entry) => entry.probe && entry.probe.available && entry.probe.canInfer)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    const best = availableLive[0] || checks[0] || null;

    return {
      context,
      best,
      checks,
      recommendation: best
        ? {
            engineId: best.engineId,
            reason: best.probe && best.probe.available
              ? 'Best compatibility among currently available live engines.'
              : 'Best compatibility for local GGUF inference; make runtime dependency available to activate.',
          }
        : null,
    };
  }

  async function complete(payload, options = {}) {
    const engineId = options.engineId || 'node-llama-cpp';
    const context = normalizeContext(options.context || {});
    const selected = engines.find((engine) => engine.getDescriptor().id === engineId);

    if (!selected) {
      throw new Error(`Unknown inference engine: ${engineId}`);
    }

    return selected.complete(payload, context);
  }

  return {
    normalizeContext,
    evaluateEngines,
    chooseBestEngine,
    complete,
    listEngines: () => engines.map((engine) => engine.getDescriptor()),
    DEFAULT_MODEL_PATH,
  };
}

module.exports = {
  createInferenceManager,
  DEFAULT_MODEL_PATH,
};
