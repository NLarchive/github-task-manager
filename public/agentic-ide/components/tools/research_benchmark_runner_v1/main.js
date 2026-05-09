function bridgeBase() {
  return process.env.AGENTIC_IDE_BRIDGE_BASE || 'http://localhost:3131';
}

function normalizeTopic(topic) {
  const value = String(topic || '').trim();
  return value || 'LangGraph multi-agent patterns';
}

async function fetchJson(relativePath, options = {}) {
  const response = await fetch(`${bridgeBase()}${relativePath}`, options);
  const body = await response.text();
  if (!response.ok) throw new Error(body || `Request failed for ${relativePath} (${response.status})`);
  return JSON.parse(body);
}

async function readModelStatus() {
  try {
    return await fetchJson('/api/model');
  } catch {
    return null;
  }
}

export async function run(topic, benchmarkName, runLabel, startedAt) {
  const normalizedTopic = normalizeTopic(topic);
  const runStartedAt = startedAt || new Date().toISOString();
  const startedMs = Date.now();
  const inputPayload = {
    topic: normalizedTopic,
    query: normalizedTopic,
    started_at: runStartedAt,
  };
  const result = await fetchJson('/api/runtime/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nodeId: 'research_workflow',
      input: inputPayload,
    }),
  });
  const completedAt = new Date().toISOString();
  const modelStatus = await readModelStatus();
  return {
    report: result.output?.report || '',
    benchmark_meta: {
      benchmark_name: benchmarkName || 'research_benchmark',
      workflow_id: 'research_workflow',
      run_label: runLabel || `research-${Date.now().toString(36)}`,
      started_at: runStartedAt,
      completed_at: completedAt,
      duration_ms: Date.now() - startedMs,
      model_id: result.modelId || null,
      model_status: modelStatus
        ? {
            llm_endpoint: modelStatus.llm_endpoint || null,
            gguf_exists: !!(modelStatus.ggufExists ?? modelStatus.exists),
            models: Array.isArray(modelStatus.models)
              ? modelStatus.models.map((model) => ({
                  id: model.id,
                  label: model.label,
                  path: model.path,
                  provider: model.meta?.provider || null
                }))
              : []
          }
        : null,
      input_payload: inputPayload,
      runtime_output: result.output || {},
      steps: result.steps || [],
      executed_nodes: result.executedNodes || [],
      run_fingerprint: result.runFingerprint || null,
      step_count: Array.isArray(result.steps) ? result.steps.length : 0,
      failed_step_count: Array.isArray(result.steps) ? result.steps.filter((step) => step.status === 'fail').length : 0,
      unique_component_count: Array.isArray(result.executedNodes) ? result.executedNodes.length : 0,
      logs: result.logs || [],
      warnings: result.warnings || [],
    },
  };
}