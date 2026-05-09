# AI Inference Isolation Layer

This folder isolates GGUF-related inference selection and engine adapters from app code.

## Engines

- llmjs: Browser-first llama.cpp WASM path.
- node-llama-cpp: Node.js local GGUF inference (recommended for this repository).
- llama-server-openai: llama-server `/v1/chat/completions` adapter for process-separated inference.
- duck4i-llama: lightweight `@duck4i/llama` runtime adapter for quick prototype execution.
- webllm: Browser WebGPU-focused path.
- llama3pure: Educational pure JavaScript generation/parsing path.
- hyllama: GGUF metadata parser path (not a full inference engine).

## Why this exists

- Keep bridge and UI code independent from vendor-specific runtimes.
- Provide one contract for selecting and testing engines.
- Support compatibility-first selection for local GGUF models.

## Current recommendation for the bundled Gemma model

For a local Node.js backend and model path under public/agentic-ide/components/models/gemma/...gguf, the preferred engine is node-llama-cpp.

## Programmatic usage

```js
const { createInferenceManager } = require('./main');
const manager = createInferenceManager();
const result = await manager.chooseBestEngine({
  runtime: 'node',
  modelPath: 'public/agentic-ide/components/models/gemma/...gguf',
  llmEndpoint: 'http://127.0.0.1:8080'
});
```

## Live text and coding validation

Run the benchmark suites against real inference endpoints. By default, the suites fail fast when no live engine is available.

```powershell
node public/agentic-ide/components/inference/tests/text/run-validation-suite.js
node public/agentic-ide/components/inference/tests/coding/run-coding-suite.js
```

To allow diagnostic reports even when no live runtime is available:

```powershell
$env:INFERENCE_REQUIRE_LIVE = "0"
```

## Compare multiple inference components

Use the selector script to try all currently available live adapters and pick a winner by correctness and latency:

```powershell
node public/agentic-ide/components/inference/tests/select-best.js
```

Optional dependency for the lightweight adapter:

```powershell
npm install @duck4i/llama
```
