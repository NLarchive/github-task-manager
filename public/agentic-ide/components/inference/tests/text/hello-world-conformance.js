#!/usr/bin/env node
'use strict';

/**
 * Hello-world inference conformance test
 *
 * Tests each available inference engine endpoint with a minimal echo task.
 *   Prompt  : "Reply with only this exact text and nothing else: hello world"
 *   Pass    : response contains "hello world" (case-insensitive)
 *   Metric  : character count — lower is better (less verbosity)
 *
 * Engines tested:
 *   1. node-llama-cpp  → POST /completion        (llama.cpp native)
 *   2. llama-server-openai → POST /v1/chat/completions  (OpenAI compat)
 *   3. bridge          → POST /api/llm/complete   (full bridge path)
 *
 * Usage:
 *   node tools/ai/inference/tests/hello-world-conformance.js
 *
 * Environment:
 *   LLAMA_ENDPOINT   default http://127.0.0.1:8080
 *   BRIDGE_ENDPOINT  default http://127.0.0.1:3131
 *   LLM_TIMEOUT_MS   default 60000
 */

const fs = require('fs');
const path = require('path');

const LLAMA_ENDPOINT  = (process.env.LLAMA_ENDPOINT  || 'http://127.0.0.1:8080').replace(/\/$/, '');
const BRIDGE_ENDPOINT = (process.env.BRIDGE_ENDPOINT || 'http://127.0.0.1:3131').replace(/\/$/, '');
const TIMEOUT_MS      = Number(process.env.LLM_TIMEOUT_MS || 60_000);

// Tightly constrained prompt — temperature 0 for determinism
const TEST_PROMPT = 'Reply with only this exact text and nothing else: hello world';
const MAX_TOKENS  = 48;

// ── helpers ──────────────────────────────────────────────────────────────────

function sanitize(text) {
  return String(text || '')
    .replace(/<think>[\s\S]*?<\/think>\s*/gi, '')
    .replace(/<\|channel\>thought\s*/gi, '')
    .replace(/<channel\|>\s*/gi, '')
    .trim();
}

async function fetchWithTimeout(url, opts) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function postJson(url, body) {
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw.slice(0, 200)}`);
  return JSON.parse(raw);
}

function pass(text) {
  return /hello[\s_-]*world/i.test(text);
}

function metrics(text) {
  const trimmed = String(text).trim();
  return {
    chars:  trimmed.length,
    words:  trimmed.split(/\s+/).filter(Boolean).length,
    exact:  trimmed.toLowerCase() === 'hello world',
  };
}

// ── engine definitions ────────────────────────────────────────────────────────

const ENGINES = [
  {
    id: 'node-llama-cpp',
    label: `llama.cpp /completion  (${LLAMA_ENDPOINT})`,

    async call() {
      const data = await postJson(`${LLAMA_ENDPOINT}/completion`, {
        prompt:                TEST_PROMPT,
        max_tokens:            MAX_TOKENS,
        temperature:           0,
        reasoning_format:      'none',
        reasoning_in_content:  false,
        stream:                false,
      });
      return {
        text:  sanitize(data.content || data.text || ''),
        usage: data.usage || null,
      };
    },
  },

  {
    id: 'llama-server-openai',
    label: `llama.cpp /v1/chat/completions  (${LLAMA_ENDPOINT})`,

    async call() {
      const data = await postJson(`${LLAMA_ENDPOINT}/v1/chat/completions`, {
        model:                 'gemma-4',
        messages:              [{ role: 'user', content: TEST_PROMPT }],
        max_tokens:            MAX_TOKENS,
        temperature:           0,
        reasoning_format:      'none',
        reasoning_in_content:  false,
        stream:                false,
      });
      const msg  = data?.choices?.[0]?.message;
      const text = msg?.content || msg?.reasoning_content || '';
      return {
        text:  sanitize(text),
        usage: data?.usage || null,
      };
    },
  },

  {
    id: 'bridge',
    label: `bridge-server /api/llm/complete  (${BRIDGE_ENDPOINT})`,

    async call() {
      const data = await postJson(`${BRIDGE_ENDPOINT}/api/llm/complete`, {
        prompt:      TEST_PROMPT,
        max_tokens:  MAX_TOKENS,
        temperature: 0,
      });
      return {
        text:  sanitize(data.content || data.text || ''),
        usage: null,
      };
    },
  },
];

// ── runner ────────────────────────────────────────────────────────────────────

async function runEngine(engine) {
  const start = Date.now();
  try {
    const { text, usage } = await engine.call();
    const latencyMs = Date.now() - start;
    const ok        = pass(text);
    return {
      id:        engine.id,
      label:     engine.label,
      ok,
      latencyMs,
      text,
      metrics:   metrics(text),
      usage:     usage || null,
      error:     null,
    };
  } catch (err) {
    return {
      id:        engine.id,
      label:     engine.label,
      ok:        false,
      latencyMs: Date.now() - start,
      text:      null,
      metrics:   null,
      usage:     null,
      error:     err && err.message ? err.message : String(err),
    };
  }
}

function statusLine(result) {
  if (result.error) {
    const isOffline = /ECONNREFUSED|ENOTFOUND|aborted|ECONNRESET/i.test(result.error);
    return `SKIP  ${isOffline ? '(service offline)' : result.error.slice(0, 70)}`;
  }
  const g = result.metrics;
  const tag = result.ok ? 'PASS' : 'FAIL';
  const exact = g.exact ? '  [exact]' : '';
  const preview = String(result.text).slice(0, 72).replace(/\n/g, '\\n');
  return `${tag}  ${result.latencyMs}ms  ${g.chars} chars  ${g.words} words${exact}  "${preview}"`;
}

async function main() {
  console.log('='.repeat(60));
  console.log('  Hello-World Inference Conformance Test');
  console.log('='.repeat(60));
  console.log(`  Prompt  : "${TEST_PROMPT}"`);
  console.log(`  Engines : ${ENGINES.length}`);
  console.log('');

  const results = [];
  for (const engine of ENGINES) {
    process.stdout.write(`  [${engine.id.padEnd(22)}] `);
    const result = await runEngine(engine);
    results.push(result);
    console.log(statusLine(result));
  }

  const live   = results.filter((r) => !r.error);
  const passed = live.filter((r) => r.ok);
  const failed = live.filter((r) => !r.ok);

  console.log('');
  console.log('-'.repeat(60));
  console.log(`  Engines tested : ${results.length}`);
  console.log(`  Available      : ${live.length}`);
  console.log(`  Passed         : ${passed.length}`);
  console.log(`  Failed         : ${failed.length}`);

  if (passed.length) {
    const best = [...passed].sort((a, b) => a.metrics.chars - b.metrics.chars)[0];
    console.log(`  Best (fewest chars): ${best.id}  (${best.metrics.chars} chars, ${best.latencyMs}ms)`);
  }

  // Verbosity ranking (passed engines only)
  if (passed.length > 1) {
    console.log('');
    console.log('  Verbosity ranking (chars, less = better):');
    [...passed]
      .sort((a, b) => a.metrics.chars - b.metrics.chars)
      .forEach((r, i) => {
        const star = i === 0 ? ' ★' : '';
        console.log(`    ${i + 1}. ${r.id.padEnd(22)} ${r.metrics.chars} chars${star}`);
      });
  }

  // Write report
  const reportPath = path.join(process.cwd(), 'outputs', 'local-runs', 'hello-world-conformance.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    prompt:    TEST_PROMPT,
    timestamp: new Date().toISOString(),
    results,
  }, null, 2));
  console.log('');
  console.log(`  Report: outputs/local-runs/hello-world-conformance.json`);
  console.log('='.repeat(60));

  if (failed.length > 0 && live.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exitCode = 1;
});
