/**
 * Unit tests for Chat Quality Inspector
 */

import { ChatQualityInspector, runInspection } from './main.js';

export async function runTests() {
  const results = [];

  // Test 1: Corrupted response with repetition (the issue you reported)
  {
    const corruptedResponse = {
      content: `로직 (Logic)

**1. Introduction (개요요약약속속약속속약속속약속속약속속약속속약약속속약)

**2. Introduction (개요요약약속속약속속약`
    };

    const result = await runInspection(corruptedResponse);
    results.push({
      name: 'Detects corrupted Korean+repetition response',
      passed: !result.quality.isValid && result.quality.score < 50,
      details: result
    });
  }

  // Test 2: Clean response should pass
  {
    const cleanResponse = {
      content: 'Here is a clear response with actionable guidance for your JavaScript client integration. The solution focuses on proper error handling and state management.'
    };

    const result = await runInspection(cleanResponse);
    results.push({
      name: 'Accepts clean response',
      passed: result.quality.isValid && result.quality.score >= 70,
      details: result
    });
  }

  // Test 3: Too-short response fails
  {
    const tooShortResponse = {
      content: 'Hi'
    };

    const result = await runInspection(tooShortResponse);
    results.push({
      name: 'Rejects too-short response',
      passed: !result.quality.isValid,
      details: result
    });
  }

  // Test 4: Gibberish/no meaning
  {
    const gibberishResponse = {
      content: '???? //// ???? //// ???? //// ???? //// ????'
    };

    const result = await runInspection(gibberishResponse);
    results.push({
      name: 'Detects gibberish response',
      passed: !result.quality.isValid && result.quality.issues.length > 0,
      details: result
    });
  }

  // Test 5: Excessive word repetition
  {
    const repetitiveResponse = {
      content: 'The solution is the solution is the solution is the solution is the solution is the best approach for solving this problem.'
    };

    const result = await runInspection(repetitiveResponse);
    results.push({
      name: 'Detects excessive repetition',
      passed: !result.quality.isValid,
      details: result
    });
  }

  // Test 6: Mixed encoding with CJK corruption
  {
    const mixedResponse = {
      content: 'This is English text. 로직로직로직로직로직 and more English. Mixed corrupted content should fail.'
    };

    const result = await runInspection(mixedResponse);
    results.push({
      name: 'Detects mixed encoding corruption',
      passed: !result.quality.isValid || result.quality.score < 80,
      details: result
    });
  }

  // Calculate summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  return {
    ok: passed === total,
    passed,
    failed: total - passed,
    total,
    results,
    timestamp: new Date().toISOString()
  };
}

// Export for bridge runtime
export const chatQualityInspectorTests = {
  name: 'Chat Quality Inspector Test Suite',
  runTests,
  version: '1.0.0'
};
