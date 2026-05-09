#!/usr/bin/env node
/**
 * Inference Pipeline Debugger
 * 
 * Traces requests through the full pipeline:
 * 1. JavaScript bridge client (bridge.js/chat.js)
 * 2. Node.js bridge server (bridge-server.js) 
 * 3. llama.cpp HTTP endpoint (port 8080)
 * 4. LLM model (gemma-4-26b)
 * 
 * Usage:
 *   node inference-debug.js "What is 2+2?"
 *   node inference-debug.js "Hello, how are you?"
 */

const http = require('http');

const LLM_HOST = process.env.LLM_HOST || 'localhost';
const LLM_PORT = parseInt(process.env.LLM_PORT || '8080', 10);
const BRIDGE_HOST = 'localhost';
const BRIDGE_PORT = 3131;

/**
 * Step 1: Test direct connection to llama.cpp
 */
async function testLlamaConnection() {
  console.log('\n' + '═'.repeat(70));
  console.log('STEP 1: Testing Direct LLaMA.cpp Connection');
  console.log('═'.repeat(70));
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({ prompt: 'ping', max_tokens: 1, temperature: 0 });
    const opts = {
      hostname: LLM_HOST,
      port: LLM_PORT,
      path: '/completion',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    console.log(`🔗 Connecting to: http://${LLM_HOST}:${LLM_PORT}/completion`);
    console.log(`⏱️  Timeout: 5s`);

    const req = http.request(opts, (res) => {
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      console.log(`${ok ? '✅' : '❌'} Connected! Status: ${res.statusCode}`);
      console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
      resolve(ok);
    });

    req.on('error', (err) => {
      console.error(`❌ Connection failed: ${err.message}`);
      console.error(`   Make sure llama-server is running on port ${LLM_PORT}`);
      console.error(`   Command: ./llama-server -m <model> --port 8080`);
      resolve(false);
    });

    setTimeout(() => {
      req.destroy();
      console.error(`⏱️  Connection timeout after 5s`);
      resolve(false);
    }, 5000);

    req.write(postData);
    req.end();
  });
}

/**
 * Step 2: Send simple completion request to llama.cpp
 */
async function testLlamaCompletion(prompt) {
  console.log('\n' + '═'.repeat(70));
  console.log('STEP 2: Testing LLaMA.cpp Completion');
  console.log('═'.repeat(70));

  const postData = JSON.stringify({
    prompt,
    max_tokens: 256,
    temperature: 0.1,
    stream: false,
  });

  return new Promise((resolve) => {
    const opts = {
      hostname: LLM_HOST,
      port: LLM_PORT,
      path: '/completion',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    console.log(`📤 Request:`);
    console.log(`   Prompt: "${prompt}"`);
    console.log(`   Max tokens: 256`);
    console.log(`   Temperature: 0.1`);

    const startTime = Date.now();
    const req = http.request(opts, (res) => {
      let body = '';
      console.log(`📥 Response status: ${res.statusCode}`);

      res.on('data', (chunk) => {
        body += chunk.toString();
        process.stdout.write('.');  // Progress indicator
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`\n⏱️  Response time: ${duration}ms`);

        try {
          const data = JSON.parse(body);
          console.log(`✅ Valid JSON response`);
          console.log(`📊 Response size: ${body.length} bytes`);
          
          // Show available fields
          const fields = Object.keys(data);
          console.log(`📋 Available fields: ${fields.join(', ')}`);

          // Extract completion text
          const text = data.content || data.text || data.generated_text || '';
          console.log(`\n📝 Completion text (first 200 chars):`);
          console.log(`   "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"`);
          console.log(`   Length: ${text.length} chars`);

          // Analyze for quality issues
          console.log(`\n🔍 Quality Checks:`);
          analyzeCompletion(text);

          resolve({ ok: true, data, text, duration });
        } catch (e) {
          console.error(`❌ JSON parse error: ${e.message}`);
          console.error(`   Response: ${body.substring(0, 500)}`);
          resolve({ ok: false, error: e.message, body, duration });
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Request error: ${err.message}`);
      resolve({ ok: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Step 3: Test bridge server completion endpoint
 */
async function testBridgeCompletion(prompt) {
  console.log('\n' + '═'.repeat(70));
  console.log('STEP 3: Testing Bridge Server Completion');
  console.log('═'.repeat(70));

  const postData = JSON.stringify({
    prompt,
    max_tokens: 256,
    temperature: 0.1,
  });

  return new Promise((resolve) => {
    const opts = {
      hostname: BRIDGE_HOST,
      port: BRIDGE_PORT,
      path: '/api/llm/complete',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    console.log(`📤 Request to bridge server:`);
    console.log(`   URL: http://${BRIDGE_HOST}:${BRIDGE_PORT}/api/llm/complete`);
    console.log(`   Prompt: "${prompt}"`);

    const startTime = Date.now();
    const req = http.request(opts, (res) => {
      let body = '';
      console.log(`📥 Bridge response status: ${res.statusCode}`);

      res.on('data', (chunk) => {
        body += chunk.toString();
        process.stdout.write('.');
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`\n⏱️  Bridge response time: ${duration}ms`);

        try {
          const data = JSON.parse(body);
          console.log(`✅ Valid JSON response from bridge`);
          
          const text = data.content || data.text || data.generated_text || '';
          console.log(`\n📝 Completion text (first 200 chars):`);
          console.log(`   "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"`);
          console.log(`   Length: ${text.length} chars`);

          console.log(`\n🔍 Quality Checks:`);
          analyzeCompletion(text);

          resolve({ ok: true, data, text, duration });
        } catch (e) {
          console.error(`❌ JSON parse error: ${e.message}`);
          console.error(`   Response: ${body.substring(0, 500)}`);
          resolve({ ok: false, error: e.message, body, duration });
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Bridge request error: ${err.message}`);
      resolve({ ok: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Analyze completion for quality issues
 */
function analyzeCompletion(text) {
  // Check for corruption patterns
  const cjkPattern = /[\u4E00-\u9FFF\uAC00-\uD7AF]{2,}/g;
  const cjkMatches = text.match(cjkPattern) || [];

  console.log(`   • CJK characters detected: ${cjkMatches.length > 0 ? '✅' : '❌'} (${cjkMatches.length})`);

  // Check for character repetition
  let hasRepetition = false;
  for (const match of cjkMatches) {
    if (/(.)\1{2,}/.test(match)) {
      console.log(`      ⚠️  REPETITION: "${match}" has repeating characters!`);
      hasRepetition = true;
    }
  }

  if (!hasRepetition && cjkMatches.length > 0) {
    console.log(`      ✅ CJK characters look normal`);
  }

  // Check for gibberish
  const specialChars = (text.match(/[^a-zA-Z0-9\s.,!?\-()]/g) || []).length;
  console.log(`   • Special characters: ${specialChars}`);
  
  if (specialChars > text.length * 0.3) {
    console.log(`      ⚠️  ALERT: ${Math.round((specialChars/text.length)*100)}% special chars (possible gibberish)`);
  }

  // Check encoding
  try {
    const encoded = encodeURIComponent(text);
    const decoded = decodeURIComponent(encoded);
    console.log(`   • Encoding sanity check: ${decoded === text ? '✅ OK' : '❌ MISMATCH'}`);
  } catch (e) {
    console.log(`   • Encoding sanity check: ❌ ERROR (${e.message})`);
  }

  // Check for meaningful content
  const words = text.split(/\s+/).filter(w => w.length > 0);
  console.log(`   • Word count: ${words.length}`);

  // Check word repetition
  const freq = new Map();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  const maxFreq = Math.max(...freq.values(), 0);
  if (maxFreq > 5) {
    const repeatWord = [...freq.entries()].find(e => e[1] === maxFreq)?.[0];
    console.log(`   • Excessive repetition: ⚠️  "${repeatWord}" × ${maxFreq}`);
  } else {
    console.log(`   • Word variety: ✅ Good (max frequency: ${maxFreq})`);
  }
}

/**
 * Compare responses from both endpoints
 */
function compareResponses(llamaResult, bridgeResult) {
  console.log('\n' + '═'.repeat(70));
  console.log('STEP 4: Comparing Responses');
  console.log('═'.repeat(70));

  if (!llamaResult.ok || !bridgeResult.ok) {
    console.log('❌ Cannot compare - one or both requests failed');
    return;
  }

  const llamaText = llamaResult.text || '';
  const bridgeText = bridgeResult.text || '';

  console.log(`\n📊 Response Comparison:`);
  console.log(`   LLaMA length: ${llamaText.length} chars (${llamaResult.duration}ms)`);
  console.log(`   Bridge length: ${bridgeText.length} chars (${bridgeResult.duration}ms)`);

  if (llamaText === bridgeText) {
    console.log(`   ✅ Responses are IDENTICAL`);
  } else {
    console.log(`   ⚠️  Responses DIFFER`);
    
    // Show differences
    const minLen = Math.min(llamaText.length, bridgeText.length);
    let diffPos = -1;
    for (let i = 0; i < minLen; i++) {
      if (llamaText[i] !== bridgeText[i]) {
        diffPos = i;
        break;
      }
    }

    if (diffPos >= 0) {
      const start = Math.max(0, diffPos - 20);
      const end = Math.min(minLen, diffPos + 20);
      console.log(`\n   First difference at position ${diffPos}:`);
      console.log(`   LLaMA:  ...${llamaText.substring(start, end)}...`);
      console.log(`   Bridge: ...${bridgeText.substring(start, end)}...`);
    }

    if (llamaText.length !== bridgeText.length) {
      console.log(`\n   ⚠️  LENGTH MISMATCH: LLaMA has ${llamaText.length - bridgeText.length} more chars`);
    }
  }
}

/**
 * Main debug flow
 */
async function runDebugger() {
  const prompt = process.argv[2] || 'What is 2+2?';

  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║       Agentic IDE Inference Pipeline Debugger                      ║
║    Tracing: Chat → Bridge Server → LLaMA.cpp → Model               ║
╚════════════════════════════════════════════════════════════════════╝
`);

  console.log(`📋 Test Prompt: "${prompt}"\n`);

  // Step 1: Test connection
  const connectionOk = await testLlamaConnection();
  if (!connectionOk) {
    console.error('\n❌ Cannot proceed - LLaMA.cpp is not reachable');
    process.exit(1);
  }

  // Step 2: Test llama.cpp directly
  const llamaResult = await testLlamaCompletion(prompt);

  // Step 3: Test through bridge
  const bridgeResult = await testBridgeCompletion(prompt);

  // Step 4: Compare
  compareResponses(llamaResult, bridgeResult);

  console.log(`\n${'═'.repeat(70)}`);
  console.log('Debug Session Complete');
  console.log(`${'═'.repeat(70)}\n`);

  // Exit code
  const success = llamaResult.ok && bridgeResult.ok;
  process.exit(success ? 0 : 1);
}

// Run
runDebugger().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
