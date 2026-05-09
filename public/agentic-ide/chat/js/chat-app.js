import { createDefaultState, loadState, saveState } from './chat-state.js';
import { fetchCatalog, fetchModelInfo, fetchRegistry, llmComplete, saveArtifact } from './chat-api.js';
import { renderThread, fillSelect } from './chat-render.js';
import { logEvent, addTestResult, buildArtifactBundle } from './chat-telemetry.js';
import { runChatSurfaceChecks } from './chat-tests.js';
import { runInspection } from '../../components/agents/chat-quality-inspector/main.js';

const DEFAULT_ENGINE_OPTIONS = [
  { id: 'llama-server-openai', label: 'llama-server OpenAI API' },
  { id: 'node-llama-cpp', label: 'node-llama-cpp (llama.cpp compatible)' }
];

let availableEngineOptions = [...DEFAULT_ENGINE_OPTIONS];

const state = loadState();

const ui = {
  bridgeDot: document.getElementById('bridge-dot'),
  bridgeStatus: document.getElementById('bridge-status'),
  modelSelect: document.getElementById('model-select'),
  configPanel: document.getElementById('config-panel'),
  thread: document.getElementById('thread'),
  chatInput: document.getElementById('chat-input'),
  fileInput: document.getElementById('cfg-file-input'),
  fileList: document.getElementById('file-list'),
  toast: document.getElementById('toast'),
  btnToggleConfig: document.getElementById('btn-toggle-config'),
  btnExportChat: document.getElementById('btn-export-chat'),
  btnNewChat: document.getElementById('btn-new-chat'),
  btnCopyInput: document.getElementById('btn-copy-input'),
  btnSend: document.getElementById('btn-send'),
  btnRunSelfTests: document.getElementById('btn-run-chat-self-tests'),
  btnExportTestResults: document.getElementById('btn-export-test-results'),
  btnExportLogs: document.getElementById('btn-export-logs'),
  btnSaveArtifacts: document.getElementById('btn-save-artifacts'),
  cfg: {
    endpoint: document.getElementById('cfg-endpoint'),
    backend: document.getElementById('cfg-backend'),
    temperature: document.getElementById('cfg-temperature'),
    topP: document.getElementById('cfg-top-p'),
    topK: document.getElementById('cfg-top-k'),
    maxTokens: document.getElementById('cfg-max-tokens'),
    responseFormat: document.getElementById('cfg-response-format'),
    includeHistory: document.getElementById('cfg-include-history'),
    historyWindow: document.getElementById('cfg-history-window'),
    includeRuntime: document.getElementById('cfg-include-runtime'),
    ragEnabled: document.getElementById('cfg-rag-enabled'),
    ragK: document.getElementById('cfg-rag-k'),
    promptProfile: document.getElementById('cfg-prompt-profile'),
    agentProfile: document.getElementById('cfg-agent-profile'),
    toolProfile: document.getElementById('cfg-tool-profile'),
    testProfile: document.getElementById('cfg-test-profile'),
    parameterProfile: document.getElementById('cfg-parameter-profile'),
    systemPrompt: document.getElementById('cfg-system-prompt'),
    editResets: document.getElementById('cfg-edit-resets'),
    autoScroll: document.getElementById('cfg-auto-scroll'),
    memoryEvalName: document.getElementById('cfg-memory-eval-name'),
    memoryKeypoints: document.getElementById('cfg-memory-keypoints'),
    memoryDeductions: document.getElementById('cfg-memory-deductions')
  },
  values: {
    temperature: document.getElementById('v-temperature'),
    topP: document.getElementById('v-top-p'),
    topK: document.getElementById('v-top-k')
  }
};

function sanitizeBackend(backend) {
  return availableEngineOptions.some((item) => item.id === backend)
    ? backend
    : availableEngineOptions[0].id;
}

function renderEngineOptions() {
  ui.cfg.backend.innerHTML = availableEngineOptions
    .map((backend) => `<option value="${backend.id}">${backend.label}</option>`)
    .join('');
}

renderEngineOptions();
state.config.backend = sanitizeBackend(state.config.backend);

function toast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add('show');
  clearTimeout(ui.toast._tid);
  ui.toast._tid = setTimeout(() => ui.toast.classList.remove('show'), 2200);
}

function readConfigFromUi() {
  state.config.endpoint = ui.cfg.endpoint.value.trim() || 'http://127.0.0.1:3131';
  state.config.backend = sanitizeBackend(ui.cfg.backend.value);
  state.config.temperature = Number(ui.cfg.temperature.value);
  state.config.top_p = Number(ui.cfg.topP.value);
  state.config.top_k = Number(ui.cfg.topK.value);
  state.config.max_tokens = Number(ui.cfg.maxTokens.value);
  state.config.response_format = ui.cfg.responseFormat.value;
  state.config.include_history = !!ui.cfg.includeHistory.checked;
  state.config.history_window = Number(ui.cfg.historyWindow.value || 8);
  state.config.include_runtime = !!ui.cfg.includeRuntime.checked;
  state.config.rag_enabled = !!ui.cfg.ragEnabled.checked;
  state.config.rag_k = Number(ui.cfg.ragK.value || 5);
  state.config.prompt_profile_id = ui.cfg.promptProfile.value || 'clean-base';
  state.config.agent_profile_id = ui.cfg.agentProfile.value || 'none';
  state.config.tool_profile_id = ui.cfg.toolProfile.value || 'none';
  state.config.test_profile_id = ui.cfg.testProfile.value || 'none';
  state.config.parameter_profile_id = ui.cfg.parameterProfile.value || 'balanced';
  state.config.system_prompt_override = ui.cfg.systemPrompt.value;
  state.config.edit_resets = !!ui.cfg.editResets.checked;
  state.config.auto_scroll = !!ui.cfg.autoScroll.checked;
  state.config.memory_eval_name = ui.cfg.memoryEvalName.value;
  state.config.memory_keypoints = ui.cfg.memoryKeypoints.value;
  state.config.memory_deductions = ui.cfg.memoryDeductions.value;
}

function writeConfigToUi() {
  ui.cfg.endpoint.value = state.config.endpoint;
  state.config.backend = sanitizeBackend(state.config.backend);
  ui.cfg.backend.value = state.config.backend;
  ui.cfg.temperature.value = String(state.config.temperature);
  ui.cfg.topP.value = String(state.config.top_p);
  ui.cfg.topK.value = String(state.config.top_k);
  ui.cfg.maxTokens.value = String(state.config.max_tokens);
  ui.cfg.responseFormat.value = state.config.response_format;
  ui.cfg.includeHistory.checked = !!state.config.include_history;
  ui.cfg.historyWindow.value = String(state.config.history_window);
  ui.cfg.includeRuntime.checked = !!state.config.include_runtime;
  ui.cfg.ragEnabled.checked = !!state.config.rag_enabled;
  ui.cfg.ragK.value = String(state.config.rag_k);
  ui.cfg.systemPrompt.value = state.config.system_prompt_override;
  ui.cfg.editResets.checked = !!state.config.edit_resets;
  ui.cfg.autoScroll.checked = !!state.config.auto_scroll;
  ui.cfg.memoryEvalName.value = state.config.memory_eval_name;
  ui.cfg.memoryKeypoints.value = state.config.memory_keypoints;
  ui.cfg.memoryDeductions.value = state.config.memory_deductions;
  syncSliderLabels();
}

function syncSliderLabels() {
  ui.values.temperature.textContent = Number(ui.cfg.temperature.value).toFixed(2);
  ui.values.topP.textContent = Number(ui.cfg.topP.value).toFixed(2);
  ui.values.topK.textContent = String(ui.cfg.topK.value);
}

function selectedProfile(group, id, fallback = {}) {
  return (state.catalog[group] || []).find((item) => item.id === id) || fallback;
}

function buildContextBlock() {
  const agent = selectedProfile('agents', state.config.agent_profile_id, {});
  const tool = selectedProfile('tools', state.config.tool_profile_id, {});
  const test = selectedProfile('tests', state.config.test_profile_id, {});
  return {
    agent,
    tool,
    test,
    memoryEvaluation: {
      name: state.config.memory_eval_name,
      keypoints: state.config.memory_keypoints,
      deductions: state.config.memory_deductions
    }
  };
}

function buildMessages(userPrompt) {
  const messages = [];
  const promptProfile = selectedProfile('prompts', state.config.prompt_profile_id, { prompt: '' });
  const systemPrompt = state.config.system_prompt_override || promptProfile.prompt || '';
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  if (state.config.include_history) {
    const slice = state.history.slice(-Math.max(1, state.config.history_window));
    slice.forEach((entry) => messages.push({ role: entry.role, content: entry.content }));
  }

  const context = buildContextBlock();
  const contextPrefix = `Context JSON:\n${JSON.stringify(context, null, 2)}`;
  const fileContext = state.files.length
    ? `\n\nAttached files:\n${state.files.map((item) => `${item.name}:\n${item.content.slice(0, 1800)}`).join('\n\n')}`
    : '';

  const includeContext = Boolean(
    state.files.length ||
    context.agent?.id && context.agent.id !== 'none' ||
    context.tool?.id && context.tool.id !== 'none' ||
    context.test?.id && context.test.id !== 'none' ||
    context.memoryEvaluation?.name ||
    context.memoryEvaluation?.keypoints ||
    context.memoryEvaluation?.deductions
  );

  if (includeContext) {
    messages.push({
      role: 'user',
      content: `Prompt:\n${userPrompt}\n\nAdditional context (use only if relevant):\n${contextPrefix}${fileContext}`,
    });
  } else {
    messages.push({ role: 'user', content: userPrompt });
  }
  return messages;
}

function toNormalizedTokens(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function extractResponseContent(response) {
  if (!response || typeof response !== 'object') return '';

  const directCandidates = [
    response.content,
    response.text,
    response.output,
    response.response,
    response.generated_text,
    response.completion,
    response.reasoning_content,
  ];
  const firstDirect = directCandidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  if (firstDirect) return firstDirect;

  const choiceMessage = response?.choices?.[0]?.message;
  if (choiceMessage) {
    const choiceCandidates = [choiceMessage.content, choiceMessage.text, choiceMessage.reasoning_content];
    const firstChoice = choiceCandidates.find((value) => typeof value === 'string' && value.trim().length > 0);
    if (firstChoice) return firstChoice;
  }

  return '';
}

function analyzeResponseQuality(prompt, content) {
  const raw = String(content || '').trim();
  const promptTokens = toNormalizedTokens(prompt);
  const contentTokens = toNormalizedTokens(raw);
  const promptSet = new Set(promptTokens);
  const overlapCount = contentTokens.filter((token) => promptSet.has(token)).length;
  const overlapRatio = contentTokens.length ? overlapCount / contentTokens.length : 0;
  const mathPrompt = /^\s*\d+\s*[-+*/]\s*\d+\s*$/i.test(String(prompt || ''));
  const containsNumber = /\d/.test(raw);
  const alphaNumCount = (raw.match(/[\p{L}\p{N}]/gu) || []).length;
  const repeatedCharRun = /(.)\1{8,}/.test(raw);
  const repeatedWordRun = /\b(\w+)\b(?:\s+\1){5,}/i.test(raw);
  const punctuationHeavy = raw.length >= 40 && ((raw.match(/["'`\-_=+*.,:;!?()[\]{}<>\/\\]/g) || []).length / raw.length) > 0.55;
  const lowSignalLongResponse = raw.length >= 120 && contentTokens.length === 0;
  const isLikelyOffTopic = (
    contentTokens.length >= 20 &&
    overlapRatio < 0.03 &&
    String(prompt || '').trim().length <= 64
  ) || (mathPrompt && !containsNumber);
  const isLikelyCorrupted = lowSignalLongResponse || (alphaNumCount < 8 && raw.length >= 40) || repeatedCharRun || repeatedWordRun || punctuationHeavy;

  return {
    overlapRatio: Number(overlapRatio.toFixed(4)),
    promptTokenCount: promptTokens.length,
    responseTokenCount: contentTokens.length,
    alphaNumCount,
    isLikelyOffTopic,
    isLikelyCorrupted,
    mathPrompt,
  };
}

function render() {
  renderThread(state, ui.thread, {
    'copy-msg': async (index) => {
      await navigator.clipboard.writeText(state.history[index]?.content || '');
      toast('Message copied');
    },
    'edit-msg': (index) => {
      document.getElementById(`edit-${index}`)?.classList.add('open');
    },
    'cancel-edit': (index) => {
      document.getElementById(`edit-${index}`)?.classList.remove('open');
    },
    'confirm-edit': (index) => {
      const area = document.querySelector(`#edit-${index} textarea`);
      if (!area) return;
      state.history[index].content = area.value;
      if (state.config.edit_resets) {
        state.history = state.history.slice(0, index + 1);
      }
      logEvent(state, 'message_edited', { index, role: state.history[index].role });
      saveState(state);
      render();
    },
    'rerun-msg': async (index) => {
      const entry = state.history[index];
      if (!entry || entry.role !== 'user') return;
      state.history = state.history.slice(0, index);
      ui.chatInput.value = entry.content;
      await sendMessage();
    },
    'delete-msg': (index) => {
      state.history.splice(index, 1);
      logEvent(state, 'message_deleted', { index });
      saveState(state);
      render();
    }
  });

  if (state.config.auto_scroll) {
    ui.thread.scrollTop = ui.thread.scrollHeight;
  }
}

async function refreshBridgeStatus() {
  try {
    const [registry, modelInfo] = await Promise.all([
      fetchRegistry(state.config.endpoint),
      fetchModelInfo(state.config.endpoint)
    ]);
    const rawModels = Array.isArray(registry.models) ? registry.models : [];
    state.models = rawModels.filter((item) => item.type === 'model' || item.provider);
    if (!state.models.length) {
      state.models = rawModels;
    }

    const inference = modelInfo && modelInfo.inference ? modelInfo.inference : {};
    const incomingOptions = Array.isArray(inference.engineOptions)
      ? inference.engineOptions
          .filter((entry) => entry && entry.id)
          .filter((entry) => {
            const environment = String(entry.environment || '').toLowerCase();
            if (environment === 'browser') return false;
            return entry.canInfer !== false;
          })
          .map((entry) => ({
            id: entry.id,
            label: entry.benchmarkActive
              ? `${entry.label || entry.id} (tested-best)`
              : (entry.label || entry.id),
          }))
      : [];
    if (incomingOptions.length) {
      availableEngineOptions = incomingOptions;
      renderEngineOptions();
    }

    const recommendedEngine = inference.activeEngine || availableEngineOptions[0]?.id || '';
    if (!state.config.backend || !availableEngineOptions.some((entry) => entry.id === state.config.backend)) {
      state.config.backend = recommendedEngine;
    }
    ui.cfg.backend.value = sanitizeBackend(state.config.backend);

    ui.bridgeDot.classList.remove('bad');
    ui.bridgeDot.classList.add('ok');
    ui.bridgeStatus.textContent = inference.activeEngine
      ? `Bridge online · engine: ${inference.activeEngine}`
      : 'Bridge online';
    fillSelect(ui.modelSelect, state.models.map((m) => ({ id: m.id, name: m.label || m.name || m.id })), 'name');
    if (!state.modelId || !state.models.some((m) => m.id === state.modelId)) {
      state.modelId = state.models[0]?.id || '';
    }
    ui.modelSelect.value = state.modelId;
  } catch (error) {
    ui.bridgeDot.classList.remove('ok');
    ui.bridgeDot.classList.add('bad');
    ui.bridgeStatus.textContent = `Bridge offline (${error.message})`;
    state.models = [];
    state.modelId = '';
    ui.modelSelect.innerHTML = '<option value="">No models</option>';
  }
}

async function sendMessage() {
  readConfigFromUi();
  const prompt = ui.chatInput.value.trim();
  if (!prompt) return;

  if (!state.modelId) {
    toast('Select a model first');
    return;
  }

  state.history.push({ role: 'user', content: prompt, createdAt: Date.now() });
  logEvent(state, 'chat_request_start', { modelId: state.modelId, promptChars: prompt.length });
  ui.chatInput.value = '';
  render();

  try {
    const t0 = performance.now();
    const messages = buildMessages(prompt);
    const payload = {
      model: state.modelId,
      engineId: state.config.backend,
      disable_engine_fallback: true,
      messages: messages,
      temperature: state.config.temperature,
      top_p: state.config.top_p,
      top_k: state.config.top_k,
      max_tokens: state.config.max_tokens,
      response_format: state.config.response_format,
      rag_enabled: state.config.rag_enabled,
      rag_k: state.config.rag_k
    };
    
    // Debug logging
    console.log('[chat-debug] sendMessage payload:', {
      model: state.modelId,
      engineId: state.config.backend,
      messagesCount: messages.length,
      messageTypes: messages.map(m => m.role),
      includeHistory: state.config.include_history,
      historyWindow: state.config.history_window,
      userPromptPreview: prompt.substring(0, 100),
      temperature: state.config.temperature,
      top_p: state.config.top_p,
      endpoint: state.config.endpoint
    });
    
    const response = await llmComplete(state.config.endpoint, payload);
    
    console.log('[chat-debug] llmComplete response:', {
      responseKeys: Object.keys(response),
      responseType: typeof response,
      hasContent: 'content' in response,
      hasText: 'text' in response,
      hasChoices: 'choices' in response
    });
    
    const durationMs = Math.round(performance.now() - t0);
    const content = extractResponseContent(response);
    const responseQuality = analyzeResponseQuality(prompt, content);
    const inspection = await runInspection({ content }, {
      strictMode: false,
      minContentLength: 16,
      maxCorruptionThreshold: 0.2,
    });
    const resolvedEngineId = response?._inference?.engineId || state.config.backend;
    
    console.log('[chat-debug] extracted content length:', content.length, 'first 100 chars:', content.substring(0, 100));
    console.log('[chat-debug] response-quality:', responseQuality);
    if (response?._inference?.fallbackApplied) {
      throw new Error(response?._inference?.fallbackReason || `Engine fallback was applied: requested '${state.config.backend}', resolved '${resolvedEngineId}'.`);
    }
    if (!content.trim()) {
      throw new Error(`Engine '${resolvedEngineId}' returned no textual content.`);
    }
    if (responseQuality.isLikelyOffTopic) {
      console.warn('[chat-debug] response appears off-topic for the prompt', {
        prompt,
        overlapRatio: responseQuality.overlapRatio,
        responsePreview: content.substring(0, 180),
      });
      throw new Error(`Engine '${resolvedEngineId}' returned an off-topic response. Please restart that runtime and retry.`);
    }
    if (responseQuality.isLikelyCorrupted || !inspection?.quality?.isValid) {
      const reasons = [
        responseQuality.isLikelyCorrupted ? 'heuristic corruption checks' : '',
        ...(inspection?.quality?.issues || []),
      ].filter(Boolean);
      throw new Error(`Engine '${resolvedEngineId}' returned low-quality output (${reasons.join('; ')}). Please restart that runtime and retry.`);
    }
    
    state.history.push({ role: 'assistant', content, createdAt: Date.now(), durationMs });
    logEvent(state, 'chat_request_success', {
      durationMs,
      outputChars: content.length,
      responseQuality,
      inferenceEngine: resolvedEngineId,
    });
  } catch (error) {
    const message = `⚠ ${error.message}`;
    console.error('[chat-debug] sendMessage error:', error);
    state.history.push({ role: 'assistant', content: message, createdAt: Date.now() });
    logEvent(state, 'chat_request_error', { error: error.message }, 'error');
  }

  saveState(state);
  render();
}

function exportJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

async function loadFiles(fileList) {
  const files = Array.from(fileList || []);
  for (const file of files) {
    const content = await file.text().catch(() => '');
    state.files.push({ name: file.name, content });
  }
  state.files = state.files.slice(-20);
  ui.fileList.textContent = state.files.length
    ? state.files.map((file) => file.name).join(', ')
    : 'No files attached';
  saveState(state);
}

function applyParameterProfile(profileId) {
  const profile = selectedProfile('parameterProfiles', profileId, null);
  if (!profile) return;
  ui.cfg.temperature.value = String(profile.temperature);
  ui.cfg.topP.value = String(profile.top_p);
  ui.cfg.topK.value = String(profile.top_k);
  ui.cfg.maxTokens.value = String(profile.max_tokens);
  syncSliderLabels();
}

function wireEvents() {
  ui.btnToggleConfig.addEventListener('click', () => ui.configPanel.classList.toggle('hidden'));
  ui.btnExportChat.addEventListener('click', () => {
    exportJson('chat-history.json', {
      generatedAt: new Date().toISOString(),
      config: state.config,
      modelId: state.modelId,
      history: state.history
    });
  });
  ui.btnNewChat.addEventListener('click', () => {
    state.history = [];
    logEvent(state, 'chat_new_session');
    saveState(state);
    render();
  });
  ui.btnCopyInput.addEventListener('click', async () => {
    await navigator.clipboard.writeText(ui.chatInput.value || '');
    toast('Input copied');
  });
  ui.btnSend.addEventListener('click', sendMessage);
  ui.chatInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await sendMessage();
    }
  });

  [ui.cfg.temperature, ui.cfg.topP, ui.cfg.topK].forEach((input) => {
    input.addEventListener('input', () => {
      syncSliderLabels();
      readConfigFromUi();
      saveState(state);
    });
  });

  Object.values(ui.cfg).forEach((input) => {
    if (!input || ['cfg-temperature', 'cfg-top-p', 'cfg-top-k'].includes(input.id)) return;
    input.addEventListener('change', () => {
      readConfigFromUi();
      saveState(state);
    });
    input.addEventListener('input', () => {
      if (input.tagName === 'TEXTAREA' || input.type === 'text' || input.type === 'number') {
        readConfigFromUi();
        saveState(state);
      }
    });
  });

  ui.cfg.parameterProfile.addEventListener('change', () => {
    applyParameterProfile(ui.cfg.parameterProfile.value);
    readConfigFromUi();
    saveState(state);
  });

  ui.modelSelect.addEventListener('change', () => {
    state.modelId = ui.modelSelect.value;
    saveState(state);
  });

  ui.fileInput.addEventListener('change', async () => {
    await loadFiles(ui.fileInput.files);
  });

  ui.btnRunSelfTests.addEventListener('click', () => {
    const checks = runChatSurfaceChecks(ui, state);
    checks.forEach((check) => addTestResult(state, check.name, check.passed, check.details));
    const passed = checks.filter((item) => item.passed).length;
    logEvent(state, 'chat_self_tests_completed', { passed, total: checks.length });
    saveState(state);
    toast(`Self-tests: ${passed}/${checks.length} passed`);
  });

  ui.btnExportTestResults.addEventListener('click', () => {
    exportJson('chat-test-results.json', { generatedAt: new Date().toISOString(), testResults: state.testResults });
  });

  ui.btnExportLogs.addEventListener('click', () => {
    exportJson('chat-logs.json', { generatedAt: new Date().toISOString(), logs: state.logs });
  });

  ui.btnSaveArtifacts.addEventListener('click', async () => {
    readConfigFromUi();
    const bundle = buildArtifactBundle(state);
    const filename = `chat-artifacts-${Date.now()}.json`;
    const ok = await saveArtifact(state.config.endpoint, 'agentic-ide/chat/tests/results', filename, JSON.stringify(bundle, null, 2));
    if (ok) {
      toast(`Saved artifact: ${filename}`);
      logEvent(state, 'artifact_saved', { filename });
    } else {
      toast('Artifact save failed');
      logEvent(state, 'artifact_save_failed', { filename }, 'error');
    }
    saveState(state);
  });
}

async function initCatalog() {
  try {
    state.catalog = await fetchCatalog();
  } catch {
    state.catalog = createDefaultState().catalog;
  }

  fillSelect(ui.cfg.promptProfile, state.catalog.prompts || []);
  fillSelect(ui.cfg.agentProfile, state.catalog.agents || []);
  fillSelect(ui.cfg.toolProfile, state.catalog.tools || []);
  fillSelect(ui.cfg.testProfile, state.catalog.tests || []);
  fillSelect(ui.cfg.parameterProfile, state.catalog.parameterProfiles || []);

  ui.cfg.promptProfile.value = state.config.prompt_profile_id;
  ui.cfg.agentProfile.value = state.config.agent_profile_id;
  ui.cfg.toolProfile.value = state.config.tool_profile_id;
  ui.cfg.testProfile.value = state.config.test_profile_id;
  ui.cfg.parameterProfile.value = state.config.parameter_profile_id;
}

async function main() {
  writeConfigToUi();
  await initCatalog();
  applyParameterProfile(state.config.parameter_profile_id);
  wireEvents();
  await refreshBridgeStatus();
  setInterval(refreshBridgeStatus, 10000);
  render();
  logEvent(state, 'chat_lab_initialized', { version: 2 });
  saveState(state);
}

main();
