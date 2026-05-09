function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function logEvent(state, event, details = {}, level = 'info') {
  state.logs.push({
    id: uid('log'),
    ts: new Date().toISOString(),
    level,
    event,
    details
  });
  state.logs = state.logs.slice(-400);
}

export function addTestResult(state, name, passed, details = {}) {
  state.testResults.push({
    id: uid('test'),
    ts: new Date().toISOString(),
    name,
    passed: !!passed,
    details
  });
  state.testResults = state.testResults.slice(-200);
}

export function buildArtifactBundle(state) {
  return {
    generatedAt: new Date().toISOString(),
    config: state.config,
    modelId: state.modelId,
    historyCount: state.history.length,
    logs: state.logs,
    testResults: state.testResults
  };
}
