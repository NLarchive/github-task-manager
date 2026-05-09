function bridgeBase() {
  return process.env.AGENTIC_IDE_BRIDGE_BASE || 'http://localhost:3131';
}

function slugify(value) {
  return String(value || 'benchmark')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'benchmark';
}

function toDurationMs(startedAt, fallback) {
  const fallbackMs = Number(fallback || 0);
  if (Number.isFinite(fallbackMs) && fallbackMs > 0) return fallbackMs;
  const parsed = Date.parse(startedAt || '');
  if (Number.isFinite(parsed)) return Math.max(0, Date.now() - parsed);
  return 0;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value || 0)));
}

function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function countMatches(text, regex) {
  const matches = String(text || '').match(regex);
  return matches ? matches.length : 0;
}

function normalizeTopicTerms(topic) {
  return String(topic || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .slice(0, 8);
}

function delta(currentValue, previousValue) {
  if (previousValue === null || previousValue === undefined) return null;
  return round(Number(currentValue || 0) - Number(previousValue || 0), 2);
}

function pctDelta(currentValue, previousValue) {
  if (previousValue === null || previousValue === undefined) return null;
  const previous = Number(previousValue || 0);
  if (!previous) return currentValue ? null : 0;
  return round(((Number(currentValue || 0) - previous) / previous) * 100, 2);
}

function shouldSkipHistoryReads() {
  return process.env.AGENTIC_IDE_BENCHMARK_NO_WRITE === '1' || process.env.AGENTIC_IDE_BENCHMARK_NO_COMPARE === '1';
}

async function fetchJson(relativePath) {
  const response = await fetch(`${bridgeBase()}${relativePath}`);
  const body = await response.text();
  if (!response.ok) {
    throw new Error(body || `Request failed for ${relativePath} (${response.status})`);
  }
  return safeJsonParse(body, {});
}

async function persistRecord(relativePath, record) {
  if (process.env.AGENTIC_IDE_BENCHMARK_NO_WRITE === '1') return;
  const response = await fetch(`${bridgeBase()}/api/file?path=${encodeURIComponent(relativePath)}`, {
    method: 'PUT',
    body: JSON.stringify(record, null, 2),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Failed to write benchmark record (${response.status})`);
  }
}

function computeComponentScore(component, totalDurationMs) {
  const durationPenalty = Math.min(36, Math.log10((component.total_duration_ms || 0) + 1) * 12);
  const bottleneckPenalty = totalDurationMs > 0
    ? Math.max(0, (((component.total_duration_ms || 0) / totalDurationMs) - 0.45) * 75)
    : 0;
  const failurePenalty = (component.failure_count || 0) * 40;
  return round(clamp(100 - durationPenalty - bottleneckPenalty - failurePenalty), 1);
}

function summarizeComponents(steps, executedNodes) {
  const byId = new Map();
  (Array.isArray(executedNodes) ? executedNodes : []).forEach((node) => {
    byId.set(node.nodeId, {
      node_id: node.nodeId,
      label: node.label || node.nodeId,
      type: node.type || 'unknown',
      path: node.path || '',
      version: Number(node.version || 1) || 1,
      success_threshold: Number(node.success_threshold || 0) || 0,
      runtime_signature: node.runtime_signature || null,
      component_signature: node.component_signature || null,
      file_hashes: Array.isArray(node.file_hashes) ? node.file_hashes : [],
      call_count: 0,
      total_duration_ms: 0,
      avg_duration_ms: 0,
      max_duration_ms: 0,
      failure_count: 0,
      status: 'pass',
      sample_inputs: Array.isArray(node.sample_inputs) ? node.sample_inputs : [],
      sample_outputs: Array.isArray(node.sample_outputs) ? node.sample_outputs : []
    });
  });

  (Array.isArray(steps) ? steps : []).forEach((step) => {
    if (!step || !step.nodeId) return;
    if (!byId.has(step.nodeId)) {
      byId.set(step.nodeId, {
        node_id: step.nodeId,
        label: step.label || step.nodeId,
        type: step.type || 'unknown',
        path: '',
        version: 1,
        success_threshold: 0,
        runtime_signature: null,
        component_signature: null,
        file_hashes: [],
        call_count: 0,
        total_duration_ms: 0,
        avg_duration_ms: 0,
        max_duration_ms: 0,
        failure_count: 0,
        status: 'pass',
        sample_inputs: [],
        sample_outputs: []
      });
    }
    const current = byId.get(step.nodeId);
    current.call_count += 1;
    current.total_duration_ms += Number(step.durationMs || 0);
    current.max_duration_ms = Math.max(current.max_duration_ms, Number(step.durationMs || 0));
    current.avg_duration_ms = current.call_count ? round(current.total_duration_ms / current.call_count, 2) : 0;
    if (step.status === 'fail') {
      current.failure_count += 1;
      current.status = 'fail';
    }
    if (step.inputSnippet && current.sample_inputs.length < 2) current.sample_inputs.push(step.inputSnippet);
    if ((step.outputSnippet || step.output) && current.sample_outputs.length < 2) current.sample_outputs.push(step.outputSnippet || step.output);
  });

  const components = [...byId.values()]
    .filter((component) => component.call_count > 0 || component.runtime_signature || component.component_signature)
    .sort((a, b) => (b.total_duration_ms - a.total_duration_ms) || a.node_id.localeCompare(b.node_id));
  const totalDurationMs = components.reduce((sum, component) => sum + Number(component.total_duration_ms || 0), 0);
  return components.map((component) => ({
    ...component,
    total_duration_ms: round(component.total_duration_ms, 2),
    avg_duration_ms: round(component.avg_duration_ms, 2),
    max_duration_ms: round(component.max_duration_ms, 2),
    share_of_runtime: totalDurationMs ? round(component.total_duration_ms / totalDurationMs, 3) : 0,
    score: computeComponentScore(component, totalDurationMs)
  }));
}

function computeQualitySignals(htmlReport, topic, runtimeOutput) {
  const text = String(htmlReport || '');
  const normalized = text.toLowerCase();
  const topicTerms = normalizeTopicTerms(topic);
  const topicTermsMatched = topicTerms.filter((term) => normalized.includes(term));
  const reportWordCount = text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return {
    html_detected: /<[^>]+>/.test(text),
    topic_mentioned: topicTermsMatched.length > 0,
    topic_terms: topicTerms,
    topic_terms_matched: topicTermsMatched,
    topic_coverage: topicTerms.length ? round(topicTermsMatched.length / topicTerms.length, 2) : 1,
    has_heading: /<h[1-6]\b/i.test(text),
    has_lists: /<(ul|ol)\b/i.test(text),
    has_paragraphs: /<p\b/i.test(text),
    report_length: text.length,
    report_word_count: reportWordCount,
    heading_count: countMatches(text, /<h[1-6]\b/gi),
    paragraph_count: countMatches(text, /<p\b/gi),
    list_count: countMatches(text, /<(ul|ol)\b/gi),
    link_count: countMatches(text, /<a\b/gi),
    code_block_count: countMatches(text, /<(code|pre)\b/gi),
    output_field_count: runtimeOutput && typeof runtimeOutput === 'object' ? Object.keys(runtimeOutput).length : 0
  };
}

function computeMetrics(meta, htmlReport, steps, components, qualitySignals) {
  const bottleneck = components[0] || null;
  return {
    duration_ms: toDurationMs(meta.started_at, meta.duration_ms),
    report_length: htmlReport.length,
    report_word_count: qualitySignals.report_word_count,
    html_detected: qualitySignals.html_detected,
    step_count: Array.isArray(steps) ? steps.length : 0,
    failed_step_count: (Array.isArray(steps) ? steps : []).filter((step) => step.status === 'fail').length,
    unique_component_count: components.length,
    warning_count: Array.isArray(meta.warnings) ? meta.warnings.length : 0,
    log_count: Array.isArray(meta.logs) ? meta.logs.length : 0,
    bottleneck_node_id: bottleneck?.node_id || null,
    bottleneck_duration_ms: round(bottleneck?.total_duration_ms || 0, 2),
    bottleneck_share: bottleneck?.share_of_runtime || 0
  };
}

function computeFeedback(qualitySignals, metrics, htmlReport) {
  const issues = [];
  if (!String(htmlReport || '').trim()) issues.push('report_missing');
  if (!qualitySignals.html_detected) issues.push('report_not_html');
  if (!qualitySignals.topic_mentioned) issues.push('topic_reference_missing');
  if (!qualitySignals.has_heading) issues.push('report_missing_heading');
  if (!qualitySignals.has_paragraphs) issues.push('report_missing_paragraphs');
  if (qualitySignals.report_word_count < 60) issues.push('report_too_short');
  if (metrics.failed_step_count > 0) issues.push('component_execution_failures');
  if (metrics.warning_count > 0) issues.push('runtime_warnings_present');
  return {
    quality_signals: qualitySignals,
    issues,
    notes: issues.length
      ? 'Review bottlenecks, changed component signatures, and structural quality signals before accepting this benchmark as a new baseline.'
      : 'Benchmark run completed with healthy structure, no component failures, and no immediate quality regressions.'
  };
}

function computeScorecard(metrics, qualitySignals, feedback) {
  const qualityScore = clamp(
    (qualitySignals.html_detected ? 24 : 0) +
    (qualitySignals.has_heading ? 14 : 0) +
    (qualitySignals.has_paragraphs ? 14 : 0) +
    (qualitySignals.has_lists ? 8 : 0) +
    Math.min(20, qualitySignals.report_word_count / 10) +
    ((qualitySignals.topic_coverage || 0) * 20) -
    (feedback.issues.includes('report_too_short') ? 12 : 0)
  );
  const reliabilityScore = clamp(100 - (metrics.failed_step_count * 35) - (feedback.issues.length * 6) - (metrics.warning_count * 4));
  const efficiencyScore = clamp(
    100 -
    Math.min(55, Math.log10((metrics.duration_ms || 0) + 1) * 18) -
    Math.max(0, ((metrics.bottleneck_share || 0) - 0.45) * 90) -
    (metrics.failed_step_count * 10)
  );
  const overallScore = round((qualityScore * 0.45) + (efficiencyScore * 0.30) + (reliabilityScore * 0.25), 1);
  return {
    overall_score: overallScore,
    quality_score: round(qualityScore, 1),
    efficiency_score: round(efficiencyScore, 1),
    reliability_score: round(reliabilityScore, 1),
    classification: overallScore >= 85 ? 'strong' : overallScore >= 70 ? 'good' : overallScore >= 50 ? 'mixed' : 'weak'
  };
}

async function loadPreviousRecord(currentRecord) {
  if (shouldSkipHistoryReads()) return null;
  try {
    const entries = await fetchJson(`/api/list?path=${encodeURIComponent('workflows/benchmarks/outputs')}`);
    const files = Array.isArray(entries)
      ? entries.filter((entry) => !entry.isDir && entry.name !== 'README.md' && entry.name.endsWith('.json'))
      : [];
    const records = [];
    for (const entry of files.slice().sort((a, b) => String(b.name).localeCompare(String(a.name))).slice(0, 24)) {
      const outputPath = `workflows/benchmarks/outputs/${entry.name}`;
      const record = await fetchJson(`/api/file?path=${encodeURIComponent(outputPath)}`);
      if (!record || record.benchmark_name !== currentRecord.benchmark_name || record.workflow_id !== currentRecord.workflow_id) continue;
      records.push({ record, output_path: outputPath });
    }
    const sameTopic = records.filter((entry) => entry.record.topic === currentRecord.topic);
    const pool = sameTopic.length ? sameTopic : records;
    pool.sort((a, b) => Date.parse(b.record.completed_at || b.record.started_at || '') - Date.parse(a.record.completed_at || a.record.started_at || ''));
    return pool[0] || null;
  } catch {
    return null;
  }
}

function compareComponents(currentComponents, previousComponents) {
  const previousById = new Map((previousComponents || []).map((component) => [component.node_id, component]));
  const currentById = new Map((currentComponents || []).map((component) => [component.node_id, component]));
  const ids = [...new Set([...currentById.keys(), ...previousById.keys()])];
  const changes = ids.map((nodeId) => {
    const current = currentById.get(nodeId) || null;
    const previous = previousById.get(nodeId) || null;
    const sourceChanged = !!(current && previous && (
      current.component_signature !== previous.component_signature ||
      current.runtime_signature !== previous.runtime_signature ||
      current.version !== previous.version
    ));
    const changeType = !previous
      ? 'new_component'
      : !current
        ? 'removed_component'
        : sourceChanged
          ? 'source_changed'
          : 'runtime_changed';
    return {
      node_id: nodeId,
      label: current?.label || previous?.label || nodeId,
      type: current?.type || previous?.type || 'unknown',
      change_type: changeType,
      source_changed: sourceChanged,
      duration_ms_delta: delta(current?.total_duration_ms, previous?.total_duration_ms),
      duration_pct_delta: pctDelta(current?.total_duration_ms, previous?.total_duration_ms),
      score_delta: delta(current?.score, previous?.score),
      failure_delta: delta(current?.failure_count, previous?.failure_count),
      status_changed: (current?.status || null) !== (previous?.status || null),
      current_signature: current?.component_signature || null,
      previous_signature: previous?.component_signature || null,
      current_version: current?.version || null,
      previous_version: previous?.version || null
    };
  }).filter((change) => change.change_type !== 'runtime_changed' || change.duration_ms_delta || change.score_delta || change.status_changed);

  return {
    changed_components: changes,
    likely_regressions: changes.filter((change) =>
      (change.score_delta !== null && change.score_delta < 0) ||
      (change.duration_ms_delta !== null && change.duration_ms_delta > 0) ||
      change.status_changed ||
      (change.failure_delta !== null && change.failure_delta > 0)
    ),
    likely_improvements: changes.filter((change) =>
      (change.score_delta !== null && change.score_delta > 0) ||
      (change.duration_ms_delta !== null && change.duration_ms_delta < 0)
    )
  };
}

function buildComparison(currentRecord, previousEntry) {
  if (!previousEntry || !previousEntry.record) return null;
  const previous = previousEntry.record;
  const componentChanges = compareComponents(currentRecord.component_summary, previous.component_summary || []);
  return {
    basis: previous.topic === currentRecord.topic ? 'same_topic' : 'same_benchmark',
    previous_run_label: previous.run_label || null,
    previous_output_path: previousEntry.output_path || null,
    previous_completed_at: previous.completed_at || null,
    score_delta: {
      overall_score: delta(currentRecord.scorecard.overall_score, previous.scorecard?.overall_score),
      quality_score: delta(currentRecord.scorecard.quality_score, previous.scorecard?.quality_score),
      efficiency_score: delta(currentRecord.scorecard.efficiency_score, previous.scorecard?.efficiency_score),
      reliability_score: delta(currentRecord.scorecard.reliability_score, previous.scorecard?.reliability_score)
    },
    metrics_delta: {
      duration_ms: delta(currentRecord.metrics.duration_ms, previous.metrics?.duration_ms),
      duration_pct: pctDelta(currentRecord.metrics.duration_ms, previous.metrics?.duration_ms),
      report_length: delta(currentRecord.metrics.report_length, previous.metrics?.report_length),
      report_word_count: delta(currentRecord.metrics.report_word_count, previous.metrics?.report_word_count),
      step_count: delta(currentRecord.metrics.step_count, previous.metrics?.step_count),
      failed_step_count: delta(currentRecord.metrics.failed_step_count, previous.metrics?.failed_step_count)
    },
    ...componentChanges
  };
}

function buildImprovementCandidates(record) {
  const candidates = [];

  (record.component_summary || [])
    .filter((component) => component.failure_count > 0)
    .forEach((component) => {
      candidates.push({
        priority: 'high',
        kind: 'component_failure',
        target: component.node_id,
        detail: `${component.label} failed ${component.failure_count} time(s) during the run.`
      });
    });

  (record.component_summary || [])
    .filter((component) => component.share_of_runtime >= 0.35)
    .slice(0, 3)
    .forEach((component) => {
      candidates.push({
        priority: component.share_of_runtime >= 0.5 ? 'high' : 'medium',
        kind: 'bottleneck',
        target: component.node_id,
        detail: `${component.label} consumed ${Math.round(component.share_of_runtime * 100)}% of observed runtime.`
      });
    });

  (record.comparison?.likely_regressions || []).slice(0, 4).forEach((change) => {
    candidates.push({
      priority: change.source_changed ? 'high' : 'medium',
      kind: 'regression',
      target: change.node_id,
      detail: `${change.label} regressed by ${change.duration_ms_delta ?? 0}ms and ${change.score_delta ?? 0} score points.`
    });
  });

  (record.feedback?.issues || []).forEach((issue) => {
    candidates.push({
      priority: issue.includes('missing') || issue.includes('failures') ? 'high' : 'medium',
      kind: 'quality_signal',
      target: 'workflow_output',
      detail: issue
    });
  });

  return candidates.slice(0, 10);
}

export async function run(topic, report, benchmarkName, runLabel, startedAt, benchmarkMeta) {
  const meta = benchmarkMeta && typeof benchmarkMeta === 'object' ? benchmarkMeta : {};
  const normalizedTopic = String(topic || '').trim() || 'untitled-topic';
  const benchmarkNameValue = String(benchmarkName || meta.benchmark_name || 'research_benchmark').trim();
  const label = String(runLabel || meta.run_label || `${benchmarkNameValue}-${Date.now().toString(36)}`);
  const completedAt = new Date().toISOString();
  const runtimeOutput = meta.runtime_output && typeof meta.runtime_output === 'object' ? meta.runtime_output : {};
  const htmlReport = String(report || runtimeOutput.report || '');
  const steps = Array.isArray(meta.steps) ? meta.steps : [];
  const componentSummary = summarizeComponents(steps, meta.executed_nodes);
  const qualitySignals = computeQualitySignals(htmlReport, normalizedTopic, runtimeOutput);
  const metrics = computeMetrics({ ...meta, started_at: startedAt || meta.started_at || completedAt }, htmlReport, steps, componentSummary, qualitySignals);
  const feedback = computeFeedback(qualitySignals, metrics, htmlReport);
  const scorecard = computeScorecard(metrics, qualitySignals, feedback);

  const baseRecord = {
    benchmark_name: benchmarkNameValue,
    run_label: label,
    workflow_id: meta.workflow_id || 'research_workflow',
    topic: normalizedTopic,
    started_at: startedAt || meta.started_at || completedAt,
    completed_at: completedAt,
    input_payload: meta.input_payload || {
      topic: normalizedTopic,
      benchmark_name: benchmarkNameValue,
      run_label: label
    },
    metrics,
    scorecard,
    feedback,
    model_id: meta.model_id || null,
    model_status: meta.model_status || null,
    run_fingerprint: meta.run_fingerprint || null,
    logs: meta.logs || [],
    warnings: meta.warnings || [],
    steps,
    component_summary: componentSummary,
    runtime_output: runtimeOutput,
    report: htmlReport,
  };

  const previousEntry = await loadPreviousRecord(baseRecord);
  const record = {
    ...baseRecord,
    comparison: buildComparison(baseRecord, previousEntry)
  };
  record.improvement_candidates = buildImprovementCandidates(record);

  const fileName = `${slugify(benchmarkNameValue)}-${slugify(label)}-${Date.now().toString(36)}.json`;
  const outputPath = `workflows/benchmarks/outputs/${fileName}`;
  await persistRecord(outputPath, record);
  return {
    benchmark_record: record,
    output_path: outputPath,
  };
}