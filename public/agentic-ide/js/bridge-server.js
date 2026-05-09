#!/usr/bin/env node
/**
 * Agentic IDE Bridge Server
 *
 * Dedicated file-I/O and LLM inference proxy for public/agentic-ide/
 * - Reads / writes component files restricted to this folder (no path traversal)
 * - Proxies inference requests to a local llama.cpp HTTP server
 *
 * Start:  node public/agentic-ide/server/main.js
 * Port:   3131  (override: BRIDGE_PORT=3131)
 * LLM:    http://localhost:8080  (override: LLM_HOST / LLM_PORT)
 *
 * To run llama.cpp with the bundled Gemma model:
 *   ./llama-server -m public/agentic-ide/components/models/gemma/gemma4-26b-a4b-q4kxl/gemma-4-26B-A4B-it-UD-Q4_K_XL.gguf --port 8080
 */
'use strict';

const http = require('http');
const crypto = require('crypto');
const fs   = require('fs');
const path = require('path');
const url  = require('url');
const { discoverWorkspace, runComponent, runComponentTests } = require('./bridge-workspace');
const { createInferenceManager } = require('../components/inference/main');
const { normalizeInferenceRequest } = require('../components/inference/request-schema');

const ENGINE_ID_ALIASES = {
  llamacpp: ['llama-server-openai', 'node-llama-cpp'],
  'llama-cpp': ['llama-server-openai', 'node-llama-cpp'],
  'llama_cpp': ['llama-server-openai', 'node-llama-cpp'],
  'llama.cpp': ['llama-server-openai', 'node-llama-cpp'],
  openai: ['llama-server-openai'],
  local: ['llama-server-openai', 'node-llama-cpp'],
};

/** HTTP port for the local Agentic IDE bridge server. */
const PORT     = parseInt(process.env.BRIDGE_PORT || '3131', 10);
/** Absolute root folder for bridge file access. */
const ROOT     = path.resolve(__dirname, '..');            // public/agentic-ide/
const INFERENCE_RESULTS_DIR = path.resolve(ROOT, 'components', 'inference', 'tests', 'results');
/** Hostname for the local llama.cpp inference endpoint. */
const LLM_HOST = process.env.LLM_HOST || '127.0.0.1';
/** Port for the local llama.cpp inference endpoint. */
const LLM_PORT = parseInt(process.env.LLM_PORT  || '8080', 10);
/** Preferred isolated inference engine id. */
const INFERENCE_ENGINE = process.env.INFERENCE_ENGINE || 'node-llama-cpp';
/** Shared inference manager instance used by bridge runtime APIs. */
const inferenceManager = createInferenceManager();

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function getActiveInferenceManifest() {
  return readJsonIfExists(path.join(INFERENCE_RESULTS_DIR, 'active-engines.json'));
}

function getAvailableEngineDescriptors() {
  try {
    return inferenceManager.listEngines() || [];
  } catch {
    return [];
  }
}

function resolveRequestedEngineId(requested, availableIds) {
  const raw = String(requested || '').trim();
  if (!raw) return '';
  if (availableIds.has(raw)) return raw;
  const aliasCandidates = ENGINE_ID_ALIASES[raw.toLowerCase()] || [];
  return aliasCandidates.find((id) => availableIds.has(id)) || '';
}

async function resolveInferenceEngine(payload = {}, context = {}) {
  const available = getAvailableEngineDescriptors();
  const availableIds = new Set(available.map((entry) => entry.id).filter(Boolean));
  const requestedRaw = payload.engineId || payload.backend || payload.inference_engine;
  const requestedEngineId = resolveRequestedEngineId(requestedRaw, availableIds);
  const disableFallback = Boolean(
    payload.disable_engine_fallback ||
    payload.strict_engine_selection ||
    String(process.env.INFERENCE_STRICT_ENGINE_SELECTION || '0') === '1'
  );

  let checks = [];
  try {
    checks = await inferenceManager.evaluateEngines(context);
  } catch {
    checks = [];
  }

  if (requestedEngineId) {
    const requestedCheck = checks.find((entry) => entry.engineId === requestedEngineId);
    if (requestedCheck?.probe?.available && requestedCheck?.probe?.canInfer) {
      return {
        engineId: requestedEngineId,
        requestedEngineId,
        fallbackApplied: false,
        fallbackReason: null,
        strictSelection: disableFallback,
      };
    }
    if (disableFallback) {
      const reason = requestedCheck?.probe?.reason
        ? `Requested engine '${requestedEngineId}' is unavailable: ${requestedCheck.probe.reason}`
        : `Requested engine '${requestedEngineId}' is unavailable in current runtime.`;
      throw new Error(reason);
    }
  }

  const availableLive = checks
    .filter((entry) => entry && entry.probe && entry.probe.available && entry.probe.canInfer)
    .sort((a, b) => Number(b.compatibilityScore || 0) - Number(a.compatibilityScore || 0));
  if (availableLive.length) {
    return {
      engineId: availableLive[0].engineId,
      requestedEngineId,
      fallbackApplied: Boolean(requestedEngineId && requestedEngineId !== availableLive[0].engineId),
      fallbackReason: requestedEngineId
        ? `Requested engine '${requestedEngineId}' is unavailable in current runtime; using '${availableLive[0].engineId}'.`
        : null,
      strictSelection: disableFallback,
    };
  }

  const manifest = getActiveInferenceManifest();
  const active = manifest && Array.isArray(manifest.activeEngines)
    ? manifest.activeEngines.filter((id) => availableIds.has(id))
    : [];
  if (active.length) {
    return {
      engineId: active[0],
      requestedEngineId,
      fallbackApplied: Boolean(requestedEngineId && requestedEngineId !== active[0]),
      fallbackReason: requestedEngineId
        ? `Requested engine '${requestedEngineId}' is unavailable in current runtime; using manifest active engine '${active[0]}'.`
        : null,
      strictSelection: disableFallback,
    };
  }

  const fallback = availableIds.has(INFERENCE_ENGINE)
    ? INFERENCE_ENGINE
    : (available[0]?.id || INFERENCE_ENGINE);
  return {
    engineId: fallback,
    requestedEngineId,
    fallbackApplied: Boolean(requestedEngineId && requestedEngineId !== fallback),
    fallbackReason: requestedEngineId
      ? `Requested engine '${requestedEngineId}' is unavailable in current runtime; using '${fallback}'.`
      : null,
    strictSelection: disableFallback,
  };
}

/** File extension MIME type mapping for allowed static file responses. */
const MIME = {
  '.html':'text/html', '.css':'text/css', '.js':'application/javascript',
  '.json':'application/json', '.md':'text/markdown',
  '.yaml':'text/yaml', '.yml':'text/yaml',
  '.txt':'text/plain', '.py':'text/plain',
};

// ── Security: keep all paths inside ROOT ──────────────────────────────────
/** Resolve a relative path under ROOT and block path traversal. */
function safePath(relPath) {
  const clean = path.normalize(relPath).replace(/^[/\\]+/, '');
  const abs   = path.resolve(ROOT, clean);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null;
  return abs;
}

// ── Helpers ───────────────────────────────────────────────────────────────
/** Enable permissive CORS headers for bridge responses. */
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/** Send a JSON response with the given HTTP status code. */
function json(res, code, obj) {
  cors(res);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

/** Read the full request body as text with an optional size limit. */
function readBody(req, limit = 5_000_000) {
  return new Promise((resolve, reject) => {
    let buf = '';
    req.on('data', d => { buf += d; if (buf.length > limit) reject(new Error('body too large')); });
    req.on('end',  () => resolve(buf));
    req.on('error', reject);
  });
}

/** Forward a completion request to the local LLM endpoint and return parsed JSON. */
function requestLlmCompletion(payload) {
  const normalized = normalizeInferenceRequest(payload || {});
  const strictEngineSelection = Boolean(
    payload && (payload.disable_engine_fallback || payload.strict_engine_selection)
  );
  const context = {
    runtime: 'node',
    llmEndpoint: `http://${LLM_HOST}:${LLM_PORT}`,
  };
  return resolveInferenceEngine({ ...normalized, strict_engine_selection: strictEngineSelection }, context).then((resolved) =>
    inferenceManager.complete(
      {
        prompt: normalized.prompt,
        messages: normalized.messages,
        max_tokens: normalized.max_tokens,
        temperature: normalized.temperature,
        top_p: normalized.top_p,
        top_k: normalized.top_k,
        repeat_penalty: normalized.repeat_penalty,
        response_format: normalized.response_format,
        stop: normalized.stop,
        stream: false,
      },
      {
        engineId: resolved.engineId,
        context,
      }
    ).then((result) => ({
      ...result,
      _inference: {
        engineId: resolved.engineId,
        requestedEngineId: resolved.requestedEngineId || null,
        fallbackApplied: !!resolved.fallbackApplied,
        fallbackReason: resolved.fallbackReason || null,
        strictSelection: !!resolved.strictSelection,
        request: {
          max_tokens: normalized.max_tokens,
          temperature: normalized.temperature,
          top_p: normalized.top_p,
          top_k: normalized.top_k,
          repeat_penalty: normalized.repeat_penalty,
          response_format: normalized.response_format,
        },
      },
    }))
  );
}

/** Discover the Agentic IDE workspace registry from the local root. */
async function getWorkspaceRegistry() {
  return discoverWorkspace(ROOT);
}

const registryCache = {
  expiresAt: 0,
  registryBody: null,
  registryPayload: null,
  registryEtag: null,
  modelBody: null,
  modelPayload: null,
  modelEtag: null,
};

/** Generate an ETag string for a response body. */
function makeEtag(body) {
  return `"${crypto.createHash('sha1').update(body).digest('hex')}"`;
}

/** Return full asset path and existence info for a model definition. */
function getModelAssetInfo(model) {
  const modelName = model?.meta?.model_name;
  if (!model || !model.path || !modelName) {
    return { asset_path: null, asset_exists: false };
  }
  const assetPath = path.join(ROOT, model.path, modelName);
  return {
    asset_path: assetPath,
    asset_exists: fs.existsSync(assetPath),
  };
}

function buildInferencePayload() {
  const manifest = getActiveInferenceManifest();
  const available = getAvailableEngineDescriptors();
  const availableIds = new Set(available.map((entry) => entry.id));
  const manifestActive = manifest && Array.isArray(manifest.activeEngines)
    ? manifest.activeEngines.filter((id) => availableIds.has(id))
    : [];
  const activeEngineId = manifestActive[0] || (availableIds.has(INFERENCE_ENGINE) ? INFERENCE_ENGINE : (available[0]?.id || ''));
  return {
    activeEngine: activeEngineId,
    activeEngines: manifestActive,
    strategy: manifest?.strategy || 'inference manager default selection',
    generatedAt: manifest?.generatedAt || null,
    engineOptions: available.map((entry) => ({
      id: entry.id,
      label: entry.label || entry.id,
      environment: entry.environment || 'node',
      canInfer: !!entry.canInfer,
      benchmarkActive: manifestActive.includes(entry.id),
    })),
  };
}

/** Load the latest workspace registry and model status, with caching. */
async function getRegistrySnapshot(force = false) {
  if (!force && registryCache.registryBody && Date.now() < registryCache.expiresAt) {
    return registryCache;
  }
  const registryPayload = await getWorkspaceRegistry();
  const registryBody = JSON.stringify(registryPayload);
  const registryEtag = makeEtag(registryBody);
  const models = (registryPayload.models || []).map(model => ({
    ...model,
    ...getModelAssetInfo(model),
  }));
  const primaryModel = models[0] || null;
  const modelPayload = {
    path: primaryModel?.asset_path || null,
    exists: primaryModel?.asset_exists || false,
    ggufExists: primaryModel?.asset_exists || false,
    llm_endpoint: `http://${LLM_HOST}:${LLM_PORT}`,
    models,
    inference: buildInferencePayload(),
  };
  const modelBody = JSON.stringify(modelPayload);
  const modelEtag = makeEtag(modelBody);
  Object.assign(registryCache, {
    expiresAt: Date.now() + 2000,
    registryBody,
    registryPayload,
    registryEtag,
    modelBody,
    modelPayload,
    modelEtag,
  });
  return registryCache;
}

/** Reply with cached JSON and ETag support for HEAD / conditional requests. */
function replyCachedJson(req, res, body, etag) {
  cors(res);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('ETag', etag);
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304);
    res.end();
    return;
  }
  if (req.method === 'HEAD') {
    res.writeHead(200);
    res.end();
    return;
  }
  res.writeHead(200);
  res.end(body);
}

// ── Request handler ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // ── GET /api/file?path=<rel>  ──────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/file') {
    const rel = parsed.query.path;
    if (!rel) { json(res, 400, { error: 'path required' }); return; }
    const abs = safePath(rel);
    if (!abs) { json(res, 403, { error: 'Path not allowed' }); return; }
    try {
      const content = fs.readFileSync(abs, 'utf8');
      const ext = path.extname(abs).toLowerCase();
      cors(res);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
      res.end(content);
    } catch { json(res, 404, { error: 'File not found', path: rel }); }
    return;
  }

  // ── PUT /api/file?path=<rel>  ──────────────────────────────────────────
  if (req.method === 'PUT' && pathname === '/api/file') {
    const rel = parsed.query.path;
    if (!rel) { json(res, 400, { error: 'path required' }); return; }
    const abs = safePath(rel);
    if (!abs) { json(res, 403, { error: 'Path not allowed' }); return; }
    try {
      const body = await readBody(req);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, body, 'utf8');
      json(res, 200, { ok: true, path: rel });
    } catch (err) { json(res, 500, { error: err.message }); }
    return;
  }

  // ── GET /api/list?path=<rel>  ──────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/list') {
    const rel = parsed.query.path || '';
    const abs = safePath(rel);
    if (!abs) { json(res, 403, { error: 'Path not allowed' }); return; }
    try {
      const entries = fs.readdirSync(abs, { withFileTypes: true });
      json(res, 200, entries.map(e => ({ name: e.name, isDir: e.isDirectory() })));
    } catch { json(res, 404, { error: 'Directory not found' }); }
    return;
  }

  // ── GET /api/model  ───────────────────────────────────────────────────
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/api/model') {
    try {
      const snapshot = await getRegistrySnapshot();
      replyCachedJson(req, res, snapshot.modelBody, snapshot.modelEtag);
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return;
  }

  // ── GET /api/registry  ────────────────────────────────────────────────
  if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/api/registry') {
    try {
      const snapshot = await getRegistrySnapshot();
      replyCachedJson(req, res, snapshot.registryBody, snapshot.registryEtag);
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return;
  }

  // ── POST /api/runtime/run  ────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/runtime/run') {
    try {
      const body = await readBody(req, 250_000);
      const payload = JSON.parse(body || '{}');
      if (!payload.nodeId) {
        json(res, 400, { error: 'nodeId required' });
        return;
      }
      const result = await runComponent(ROOT, payload.nodeId, payload.input || {}, {
        modelId: payload.modelId,
        max_tokens: payload.max_tokens,
        temperature: payload.temperature,
        callLlm: requestLlmCompletion,
      });
      json(res, 200, result);
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return;
  }

  // ── POST /api/runtime/test  ───────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/runtime/test') {
    try {
      const body = await readBody(req, 250_000);
      const payload = JSON.parse(body || '{}');
      if (!payload.nodeId) {
        json(res, 400, { error: 'nodeId required' });
        return;
      }
      const result = await runComponentTests(ROOT, payload.nodeId, {
        modelId: payload.modelId,
        callLlm: requestLlmCompletion,
      });
      json(res, 200, result);
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return;
  }

  // ── POST /api/llm/complete  ────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/llm/complete') {
    try {
      const body    = await readBody(req, 100_000);
      const payload = JSON.parse(body);
      const llmBody = await requestLlmCompletion(payload);
      cors(res);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(llmBody));
    } catch (err) { json(res, 400, { error: err.message }); }
    return;
  }

  // ── Static file fallback ───────────────────────────────────────────────
  const filePath = pathname === '/' ? '/index.html' : pathname;
  const abs = safePath(filePath);
  if (!abs) { json(res, 403, { error: 'Path not allowed' }); return; }
  try {
    const content = fs.readFileSync(abs);
    const ext = path.extname(abs).toLowerCase();
    cors(res);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch { json(res, 404, { error: 'Not found', path: filePath }); }
});

server.listen(PORT, () => {
  console.log(`\n[agentic-ide bridge] http://localhost:${PORT}`);
  console.log(`[agentic-ide bridge] ROOT  : ${ROOT}`);
  console.log(`[agentic-ide bridge] LLM   : http://${LLM_HOST}:${LLM_PORT}  (llama.cpp)`);
  discoverWorkspace(ROOT)
    .then(registry => {
      const primaryModel = (registry.models || [])[0] || null;
      const asset = getModelAssetInfo(primaryModel);
      console.log(`[agentic-ide bridge] Models discovered: ${(registry.models || []).length}`);
      if (asset.asset_path) {
        console.log(`[agentic-ide bridge] Primary model asset: ${asset.asset_path}`);
        console.log(`[agentic-ide bridge] Primary model exists: ${asset.asset_exists}`);
        console.log(`\n  To start the LLM server:`);
        console.log(`  ./llama-server -m "${asset.asset_path}" --port ${LLM_PORT} --ctx-size 4096\n`);
      }
    })
    .catch(err => {
      console.log(`[agentic-ide bridge] Workspace discovery failed: ${err.message}`);
    });
});
