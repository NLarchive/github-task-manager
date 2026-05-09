#!/usr/bin/env node
/**
 * Inference Quality Test Suite
 * 
 * Tests the end-to-end inference pipeline from bridge client → bridge server → llama.cpp
 * Includes:
 * - Mathematical correctness tests
 * - Response quality analysis
 * - Encoding/corruption detection
 * - Full request/response logging for debugging
 */

const fetchImpl = globalThis.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));

const BRIDGE_BASE = 'http://localhost:3131';
const LLM_TIMEOUT = 30_000; // 30 seconds

/**
 * Simple math answer extractor
 * Tries to find numerical answer in the response
 */
function extractMathAnswer(response) {
  if (!response || typeof response !== 'string') return null;
  
  // Look for patterns like "2+2 = 4" or "The answer is 4" or just "4"
  const patterns = [
    /equals?\s+(\d+)/i,
    /answer\s+(?:is|:)?\s+(\d+)/i,
    /result\s+(?:is|:)?\s+(\d+)/i,
    /=\s*(\d+)/,
    /(\d+)\s*is\s+(?:the\s+)?(?:correct\s+)?answer/i,
    /^\s*(\d+)\s*$/m,  // just the number on its own
  ];
  
  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

/**
 * Analyze response for quality issues (corruption, encoding, etc.)
 */
function analyzeResponseQuality(response, options = {}) {
  const { allowConciseNumeric = false } = options;
  if (!response) {
    return { ok: false, issues: ['Empty response'], score: 0 };
  }

  const issues = [];
  let score = 100;

  // Check length
  const trimmed = response.trim();
  const isConciseNumeric = /^[-+]?\d+(?:\.\d+)?$/.test(trimmed);
  if (response.length < 10 && !(allowConciseNumeric && isConciseNumeric)) {
    issues.push(`Response too short: ${response.length} chars`);
    score -= 30;
  }

  // Check for CJK repetition corruption (로직로직로직...)
  const cjkRepeatPattern = /[\u4E00-\u9FFF\uAC00-\uD7AF]{2,}/g;
  const cjkMatches = response.match(cjkRepeatPattern) || [];
  for (const match of cjkMatches) {
    if (/(.)\1{2,}/.test(match)) {
      issues.push(`CJK character repetition detected: "${match}"`);
      score -= 40;
    }
  }

  // Check for excessive question marks or special chars (gibberish)
  const gibberishChars = (response.match(/[\?!]*$/g) || []).join('').length;
  if (gibberishChars > 5) {
    issues.push(`Suspicious trailing characters: ${gibberishChars} chars`);
    score -= 20;
  }

  // Check for mojibake (mixed encoding artifacts)
  const suspiciousPatterns = /[^\x20-\x7E\n\t\u4E00-\u9FFF\uAC00-\uD7AF]+/g;
  const suspiciousMatches = response.match(suspiciousPatterns) || [];
  if (suspiciousMatches.length > 0) {
    issues.push(`Potential mojibake detected: ${suspiciousMatches.length} anomalous sequences`);
    score -= 15;
  }

  // Check for word repetition
  const words = response.split(/\s+/).filter(w => w.length > 2);
  const wordFreq = new Map();
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }
  const maxFreq = Math.max(...wordFreq.values(), 0);
  if (maxFreq > 5) {
    const repeatWord = [...wordFreq.entries()].find(e => e[1] === maxFreq)?.[0];
    issues.push(`Excessive word repetition: "${repeatWord}" appears ${maxFreq} times`);
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    ok: issues.length === 0,
    issues,
    score,
    length: response.length,
    wordCount: words.length,
    cjkCharCount: cjkMatches.length
  };
}

/**
 * Run a single inference test with detailed logging
 */
async function runInferenceTest(testName, prompt, expectedAnswer, options = {}) {
  const { maxTokens = 256 } = options;
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`📝 Test: ${testName}`);
  console.log(`${'─'.repeat(70)}`);
  
  const startTime = Date.now();
  let response = null;
  let rawResponse = null;
  let error = null;

  try {
    console.log(`📤 Sending prompt: "${prompt}"`);
    console.log(`⏱️  Max timeout: ${LLM_TIMEOUT}ms`);

    // Send request to bridge server
    const fetchRes = await Promise.race([
      fetchImpl(`${BRIDGE_BASE}/api/llm/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          max_tokens: maxTokens,
          temperature: 0.1,  // Low temperature for consistency
        }),
        timeout: LLM_TIMEOUT,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Fetch timeout')), LLM_TIMEOUT)
      ),
    ]);

    if (!fetchRes.ok) {
      error = `HTTP ${fetchRes.status}: ${await fetchRes.text()}`;
      console.error(`❌ HTTP Error: ${error}`);
      return {
        testName,
        passed: false,
        error,
        duration: Date.now() - startTime,
      };
    }

    rawResponse = await fetchRes.json();
    response = rawResponse.content ?? rawResponse.text ?? rawResponse.generated_text ?? '';
    
    console.log(`📥 Raw response received (${response.length} chars, ${(Date.now() - startTime)}ms)`);
    console.log(`📄 Response:\n${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`);
  } catch (e) {
    error = e.message;
    console.error(`❌ Request failed: ${error}`);
    return {
      testName,
      passed: false,
      error,
      duration: Date.now() - startTime,
    };
  }

  // Analyze response quality
  const quality = analyzeResponseQuality(response, {
    allowConciseNumeric: expectedAnswer !== null,
  });
  console.log(`\n🔍 Quality Analysis:`);
  console.log(`   Quality Score: ${quality.score}/100 ${quality.ok ? '✅' : '⚠️'}`);
  console.log(`   Length: ${quality.length} chars`);
  console.log(`   Words: ${quality.wordCount}`);
  if (quality.issues.length > 0) {
    console.log(`   Issues:`);
    quality.issues.forEach(issue => console.log(`      • ${issue}`));
  }

  // Check mathematical correctness if expected answer provided
  let mathematicallyCorrect = true;
  let extractedAnswer = null;

  if (expectedAnswer !== null) {
    extractedAnswer = extractMathAnswer(response);
    mathematicallyCorrect = extractedAnswer === expectedAnswer;
    console.log(`\n✏️  Math Check:`);
    console.log(`   Expected: ${expectedAnswer}`);
    console.log(`   Extracted: ${extractedAnswer}`);
    console.log(`   Result: ${mathematicallyCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
  }

  const passed = quality.ok && mathematicallyCorrect;
  const duration = Date.now() - startTime;

  console.log(`\n${passed ? '✅ PASS' : '❌ FAIL'} (${duration}ms)`);

  return {
    testName,
    passed,
    quality,
    mathematicallyCorrect,
    extractedAnswer,
    expectedAnswer,
    response,
    rawResponse,
    duration,
    error: null,
  };
}

/**
 * Run full test suite
 */
async function runAllTests() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║          Agentic IDE Inference Quality Test Suite                  ║
║                   Bridge Server + LLaMA Inference                   ║
╚════════════════════════════════════════════════════════════════════╝
`);

  console.log(`🌐 Bridge Server: ${BRIDGE_BASE}`);
  console.log(`⏱️  Test timestamp: ${new Date().toISOString()}`);
  console.log(`\nRunning ${Object.keys(tests).length} inference tests...\n`);

  const results = [];

  // Run each test
  for (const [key, { prompt, expected, description, maxTokens }] of Object.entries(tests)) {
    const result = await runInferenceTest(description, prompt, expected, { maxTokens });
    results.push(result);
    
    // Small delay between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary report
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`📊 TEST SUMMARY`);
  console.log(`${'═'.repeat(70)}`);

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const avgQualityScore = Math.round(
    results.reduce((sum, r) => sum + (r.quality?.score || 0), 0) / total
  );
  const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / total);

  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Avg Quality Score: ${avgQualityScore}/100`);
  console.log(`⏱️  Avg Response Time: ${avgDuration}ms\n`);

  // Detailed results table
  console.log(`${'Name'.padEnd(30)} | Status | Quality | Duration`);
  console.log(`${'-'.repeat(30)}-+---------+---------+----------`);
  
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const quality = result.quality?.score ?? 'N/A';
    const duration = `${result.duration}ms`;
    
    console.log(
      `${(result.testName || 'unknown').padEnd(30)} | ${status.padEnd(7)} | ${String(quality).padStart(7)} | ${duration}`
    );
  }

  // Issues summary
  const allIssues = results
    .flatMap(r => (r.quality?.issues || []).map(issue => ({ test: r.testName, issue })))
    .slice(0, 10);

  if (allIssues.length > 0) {
    console.log(`\n⚠️  Issues Found:`);
    allIssues.forEach(({ test, issue }) => {
      console.log(`   [${test}] ${issue}`);
    });
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`Overall Result: ${passed === total ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`${'═'.repeat(70)}\n`);

  return {
    passed,
    total,
    passed_rate: Math.round((passed / total) * 100),
    avg_quality_score: avgQualityScore,
    avg_duration_ms: avgDuration,
    results,
  };
}

// ── Test Definitions ───────────────────────────────────────────────────
const tests = {
  math_simple: {
    prompt: 'What is 2+2? Answer with just the number.',
    expected: 4,
    description: 'Simple Math: 2+2',
  },
  math_addition: {
    prompt: 'Calculate 15 + 27. Just give the final number.',
    expected: 42,
    description: 'Addition: 15+27',
  },
  math_subtraction: {
    prompt: 'What is 100 - 23? Answer only with the number.',
    expected: 77,
    description: 'Subtraction: 100-23',
  },
  math_multiplication: {
    prompt: 'Calculate 6 times 7. Answer with just the number.',
    expected: 42,
    description: 'Multiplication: 6×7',
  },
  fact_check: {
    prompt: 'Is the Earth round? Answer yes or no.',
    expected: null,  // Not a math check
    description: 'Factual: Is Earth round?',
  },
  encoding_test: {
    prompt: 'Reply with exactly: Hello there.',
    expected: null,  // Not a math check
    description: 'Encoding: Say hello',
    maxTokens: 8,
  },
  chinese_test: {
    prompt: '用中文说"你好"。',
    expected: null,
    description: 'CJK: Chinese greeting',
  },
};

// ── Main Entry Point ───────────────────────────────────────────────────
(async () => {
  try {
    const summary = await runAllTests();
    process.exit(summary.passed === summary.total ? 0 : 1);
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  }
})();
